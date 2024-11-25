import express, { Express, Request, Response, NextFunction  } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import { argv } from 'node:process';

import { callPythonScript } from './pyCaller';

//scripts attributes validator
import { schema } from '../python/ScriptsAttribsSchema'; 
const ajv = new Ajv();
const validate = ajv.compile(schema);

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

app.get('/search', async (req, res) => {
  const jsonData = {};  // initialize an empty object to hold merged scripts attribs settings 
  const directoryPath = '/app/python/scripts_settings/';
  try {
      const scriptAttribsfolders = await fs.promises.readdir(directoryPath);      
      for (const folder of scriptAttribsfolders) {
          const folderPath = path.join(directoryPath, folder); 
          const scriptAttribsfiles = await fs.promises.readdir(folderPath);
          
          const jsonFileData = {};
          for (const file of scriptAttribsfiles) {
              const filePath = path.join(folderPath, file);
              if (path.extname(file) === '.json') {
                  try {
                      const data = await fs.promises.readFile(filePath, 'utf8');
                      const parsedData = JSON.parse(data);                   
                      Object.assign(jsonFileData, parsedData);
                  } catch (err) {
                      console.error(`Error reading or parsing JSON file ${file}:`, err);
                      continue;  // skip files that fail to read or parse
                  }
              }       
          }

          const folderJsonData = { [folder]: jsonFileData };  // use dynamic key
          // validate the JSON data
          const valid = validate(folderJsonData);
          if (!valid) {
              console.error(`Validation error in folder ${folder}:`, validate.errors);
              continue;  // skip invalid JSON folder
          }
          Object.assign(jsonData, folderJsonData);
        }
  } catch (err) {
      console.error('Error reading directory or files:', err);
      return res.status(500).send('Error reading directory or files');
  }

  res.render('extendedSearch', { jsonData });
});
app.post('/searchSubmit', async (req, res) => {
  if (!req.body) {
    return res.status(400).send('invalid form data');
  }
  const selectedElement = req.body.selectedScript;
  const folderName : string = selectedElement.substring(0, selectedElement.indexOf(':'));
  const scriptName : string = selectedElement.substring(selectedElement.indexOf(':') + 1, selectedElement.length);
  const attribs: { [key: string]: any } = {};
  for (const key in req.body) {
    if (key != 'selectedScript') {
        attribs[key] = req.body[key];    
    }
  };

  //search data
  const dataUrls = argv.slice(2); // Skip the first two default args
  if (dataUrls.length === 0) {
    console.error('No data URLs provided. Pass them as arguments.');
    res.status(500).json({ error: 'No data URLs provided. Pass them as arguments.' });
  } else {
    //add  data to be search to attribs
    attribs["dataUrls"] = dataUrls;
  }

  callPythonScript(path.join(folderName,scriptName), attribs)
  .then((result: any) => {
      res.json({ message: 'search result received successfully', result: result || [] });
  })
  .catch((error: any) => {
      console.error('Error in Python script:', error);
      res.status(500).json({ error: error.message });
  });
});

app.listen(3000, () => console.log(`Running on ${3000} ⚡`));