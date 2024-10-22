import express, { Express, Request} from 'express';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';

import { callPythonScript } from './pyCaller';

dotenv.config();
const app: Express = express();
const uploadDir = '/app/uploads'

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Specify the views directory
app.set('views', 'views/'); // '/app/views/'

app.use(express.static('dist/client/')); // '/app/dist/client' //DON'T change this(to serve ts on client side)
app.use(express.static('public/')); // '/app/public/'

app.get('/', function(req, res) {
  res.render('assetSelect');
});

// File filter for multer
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fieldName = file.fieldname; // E.g., 'assetFile', 'imageFile', etc.
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedFileExtensions: Record<string, string[]> = {
    'Asset'   : ['.xodr', '.xosc'],
    'Document': ['.txt', '.pdf'],
    'License'     : ['.txt', '.pdf', '.md'],
    'Metadata'    : ['.json'],
    'Service'     : ['.bjson'],
    'Validation'  : ['.xqar','.xml','.json'],
    'Image'   : ['.png', '.jpg'],
    'Routing' : ['.geojson'],
    'Video'   : ['.mp4'],
    '3DPreview'   : ['.geojson']
  };

  // Check if the uploaded file's extension matches the allowed extensions
  if (allowedFileExtensions[fieldName]?.includes(fileExtension)) {
    cb(null, true);  // File is accepted
  } else {
    console.error(`Unrecognized file type for ${file.originalname}. Expected ${allowedFileExtensions[fieldName]?.join(', ')}`);
    var error : any = new Error(`Invalid file type for ${fieldName}: ${fileExtension}`); 
    error.status = 400; // set a status code for the error
    cb(error, false);  // Reject file  
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});

// Set up multer middleware with file size limit and file filter
const upload = multer({
  storage,
  //limits: { fileSize: 2000000 }, // 2 MB file size limit
  fileFilter
}).fields([
  { name: 'Asset' },
  { name: 'Document' },
  { name: 'License' },
  { name: 'Metadata' },
  { name: 'Service' },
  { name: 'Validation' },
  { name: 'Image' },
  { name: 'Routing' },
  { name: 'Video' },
  { name: '3DPreview' }
]);

// Route to render the form page
app.get('/', (req, res) => {
  res.render('assetSelect');
});

const processFile = (file: Express.Multer.File, did? : string) => {
  if(typeof did !== 'undefined')
    return {filename: file.originalname, type: file.fieldname, did : did};
  else
    return {filename: file.originalname, type: file.fieldname};
};

//handle reading, merging, and writing to the JSON file
const updateJsonFile = (filePath: string, newData: Array<{ filename: string, type: string }>, res: any) => {
  let existingFilesData: Array<{ filename: string, size: number, type: string }> = [];

  // Check if JSON file exists and parse existing data
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingFilesData = JSON.parse(fileContent); // Parse existing file data
    } catch (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error reading existing file data');
      return false;  // Early exit if error occurs
    }
  }

  //existing data + new data
  const updatedFileData = [...existingFilesData, ...newData];

  // Write the updated data back to the JSON file
  fs.writeFile(filePath, JSON.stringify(updatedFileData, null, 2), (err: any) => {
    if (err) {
      console.error('Error writing JSON file:', err);
      res.status(500).send('Error saving file data');
      return false;  // Early exit if error occurs
    }
  })
  return true; // Indicate success
};

// Route to handle form submission and file uploads
app.post('/submit', async (req, res) => {
  upload(req, res, function (err : any) {
  if (err) {
    // Capture multer errors and send them to the client
    return res.status(err.status || 500).json({ error: err.message });
  }
  // Check if files were uploaded
  if (!req.files || !req.body) {
      return res.status(400).send('No files uploaded or invalid form data');
  }
  const files = req.files as  {[fieldname: string]: Express.Multer.File[]};
  //an array to store file metadata
  const filesData: Array<{ filename: string, type: string , did? : string}> = [];
  // Loop through all the file fields
  for (const fieldName in files) {
    files[fieldName].forEach((file, index) => {
      if(fieldName != 'Asset'){
        filesData.push(processFile(file));  
      }
      else{
        const did = req.body.did;
        filesData.push(processFile(file, did));   //Asset file has did
      }
    });
  }

  const jsonFilePath = path.join(uploadDir, 'uploadedFiles.json');
  // Use the utility function to update the JSON file
  const success = updateJsonFile(jsonFilePath, filesData, res);
  //format_selector/main.py ../../upload/{assetname}.{ext} -config ../../configs -out ../../output
  callPythonScript()
  .catch((error: any) => {
      console.error('Error in Python script:', error);
      res.status(500).json({ error: error.message });
  });
  
  if (success) {
    res.status(200).json({ result: 'Files successfully uploaded and metadata saved' });
  }

  });
});

async function findFile(directory: string, filename: string) {
  const entries = await fs.promises.readdir(directory, { recursive: true, withFileTypes: true })
  for (let entry of entries) {
    if (entry.isFile() && entry.name == filename) {
      return path.join(entry.path, entry.name); 
    }
  }
  return null; //file not found
}

app.get('/download', async (req, res,) => { //async since an await is called within
  try {  
  //const filePath =   // path to the asset zip inside Docker
  const outputDir = '/app/output/';
  const assetZipPath = await findFile(outputDir, 'asset.zip');
  if (!assetZipPath) {
    return res.status(404).send('asset.zip not found');
  }

  res.download(path.resolve(assetZipPath), 'asset.zip', (err) => {
    if (err) {
      console.error('Error downloading the file:', err);
      res.status(500).send('Error downloading the file.');
    }
  });
} catch (error) {
  console.error('Error:', error);
  res.status(500).send('Internal Server Error');
}
});



app.listen(3000, () => console.log(`Running on ${3000} ⚡`));