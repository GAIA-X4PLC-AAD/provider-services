import {join} from 'path';
import * as fs from 'fs';

//Multer Configuration
import { Express } from 'express'

export function sendMsgEvent( res : any, msg: string, multiLines: Boolean = false){
  console.log(msg); //Debug
  if(!multiLines)
    res.write(`data:${msg}\n\n`);
}

export function createFolder(dirPath: string){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export const processFile = (file: Express.Multer.File, did? : string) => {
  if(typeof did !== 'undefined')
    return {filename: file.originalname, type: file.fieldname, did : did};
  else
    return {filename: file.originalname, type: file.fieldname};
};

//handle reading, merging, and writing to the JSON file
export const updateJsonFile = (filePath: string, newData: Array<{ filename: string, type: string }>, res: any) => {
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
  
export async function findFile (directory: string, filename: string) {
  const entries = await fs.promises.readdir(directory, { recursive: true, withFileTypes: true })
  for (let entry of entries) {
    if (entry.isFile() && entry.name == filename) {
      return join(entry.path, entry.name); 
    }
  }
  return null; //file not found
}


//----------------------------------pyCallerUtils-----------------------------------------//
// Check if a script exists
export function checkFileExists(scriptPath: string): boolean {
    try {
      fs.accessSync(scriptPath, fs.constants.F_OK);
      return true;
    } catch (err) {
        return false;
    }
}