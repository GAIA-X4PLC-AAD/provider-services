import { spawnSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

import {checkFileExists, createFolder, sendMsgEvent} from './assetExtractionUtils'; 

const pythonProjectRoot = process.env.PYTHON_PROJECT_ROOT || '/app/python';
const toolsDir = path.join(pythonProjectRoot, 'tools');


// Run a Python command synchronously
export function runPython(args: string[]): void {
  //dotenv.config({path: path.resolve(__dirname+'../.env')});
  const py = spawnSync('python', args, { stdio: 'inherit' });
  if (py.error) {
    throw py.error;
  }
  if (py.status !== 0) {
    throw new Error(`Python command exited with code: ${py.status}`);
  }
}

export function runPythonAsync(args: string[],  res: any): Promise<void> {
  return new Promise((resolve, reject) => {
    //const py = spawn(pythonPath, args, { stdio: 'pipe' });
    console.log(args);
    const py = spawn('python', args, {
      stdio: 'pipe',
      cwd: toolsDir, // Set working directory to /app/python/tools
    /*  env: {
        ...process.env, // inherit existing env vars
      },
    */});
    if (py.stdout) {
      py.stdout.on('data', (data: any) => {
        sendMsgEvent(res, data, true);
      });
    }

    if (py.stderr) { // logging in tools py scripts outputs to sys.stderr!
      py.stderr.on('data', (data: any) => {
        sendMsgEvent(res, data, true);
      });
    }

    py.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code: ${code}`));
      }
    });
  });
}

//clone provider tools Repo
export function cloneGitTools(res: any, gitToolsCloner: string): void {
  // Send the initial message
  sendMsgEvent(res, `Cloning tools from GitHub...`);
  runPython([gitToolsCloner]);
  // Send a message after cloning
  sendMsgEvent(res, `Tools successfully cloned.`);
}

// Install Python requirements from each folder
export function installRequirements( res: any, baseDir: string): void {
  sendMsgEvent(res, `Installing Python requirements...`);
  const folders = fs.readdirSync(baseDir);
  
  folders.forEach((folder : any) => {
    const reqPath = path.join(baseDir, folder, 'requirements.txt');
    if (checkFileExists(reqPath)) {
      sendMsgEvent(res, `Installing dependencies from ${reqPath}...`);
      
      //install
      runPython(['-m', 'pip', 'install', '-r', reqPath]);
      //runPythonAsync(pythonPath, ['-m', 'pip', 'install', '-r', reqPath],res);
      sendMsgEvent(res, `Dependencies from ${reqPath} were successfully installed.`);
    }
  });
}

export async function callPythonScript(res: any): Promise<void> {
  try {
    //clone git tools and install requiremens only if not already done!
    if (fs.existsSync(toolsDir) && fs.readdirSync(toolsDir).length > 0) {
      sendMsgEvent(res, `Tools already exist in ${toolsDir}. Skipping Git pull.`);
    } else {
      // Run the gitRepoPuller.py to clone the repo synchronously
      const gitToolsCloner = path.join(pythonProjectRoot, 'git_tools_cloner.py');
      cloneGitTools(res, gitToolsCloner);

      const mainScriptPath = path.join(pythonProjectRoot, 'tools', 'asset_extraction','main.py');
      if (!checkFileExists(mainScriptPath)) {
        throw new Error('main.py script not found after cloning.');
      }
      // Install Python requirements
      installRequirements(res, toolsDir);
    }

    //run the main.py that runs whole py pipeline
    const uploadedAssetDir = '/app/uploads/';
    const files: string[] = fs.readdirSync(uploadedAssetDir);
    const assetFiles = files.filter(file => path.extname(file) === '.xodr' || path.extname(file) === '.xosc'|| path.extname(file) === '.zip'|| path.extname(file) === '.crg');
    const uploadedAssetFile = path.join(uploadedAssetDir, assetFiles[0]);
    
    const configPath = '/app/python/tools/configs';
    const outputPath = '/app/output';
    createFolder(outputPath);
    //add to run the asset extractor module
    const mainArgs = [
      '-m', 'asset_extraction.main',
      uploadedAssetFile,
      '-config', configPath,
      '-out', outputPath
    ];
    sendMsgEvent(res, `Running main.py...`);
    await runPythonAsync(mainArgs, res); 
    sendMsgEvent(res, `main.py executed successfully.`);
 } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

