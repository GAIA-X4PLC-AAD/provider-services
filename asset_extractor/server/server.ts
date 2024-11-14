import express, { Express, Request, Response } from 'express';
import {join, resolve} from 'path';
import helmet from 'helmet';
import dotenv from 'dotenv';


//import { callPythonScript, setClients } from './pyCaller';
import { callPythonScript } from './pyCaller';
import {processFile, updateJsonFile, findFile } from './assetExtractionUtils';
import { uploadDir, upload } from './multerUtils';


dotenv.config();
const app: Express = express();
//const uploadDir = '/app/uploads'

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Specify the views directory
app.set('views', 'views/'); // '/app/views/'

app.use(express.static('dist/client/')); // '/app/dist/client' //DON'T change this(to serve ts on client side)
app.use(express.static('public/')); // '/app/public/'

app.get('/', function(req:Request, res:Response) {
  res.render('assetSelect');
});

// Route to handle form submission and file uploads
app.post('/submit', async (req:Request, res:Response) => {
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
      if(fieldName != 'AssetData'){
        filesData.push(processFile(file));  
      }
      else{
        const did = req.body.did;
        filesData.push(processFile(file, did));   //Asset file has did
      }
    });
  }

  const jsonFilePath = join(uploadDir, 'uploadedFiles.json');
  // Use the utility function to update the JSON file
  const success = updateJsonFile(jsonFilePath, filesData, res);
  
  if (success) {
    res.status(200).json({ result: 'Files successfully uploaded and metadata saved' });
  }

  });
});

app.get('/pythonCall', (req:Request, res:Response) => {
  // Set up headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  callPythonScript(res)    
  .then(() => {
    // Send a custom event or message indicating the stream is complete
    res.write(`data:END_SSE_CONNECTION\n\n`);
    res.end(); // End the stream after script execution
  })
  .catch((error: any) => {
    console.error('Error in Python script:', error);
    res.write(`data: Error: ${error.message}\n\n`);
    res.end();
  });

  // If the client disconnects, end stream
  req.on('close', () => {
    res.end();
  });
});

app.get('/download', async (req: Request, res: Response) => { //async since an await is called within
  try {  
  //const filePath =   // path to the asset zip inside Docker
  const outputDir = '/app/output/';
  const assetZipPath = await findFile(outputDir, 'asset.zip');
  if (!assetZipPath) {
    return res.status(404).send('asset.zip not found');
  }

  res.download(resolve(assetZipPath), 'asset.zip', (err: Error) => {
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