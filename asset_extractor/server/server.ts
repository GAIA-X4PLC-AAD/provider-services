import express, { Express, Request, Response } from 'express';
import {join} from 'path';
import helmet from 'helmet';
import cors from 'cors'

//import { callPythonScript, setClients } from './pyCaller';
import { callPythonScript } from './pyCaller';
import * as  assetExtractionUtils from './assetExtractionUtils';
import { uploadDir, upload } from './multerUtils';


const app: Express = express();
//const uploadDir = '/app/uploads'

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', 'views/'); // '/app/views/'

app.use(express.static('dist/client/')); // '/app/dist/client'
app.use(express.static('public/')); // '/app/public/'

const corsOptions = {
  origin: '*', // Allow only your Angular app's origin
  methods: '*', // Allowed HTTP methods
  allowedHeaders: '*', // Allowed headers
  allowedMethods: '*'
};
app.use(cors(corsOptions));


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
        filesData.push(assetExtractionUtils.processFile(file));  
      }
      else{
        const did = req.body.did;
        filesData.push(assetExtractionUtils.processFile(file, did));   //Asset file has did
      }
    });
  }

  const jsonFilePath = join(uploadDir, 'uploadedFiles.json');
  // Use the utility function to update the JSON file
  const success = assetExtractionUtils.updateJsonFile(jsonFilePath, filesData, res);

  if (success) {
    res.status(200).json({ result: 'Files successfully uploaded and metadata saved' });
  }

  });
});

let jsonLDFilePath : string = ''; // jsonLD path comes posted from python; 
let combinedJsonPath: string = ''; 
app.route('/processJsonLDFile')
  .post((req : Request, res : Response) => {
    const { file_path, meta_data_location } = req.body;

    if (!file_path) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing jsonLD file path'});
    }

    combinedJsonPath = meta_data_location;
    jsonLDFilePath = file_path;
    res.status(200).json({ message: 'jsonLD File path received successfully', jsonLDFilePath });
  })
  .get((req : Request, res : Response) => {
    try {
      // Check if files exist
      if (!assetExtractionUtils.checkFileExists(jsonLDFilePath)) {
          return res.status(404).send('json metadata file not found');
      }
      const jsonData = assetExtractionUtils.openJsonFile(jsonLDFilePath);
      res.json(jsonData);
    } catch (error) {
      console.error('Error sending files:', error);
      res.status(500).send('Internal Server Error');
    }
  });

let shaclFilePath : string = ''; // shacl path comes posted from python; 
app.route('/processShaclFile')
  .post((req : Request, res : Response) => {
    const { file_path } = req.body;

    if (!file_path) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing shacl file path'});
    }

    shaclFilePath = file_path;
    res.status(200).json({ message: 'shacl File path received successfully', shaclFilePath });
  })
  .get((req : Request, res : Response) => {
    try {
      // Check if files exist
      if (!assetExtractionUtils.checkFileExists(shaclFilePath)) {
          return res.status(404).send('shacl file not found');
      }
      res.set('Content-Type', 'application/x-turtle');
      res.sendFile(shaclFilePath);
    } catch (error) {
      console.error('Error sending files:', error);
      res.status(500).send('Internal Server Error');
    }
  });


app.route('/processCombinedJsonFile')
  .post((req : Request, res : Response) => {
    const {jsonContent } = req.body;

    if (!jsonContent) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing combined json content'});
    }

     // Ensure combinedJsonPath has been set by a previous Python POST
     if (!combinedJsonPath) {
      return res.status(400).json({
        error: 'Path Not Set',
        message: 'Combined JSON path has not been provided',
      });
    }

    try{
      //write the enhanced json to the passed location from wizard_caller py
      assetExtractionUtils.writeFile(combinedJsonPath,  JSON.stringify(jsonContent, null, 2));
      res.status(200).json({ message: 'combined json file was received successfully'});
    } catch (err) {
      console.error('Error writing combined JSON:', err);
      res.status(500).json({error: 'Internal Server Error', message: 'Failed to write the combined JSON'});
    }
  })
  .get((req: Request, res: Response) => {
    if (assetExtractionUtils.checkFileExists(combinedJsonPath)) {
      res.status(200).json({ message: 'File is ready on disk' });
    } else {
      res.status(204).send()// File not yet available
    }
  });


app.get('/pythonCall', async (req:Request, res:Response) => {
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

let sdWizardUrl: string | null = null; // Stores the URL for the wizard when triggered
app.route('/openSdWizard')
  .post((req : Request, res : Response) => {
      // Python triggers this with a POST request
      sdWizardUrl = 'http://localhost:80/upload'; // Set the wizard URL
      res.status(200).send('SD Wizard trigger received');
  })
  .get((req : Request, res : Response) => {
      // Client polls this with a GET request
      if (sdWizardUrl) {
          res.json({ command: 'openSdWizard', url: sdWizardUrl });
          sdWizardUrl = null; // Reset the URL after responding
      } else {
          res.status(204).send(); // No content to indicate no trigger yet
      }
  });



app.get('/download', async (req: Request, res: Response) => { //async since an await is called within
  try {  
  //const filePath =   // path to the asset zip inside Docker
  const outputDir = '/app/output/';
  const assetZipPath = await assetExtractionUtils.findFile(outputDir, 'asset.zip');
  if (!assetZipPath) {
    return res.status(404).send('asset.zip not found');
  }

  res.download(assetZipPath, 'asset.zip', (err: Error) => {
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