import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as fs from 'fs';

function checkScriptExists(scriptPath: string): boolean {
  try {
    fs.accessSync(scriptPath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export async function callPythonScript(scriptSubPath:string, attribs: any): Promise<string> {
  return new Promise((resolve, reject) => {

    // Call the python process and pass the data as a command line argument.
    const scriptPath = '/app/python/scripts/'+ scriptSubPath + '.py';
    // Determine the correct path for the Python executable
    const pythonPath = '/app/python/venv/bin/python';

    
    if (!checkScriptExists(scriptPath)) {
      return Promise.reject(new Error('python script is not found on the server.'));
    }

    const py : ChildProcessWithoutNullStreams = spawn(pythonPath, [scriptPath], { stdio: "pipe" });

    // write the stringified JSON data to the stdin of the Python script
    const stringifiedData = JSON.stringify(attribs);
    py.stdin.write(stringifiedData);
    py.stdin.end();
    let resultString = '';
    // As the stdout data stream is chunked, we need to concat all the chunks.
    py.stdout.on('data', function (stdData: Buffer) {
      resultString += stdData.toString();
    });

    py.stdout.on('end', function () {
      try {
        // parse the string as JSON when stdout data stream ends
        const resultData = JSON.parse(resultString);
        const result = resultData['result'];
        resolve(result);
      } catch (parseError) {
        console.error('Error in parsing JSON data:', parseError);
        reject(parseError);
      }
    });

    // Handle errors from the python process
    py.on('error', function (err) {
      console.error('Error executing Python script:', err);
      reject(err);
    });

    // Handle errors when spawning the python process
    py.on('spawnError', function (err) {
      console.error('Error spawning Python process:', err);
      reject(err);
    });

    // Handle process exit
    py.on('exit', function (code) {
      console.log('Python process exited with code:', code);
    });
  });
}