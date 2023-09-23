import { useEffect, useLayoutEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";
/** @type {import('@webcontainer/api').WebContainer} */
import { files } from '../../files';

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";

// Setting up WebContainer
let webcontainerInstance;

async function installDependencies(){
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);

  installProcess.output.pipeTo(new WritableStream({
    write(data){
      console.log(data);
    }
  }));
  return installProcess.exit;
}


export default function Home() {

  // Setting up WebContainer
  useEffect(()=> {
    async function getPackage(){
      console.log(files['index.js'].file.contents);

      // Makes sure that webcontainer only boots once
      if (!webcontainerInstance){
        webcontainerInstance = await WebContainer.boot();
      }
      await webcontainerInstance.mount(files);

      const exitCode = await installDependencies();
      if (exitCode !== 0) {
        throw new Error('Installation Failed');
      };

      startDevServer();
    }
    getPackage();
  }, []);

 

  const [testCases, setTestCases] = useState([]);
  const [problem, setProblem] = useState("");
  const [testOutput, setTestOutput] = useState([]);
  const [frameUrl, setframeUrl] = useState("");

   // Function to write to Express' index.js
  function writeContent(content){

    /** @param {string} content */
    async function write(content){
      await webcontainerInstance.fs.writeFile('/index.js', content);
      const file = await webcontainerInstance.fs.readFile('/index.js', 'utf-8');
      //await webcontainerInstance.mount(file);
      console.log(file);
    };
    write(content);
    console.log(content);
  }

  async function startDevServer() {
    // Start Express app
    await webcontainerInstance.spawn('npm', ['run', 'start']);
  
    // Wait for server-ready event
    webcontainerInstance.on('server-ready', (port, url) => {
      setframeUrl(url);
    })
  }

  var code = "import express from 'express'; const app = express(); const port = 3111; app.get('/', (req, res) => {res.send('solution put will go here!!!!!🥳');}); app.listen(port, () => {console.log(\`App is live at http://localhost:\${port}\`);});"
  
  useEffect(() => {
    setTestCases([
      "x=[3, 1, 4] \n Answer: 2 \n Explanation: 2 is missing from this array, this array otherwise contains the numbers 1 through 4",
      "x=[2, 5, 3, 1, 8, 9, 7, 6] \n Answer: 4 \n Explanation: 4 because this array contains 1 through 9 but not 4",
      "x=[1, 2, 3, 4] \n Answer: 5 \n Explanation: 5 because this array contains 1 through 5 except for 5",
    ]);
    setProblem(
      "Given an array x containing 1, ..., n but missing 1, find which integer is missing"
    );
    setTestOutput([
      {
        case: "x=[1, 3, 4]",
        correct: true,
        userOutput: 2,
      },
      {
        case: "x=[12, 3, 5, 1, 8, 9, 7, 6, 10, 11, 2]",
        correct: false,
        userOutput: 5,
      },
      {
        case: "x=[3, 4, 5, 2]",
        correct: false,
        userOutput: 2,
      },
    ]);
  }, []);

  return (
    <>
      <h1 className="text-center text-3xl">Code Race</h1>
      <br />
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-1">
          <h3 className="text-2xl">Problem</h3>
          <ProblemStatement problem={problem} />
          <br />
          <h3 className="text-2xl">Test Cases</h3>
          <br />
          <TestCases cases={testCases} />
        </div>
        <div class="col-span-1">
          <h3 className="text-2xl">JavaScript Code</h3>
          <Solution />
          {/*webcontainerInstance? writeContent(code) : null*/}
          <iframe
            src = {frameUrl}
          />
          <br />
          <button className="btn btn-primary">Submit</button>
          <br />
          <br />
          <TestOutput tests={testOutput} />
        </div>
      </div>
    </>
  );
}
