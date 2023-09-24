import { useEffect, useState } from "react";
import React from "react";
import Solution from "@/components/Solution";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";
import Leaderboard from "@/components/Leaderboard";
import { useRouter } from "next/router";

import { WebContainer } from "@webcontainer/api";
/** @type {import('@webcontainer/api').WebContainer} */
import { files } from "../../files";

// Setting up WebContainer
let webcontainerInstance;

async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn("npm", ["install"]);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        //console.log(data);
      },
    })
  );
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

  // const [userOutput, setUserOutput] = useState("");

  // Setting up WebContainer
  useEffect(() => {
    async function getPackage() {
      console.log(files["userSolution.js"].file.contents);

      // Makes sure that webcontainer only boots once
      if (!webcontainerInstance) {
        webcontainerInstance = await WebContainer.boot();
      }
      await webcontainerInstance.mount(files);

      const exitCode = await installDependencies();
      if (exitCode !== 0) {
        throw new Error("Installation Failed");
      }

      //startDevServer();
      //runUserCode();
    }
    console.log("Setting up webcontainer");
    getPackage();
  }, []);

  // Function to write to userSolution.js
  function writeContent(content) {
    /** @param {string} content */
    async function write(content) {
      await webcontainerInstance.fs.writeFile("/userSolution.js", content);
      const file = await webcontainerInstance.fs.readFile(
        "/userSolution.js",
        "utf-8"
      );
      console.log(file);
    }
    write(content);
  }

  const stripAnsiCodes = (str) =>
    str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );

  async function runUserCode(usrCode) {
    console.log("Running user's solution");

    // Write user's solution to userSolution.js
    writeContent(usrCode);

    const runningSolution = await webcontainerInstance.spawn("node", [
      "userSolution.js",
    ]);

    await runningSolution.output.pipeTo(
      new WritableStream({
        write(data) {
          setUserOutputs(stripAnsiCodes(data));
          console.log(data);
        },
      })
    );
  }

  async function testUserCode(userCode) {
    var usrCode = userCode;

    // Add in test cases and user's solution
    usrCode =
      "var input2 = [2,5,3,1,8,9,7,6];    var input1 = [2,1,4];\n" + usrCode;

    // Add in the call to user's solution, and print its output to console
    usrCode =
      usrCode + "var output = solution(input1);\n    console.log(output);";
    console.log(usrCode);
    await runUserCode(usrCode);
  }
  const [leaderboard, setLeaderboard] = useState([]);

  const router = useRouter();
  const { username } = router.query;

  // TODO may want to enable 'light mode' vs 'dark mode'

  useEffect(() => {
    fetch("http://localhost:3333/users")
      .then((res) => {
        if (res.status != 200) {
          console.log("Backend is currently down");
          return;
        } else {
          return res.json();
        }
      })
      .then((x) => {
        let addTimes = [];
        console.log(x);
        for (let i in x) {
          addTimes.push({
            name: x[i].userId,
            progress: x[i].numCorrect,
            time: Date(),
          });
        }
        setLeaderboard(addTimes);
      });
  }, []);

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
        let parsedInput = JSON.parse(x.sampleInput);
        if (Array.isArray(parsedInput)) {
          parsedInput = `[${parsedInput.join(", ")}]`;
        }
        setTestCases({
          input: parsedInput,
          solution: x.solution,
          explanation: x.explanation,
        });

        setTestInputs(x.inputs);
      });

    // TODO don't hard code this
    setLeaderboard([
      { name: "Joe", progress: 3, time: Date() },
      { name: username, progress: 0, time: Date() },
    ]);

    const socket = new WebSocket("ws://localhost:3333/ws"); // Replace with your server's WebSocket URL
    socket.addEventListener("open", (event) => {
      socket.send(username);
    });
    socket.addEventListener("message", (event) => {
      const data = event.data;
      if (!data) {
        return;
      }

      // need some way for the second user to get the first user's username

      if (data.includes("joined")) {
        const uname = data.slice(0, data.length - 7);
        setLeaderboard((prevState) => {
          return [...prevState, { name: uname, progress: 0, time: Date() }];
        });
      } else if (data.includes("improved")) {
        setLeaderboard((prevState) => {
          let deepCopy = JSON.parse(JSON.stringify(prevState));
          let name = data.slice(0, data.length - 11);
          let newScore = data.slice(data.length - 1, data.length);

          for (let i in deepCopy) {
            if (deepCopy[i].name == name) {
              deepCopy[i].progress = newScore;
              break;
            }
          }
          return deepCopy;
        });
      }
    });
    // TODO Event handler for WebSocket errors
    socket.addEventListener("error", (error) => {});
  }, []);

  return (
    <>
      <h1 className="text-center text-primary font-mono text-4xl font-bold m-2">
        Code Race
      </h1>
      <div className="text-center italic text-2xl text-info">{username}</div>
      <br />
      <div className="grid grid-cols-2 gap-4">
        <div className="font-mono col-span-1">
          <div className="border border-secondary m-2 p-3 rounded-lg">
            <h3 className="text-2xl pb-1 text-secondary">Problem</h3>
            <div>{problem}</div>
            <br />
            <h3 className="text-2xl pb-1 text-secondary">Sample Test Cases</h3>
            <TestCases cases={testCases} />
            <br />
            <br />
          </div>
          <Leaderboard leaderboard={leaderboard} />
        </div>
        <div className="col-span-1">
          <h3 className="text-2xl font-mono text-secondary">JavaScript Code</h3>
          <Solution userCode={userCode} setUserCode={setUserCode} />
          <br />
          <button
            className="btn btn-primary font-mono"
            onClick={() => {
              // TODO replace this with the actual code results the user has
              // setUserOutputs(["1", "2", "3"]);
              // TODO don't hard-code the body we send to the BE. need to track the user's userId
              // const cur_body = {
              //   userId: username,
              //   responses: ["1", "2", "9"],
              // };

              testUserCode(userCode)
                .then(() => {
                  console.log(username);
                  console.log(userOutputs);
                })
                .then(() => {
                  const cur_body = {
                    userId: username,
                    responses: userOutputs,
                  };
                  console.log("cur body");
                  console.log(cur_body);
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
                      if (x.hasWon) {
                        alert("Congratulations! You solved the problem!");
                      }
                      setMissedQuestions(x.missedQuestions);
                    });
                });

              setTestCasesVisible(true);
            }}
          >
            Submit
          </button>
          <div>{userOutputs}</div>
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
