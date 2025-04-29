import {join} from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

//Multer Configuration
import { Express } from 'express'

export function sendMsgEvent( res : any, msg: any, multiLines: Boolean = false){
  console.log(msg.toString()); //Debug
  if(!multiLines)
    res.write(`data:${msg.toString()}\n\n`);
  else {
    const lines = msg.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        res.write(`data:${line}\n\n`);
      }
    });
  }
}

export function createFolder(dirPath: string){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

const typeToCategoryMap: Record<string, string> = {
  "Asset": "isSimulationData",
  "Document": "isDocumentation",
  "Image": "isVisualization",
  "Video": "isVisualization",
  "3DPreview": "isVisualization",
  "Routing": "isVisualization",
  "MetaData": "isMetadata",
  "Validation": "isValidation",
  "License": "isLicense",
  "Service": "isOther"
};

/**
 * Creates a did:web identifier using your domain and a generated UUID.
 * @param domain - Your domain name (e.g., "myapp.com")
 * @returns A did:web identifier (e.g., "did:web:myapp.com:uuid")
 */
function createDidWeb(domain: string): string {
  const cleanedDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const uuid = uuidv4();

  return `did:web:${cleanedDomain}:${uuid}`;
}


export const processFile = (file: Express.Multer.File, withDid: boolean, licenseType? : string) => {
  const typeCategory = typeToCategoryMap[file.fieldname] || 'unknown';
  console.log(licenseType);
  if(withDid) //asset
  {
    const did = createDidWeb("trianGraphicsAssetExtractor.de");
    return {filename: file.originalname, type: file.fieldname, category: typeCategory , did : did};
  }
  else{
  if(typeof licenseType !== 'undefined') //license
    return {filename: file.originalname, type: file.fieldname, category: typeCategory, license_type: licenseType};
  else
    return {filename: file.originalname, type: file.fieldname, category: typeCategory};
  }
};

export function openJsonFile(filePath : string) : any
{
  if (!fs.existsSync(filePath)) {
    // Return an empty array instead of throwing an error if the file doesn't exist
    return [];
  }

  try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
  } catch (err : any) {
      throw new Error(`Error reading or parsing JSON file: ${err.message}`);
  }
}
//handle reading, merging, and writing to the JSON file
export const updateJsonFile = (filePath: string, newData: Array<{ filename: string, type: string }>, res: any) => {
  try {
    let existingFilesData: Array<{ filename: string, size: number, type: string }> = [];
     // get existing data or an empty array if file does not exist
    existingFilesData = openJsonFile(filePath);
  
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
  } catch (err : any) {
    console.error('Error reading or parsing JSON file:', err.message);
    // Handle the error, e.g., log, notify the user, or return an error response
    return false
  }
    return true; // success
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

//--------------------------------sdCreationWizard--------------------------------------//
export const sharedStoragePath = "/app/storage/";

export const writeFile = (filePath: string, fileContent: string): any => {
  fs.writeFileSync (filePath, fileContent);
};

