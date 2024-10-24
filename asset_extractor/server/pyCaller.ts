import { spawnSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Check if a script exists
function checkFileExists(scriptPath: string): boolean {
  try {
    fs.accessSync(scriptPath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Install Python requirements from each folder
function installRequirementsSync(pythonPath: string, baseDir: string): void {
  const folders = fs.readdirSync(baseDir);

  folders.forEach((folder : any) => {
    const reqPath = path.join(baseDir, folder, 'requirements.txt');
    if (checkFileExists(reqPath)) {
      console.log(`Installing dependencies from ${reqPath}...`);
      runPythonSync(pythonPath, ['-m', 'pip', 'install', '-r', reqPath]);
      console.log(`Dependencies from ${reqPath} installed.`);
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

// Run a Python script asynchronously with Promises
function runPythonAsync(pythonPath: string, scriptPath: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    args.unshift(scriptPath);
    const py = spawn(pythonPath, args, { stdio: 'pipe' });

    py.stdout.on('data', (data: any) => {
      console.log(`Output: ${data}`);
    });

    py.stderr.on('data', (data: any) => {
      console.error(`Error: ${data}`);
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

// Call Python scripts sequentially
export async function callPythonScript(): Promise<void> {
  try {
    // Run the gitRepoPuller.py to clone the repo synchronously
    const pythonPath = '/app/python/venv/bin/python3';
    const gitToolsCloner = '/app/python/git_tools_cloner.py';
    console.log('Cloning git repo...');
    runPythonSync(pythonPath, [gitToolsCloner]);
    console.log('Repo cloned successfully.');

    const mainScriptPath = '/app/python/tools/asset_extraction/main.py';
    const toolsDir = '/app/python/tools';
    // Install requirements in all folders after cloning synchronously
    console.log('Installing Python requirements...');
    installRequirementsSync(pythonPath, toolsDir);

    // Check if main.py exists after cloning
    if (!checkFileExists(mainScriptPath)) {
      throw new Error('main.py script not found after cloning.');
    }

    // Arguments for main.py
    const uploadedAssetDir = '/app/uploads/';
    const files : string[]  = fs.readdirSync(uploadedAssetDir);
    const xodrFiles = files.filter(file => path.extname(file) === '.xodr' || path.extname(file) === '.xosc');
    const uploadedAssetFile = path.join(uploadedAssetDir, xodrFiles[0]);
    
    const configPath = '/app/python/tools/configs';
    const outputPath = '/app/output';
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    const mainArgs = [uploadedAssetFile, '-config', configPath, '-out', outputPath];

    // Run main.py asynchronously with Promises
    console.log('Running main.py...');
    await runPythonAsync(pythonPath, mainScriptPath, mainArgs);
    console.log('main.py executed successfully.');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
