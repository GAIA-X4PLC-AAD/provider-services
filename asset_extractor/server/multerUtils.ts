import {extname} from 'path';

//Multer Configuration
import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'

import {createFolder} from './assetExtractionUtils'; 

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
export const uploadDir = '/app/uploads'

// File filter for multer
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fieldName = file.fieldname; // E.g., 'AssetData', 'Image', etc.
    const fileExtension = extname(file.originalname).toLowerCase();
    const allowedFileExtensions: Record<string, string[]> = {
      'AssetData'   : ['.xodr', '.xosc'],
      'Document': ['.txt', '.pdf'],
      'License': [''], // extension-less
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
    { name: 'AssetData' },
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
  
