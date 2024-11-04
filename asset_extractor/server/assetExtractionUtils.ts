import {extname, join} from 'path';
import * as fs from 'fs';

//Multer Configuration
import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

export const uploadDir = '/app/uploads'

export function createFolder(dirPath: string){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
// File filter for multer
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fieldName = file.fieldname; // E.g., 'assetFile', 'imageFile', etc.
    const fileExtension = extname(file.originalname).toLowerCase();
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
destination: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
    //const uploadDir = path.join(__dirname, 'uploads');
    createFolder(uploadDir)
    cb(null, uploadDir);
},
filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    cb(null, file.originalname);
}
});
  
  // Set up multer middleware with file size limit and file filter
export const upload = multer({
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