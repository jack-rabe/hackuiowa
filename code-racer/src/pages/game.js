import { useEffect, useState } from "react";

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";

import { WebContainer } from "@webcontainer/api";
/** @type {import('@webcontainer/api').WebContainer} */
import { files } from '../../files';

// Setting up WebContainer
let webcontainerInstance;

async function installDependencies(){
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);

  installProcess.output.pipeTo(new WritableStream({
    write(data){
      //console.log(data);
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
  const [iframeCounter, setIFrameCounter] = useState(0);


  // Setting up WebContainer
  useEffect(()=> {
    async function getPackage(){
      //console.log(files['index.js'].file.contents);

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
    console.log("Setting up webcontainer");
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
  }

  async function startDevServer() {
    console.log("Starting dev server");
    // Start Express app
    await webcontainerInstance.spawn('npm', ['run', 'start']);
  
    // Wait for server-ready event
    webcontainerInstance.on('server-ready', (port, url) => {
      setframeUrl(url);
      console.log("Here's the URL");
      console.log(frameUrl);
    })
    console.log("Dev server ready");
  }

  var code = "import express from 'express'; const app = express(); const port = 3111; app.get('/', (req, res) => {res.send('solution put will go here!!!!!🥳');}); app.listen(port, () => {console.log(\`App is live at http://localhost:\${port}\`);});"

  function testUserCode(userCode){
    var usrCode = userCode;
    usrCode = "import express from 'express';\n    const app = express();\n    const port = 3111;\n    var input2 = [2,5,3,1,8,9,7,6];    var input1 = [2,1,4];\n" + usrCode;
    usrCode = usrCode + "var output = solution(input1);\n    app.get('/', (req, res) => {res.send([output]);});\n    app.listen(port, () => {});";
    console.log(usrCode);
    writeContent(usrCode);
    setIFrameCounter(iframeCounter + 1);
    
    console.log(iframeCounter);
    console.log("Frame url is below: ");
    console.log(frameUrl);
    
    /*
    fetch(frameUrl)
    .then((res) => {
      if (res.status != 200) {
        console.log("Express is currently down");
        return;
      }
      return res.json();
    })
    .then((x) => {
      console.log("fetched from express");
      console.log(frameUrl + "bla");
      console.log(x);
    });
    */
    
  }

  /*
  useEffect(()=> {
    fetch(frameUrl)
    .then((res) => {
      if (res.status != 200) {
        console.log("Express is currently down");
        return;
      } else {
        return res.json();
      }
    })
    .then((x) => {
      console.log("fetched from express");
      console.log(x);
    });
  }, [])
*/


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
            onClick={() => {
              setTestCasesVisible(true);
              testUserCode(userCode);
            }}
          >
            Submit
          </button>
          <iframe
            key = {iframeCounter}
            src = {frameUrl}          
          />
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
