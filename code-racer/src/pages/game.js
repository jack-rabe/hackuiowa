import { useEffect, useState } from "react";

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";

import { useEffect, useLayoutEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";
/** @type {import('@webcontainer/api').WebContainer} */
import { files } from '../../files';

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

export default function Game() {
  const [testCases, setTestCases] = useState({});
  const [problem, setProblem] = useState("");
  const [testCasesVisible, setTestCasesVisible] = useState(false);
  const [userCode, setUserCode] = useState("function solution(x) {\n\n}");

  const [userOutputs, setUserOutputs] = useState([]);
  const [testInputs, setTestInputs] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);

  const [frameUrl, setframeUrl] = useState("");


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

  // TODO may want to enable 'light mode' vs 'dark mode'

  useEffect(() => {
    fetch("http://localhost:3333/question")
      .then((res) => {
        if (res.status != 200) {
          console.log("Backend is currently down");
          return;
        } else {
          return res.json();
        }
      })
      .then((x) => {
        setProblem(x.question);
        setTestCases({
          input: x.sampleInput,
          solution: x.solution,
          explanation: x.explanation,
        });

        setTestInputs(x.inputs);
      });

    // TODO don't hard-code the body we send to the BE
    const cur_body = {
      userId: "dconway",
      responses: ["2", "3"],
    };

    // TODO replace this with the actual code results the user has
    setUserOutputs(["1", "2"]);

    fetch("http://localhost:3333/answer", {
      method: "POST",
      body: JSON.stringify(cur_body),
    })
      .then((res) => {
        if (res.status != 200) {
          console.log("Backend is currently down");
          return;
        } else {
          return res.json();
        }
      })
      .then((x) => {
        // TODO test that this works correctly when we have actually won
        if (x.hasWon) {
          alert("Congratulations! You solved the problem!");
        }
        setMissedQuestions(x.missedQuestions);
      });
  }, []);

  return (
    <>
      <h1 className="text-center text-3xl">Code Race</h1>
      <br />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <h3 className="text-2xl">Problem</h3>
          <ProblemStatement problem={problem} />
          <br />
          <h3 className="text-2xl">Sample Test Cases</h3>
          <br />
          <TestCases cases={testCases} />
        </div>
        <div className="col-span-1">
          <h3 className="text-2xl">JavaScript Code</h3>
          <Solution userCode={userCode} setUserCode={setUserCode} />
          <br />
          <button
            className="btn btn-primary"
            onClick={() => setTestCasesVisible(true)}
          >
            Submit
          </button>
          <br />
          <br />
          {testCasesVisible && (
            <TestOutput
              userOutputs={userOutputs}
              testInputs={testInputs}
              missedQuestions={missedQuestions}
            />
          )}
        </div>
      </div>
    </>
  );
}
