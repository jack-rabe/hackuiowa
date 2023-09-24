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

  const [competeStartDate, setCompeteStartDate] = useState(
    new Date("2023-09-24T14:30:00Z")
  );
  // TODO need to update this to the correct date and time when we receive information about the competition from the BE

  function time_between_two_dates(d1, d2) {
    return `${Math.floor((d1 - d2) / 60000)} minutes ${Math.floor(
      ((d1 - d2) % 60000) / 1000
    )} seconds`;
  }

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
    }
    write(content);
  }

  const stripAnsiCodes = (str) =>
    str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );

  async function runUserCode(usrCode) {
    // Write user's solution to userSolution.js
    writeContent(usrCode);

    const runningSolution = await webcontainerInstance.spawn("node", [
      "userSolution.js",
    ]);

    // const myStream = new WritableStream();

    const reader = await runningSolution.output.getReader();
    const { done, value } = await reader.read();
    return stripAnsiCodes(value);
  }

  async function testUserCode(userCode, testInput) {
    var usrCode = userCode;
    usrCode = "var input = " + testInput + ";\n" + usrCode;

    // Add in the call to user's algo, and print its output to console (WebContainer's console)
    usrCode =
      usrCode + "var output = solution(input);    console.log(output);\n";
    console.log(usrCode);
    console.log("Awaiting now");
    return await runUserCode(usrCode);
  }
  const [leaderboard, setLeaderboard] = useState([]);

  const router = useRouter();
  const { username } = router.query;
  const hostName = "https://racer-server.tech";

  // TODO may want to enable 'light mode' vs 'dark mode'

  useEffect(() => {
    fetch(hostName + "/users")
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
        for (let i in x) {
          addTimes.push({
            name: x[i].userId,
            progress: x[i].numCorrect,
            time: time_between_two_dates(new Date(), competeStartDate),
          });
        }
        setLeaderboard(addTimes);
      });
  }, []);

  useEffect(() => {
    fetch(hostName + "/question")
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

    setLeaderboard([
      {
        name: username,
        progress: 0,
        time: time_between_two_dates(new Date(), competeStartDate),
      },
    ]);

    const socket = new WebSocket("wss://racer-server.tech/ws");
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
          return [
            ...prevState,
            {
              name: uname,
              progress: 0,
              time: time_between_two_dates(new Date(), competeStartDate),
            },
          ];
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
    socket.addEventListener("error", (error) => { });
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
              let realUserOutputs = [];

              testUserCode(userCode, testInputs[0]).then((e) => {
                realUserOutputs.push(
                  e.split("\n").join("").split("\r").join("")
                );
                testUserCode(userCode, testInputs[1]).then((f) => {
                  realUserOutputs.push(
                    f.split("\n").join("").split("\r").join("")
                  );
                  testUserCode(userCode, testInputs[2]).then((h) => {
                    realUserOutputs.push(
                      h.split("\n").join("").split("\r").join("")
                    );
                    setUserOutputs(realUserOutputs);
                    fetch(hostName + "/answer", {
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
                      .then(() => {
                        const cur_body = {
                          userId: username,
                          responses: realUserOutputs,
                        };
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
                  });
                });

                setTestCasesVisible(true);
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
