import { spawnSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {checkFileExists, createFolder, sendMsgEvent} from './assetExtractionUtils'; 

const pythonPath = '/app/python/venv/bin/python3';

// Run a Python command synchronously
function runPython(pythonPath: string, args: string[], res: any, getSTDIO: Boolean = false): void {
  const py = spawnSync(pythonPath, args, { stdio: 'inherit' });

  if (py.error) {
    throw py.error;
  }
  if (py.status !== 0) {
    throw new Error(`Python command exited with code: ${py.status}`);
  }
}

function runPythonAsync(pythonPath: string, args: string[],  res: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const py = spawn(pythonPath, args, { stdio: 'pipe' });

    if (py.stdout) {
      py.stdout.on('data', (data: any) => {
        const lines = data.toString().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            sendMsgEvent(res, line);
          }
        });
      });
    }

    if (py.stderr) {
      py.stderr.on('data', (data: any) => {
        sendMsgEvent(res, `Error: ${data.toString()}`);
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
function cloneGitTools(res: any, gitToolsCloner: string){
   // Send the initial message
   sendMsgEvent(res, `Cloning git repo...`);

   //clone
   runPython(pythonPath, [gitToolsCloner],res);
   //runPythonAsync(pythonPath, [gitToolsCloner],res);
   // Send a message after cloning
   sendMsgEvent(res, `Repo cloned successfully.`);
}

// Install Python requirements from each folder
function installRequirements(pythonPath: string, baseDir: string, res: any): void {
  sendMsgEvent(res, `Installing Python requirements...`);
  const folders = fs.readdirSync(baseDir);
  
  folders.forEach((folder : any) => {
    const reqPath = path.join(baseDir, folder, 'requirements.txt');
    if (checkFileExists(reqPath)) {
      sendMsgEvent(res, `Installing dependencies from ${reqPath}...`);
      
      //install
      runPython(pythonPath, ['-m', 'pip', 'install', '-r', reqPath],res);
      //runPythonAsync(pythonPath, ['-m', 'pip', 'install', '-r', reqPath],res);
      sendMsgEvent(res, `Dependencies from ${reqPath} were successfully installed.`);
    }
  });
}

export async function callPythonScript(res: any): Promise<void> {
  try {
   
    // Run the gitRepoPuller.py to clone the repo synchronously
    const gitToolsCloner = '/app/python/git_tools_cloner.py';
    cloneGitTools(res, gitToolsCloner);

    const mainScriptPath = '/app/python/tools/asset_extraction/main.py';
    if (!checkFileExists(mainScriptPath)) {
      throw new Error('main.py script not found after cloning.');
    }

    // Install Python requirements
    const toolsDir = '/app/python/tools';
    installRequirements(pythonPath, toolsDir, res);

 

    //run the main.py that runs whole py pipeline
    const uploadedAssetDir = '/app/uploads/';
    const files: string[] = fs.readdirSync(uploadedAssetDir);
    const xodrFiles = files.filter(file => path.extname(file) === '.xodr' || path.extname(file) === '.xosc');
    const uploadedAssetFile = path.join(uploadedAssetDir, xodrFiles[0]);
    
    const configPath = '/app/python/tools/configs';
    const outputPath = '/app/output';
    createFolder(outputPath);
    const mainArgs = [uploadedAssetFile, '-config', configPath, '-out', outputPath];
    mainArgs.unshift(mainScriptPath);
    sendMsgEvent(res, `Running main.py...`);
    //runPython(pythonPath, mainArgs, res, true);
    await runPythonAsync(pythonPath, mainArgs, res);
    sendMsgEvent(res, `main.py executed successfully.`);

 } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

