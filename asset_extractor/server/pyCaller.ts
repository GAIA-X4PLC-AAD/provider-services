import { spawnSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Check if a script exists
import {checkFileExists, createFolder} from './assetExtractionUtils'; 

// Install Python requirements from each folder
function installRequirementsSync(pythonPath: string, baseDir: string, res: any): void {
  const folders = fs.readdirSync(baseDir);

  folders.forEach((folder : any) => {
    const reqPath = path.join(baseDir, folder, 'requirements.txt');
    if (checkFileExists(reqPath)) {
      res.write(`data:Installing dependencies from ${reqPath}...\n\n`);
      runPythonSync(pythonPath, ['-m', 'pip', 'install', '-r', reqPath]);
      res.write(`data:Dependencies from ${reqPath} installed.\n\n`);
    }
  });
}

// Run a Python command synchronously
function runPythonSync(pythonPath: string, args: string[]): void {
    const result = spawnSync(pythonPath, args, { stdio: 'inherit' });
  
    if (result.error) {
      throw result.error;
    }
  
    if (result.status !== 0) {
      throw new Error(`Python command exited with code: ${result.status}`);
    }
  }

function runPythonAsync(pythonPath: string, scriptPath: string, args: string[], res: any): Promise<void> {
  return new Promise((resolve, reject) => {
    args.unshift(scriptPath);
    const py = spawn(pythonPath, args, { stdio: 'pipe' });

    py.stdout.on('data', (data: any) => {
      console.log(`Output: ${data}`);
      //res.write(`data: ${data.toString().trim()}\n\n`);
      res.write(`data: Output: ${data.toString().trim()}\n\n`);
    });

    py.stderr.on('data', (data: any) => {
      res.write(`data: Error: ${data.toString().trim()}\n\n`);
    });

    py.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code: ${code}`));
      }
    });
  });
}

export async function callPythonScript(res: any): Promise<void> {
  try {
    // Send the initial message
    res.write(`data: Cloning git repo...\n\n`);

    // Run the gitRepoPuller.py to clone the repo synchronously
    const pythonPath = '/app/python/venv/bin/python3';
    const gitToolsCloner = '/app/python/git_tools_cloner.py';
    runPythonSync(pythonPath, [gitToolsCloner]);

    // Send a message after cloning
    res.write(`data: Repo cloned successfully.\n\n`);

    const mainScriptPath = '/app/python/tools/asset_extraction/main.py';
    const toolsDir = '/app/python/tools';
    res.write(`data: Installing Python requirements...\n\n`);
    installRequirementsSync(pythonPath, toolsDir, res);

    if (!checkFileExists(mainScriptPath)) {
      throw new Error('main.py script not found after cloning.');
    }

    const uploadedAssetDir = '/app/uploads/';
    const files: string[] = fs.readdirSync(uploadedAssetDir);
    const xodrFiles = files.filter(file => path.extname(file) === '.xodr' || path.extname(file) === '.xosc');
    const uploadedAssetFile = path.join(uploadedAssetDir, xodrFiles[0]);
    
    const configPath = '/app/python/tools/configs';
    const outputPath = '/app/output';
    createFolder(outputPath);
    const mainArgs = [uploadedAssetFile, '-config', configPath, '-out', outputPath];

    // Send a message before running main.py
    res.write(`data: Running main.py...\n\n`);

    await runPythonAsync(pythonPath, mainScriptPath, mainArgs, res);

    // Send a final success message
    //res.write(`data: main.py executed successfully.\n\n`);

 } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

