import { useEffect, useState } from "react";

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";
import Leaderboard from "@/components/Leaderboard";

export default function Game() {
  const [testCases, setTestCases] = useState({});
  const [problem, setProblem] = useState("");
  const [testCasesVisible, setTestCasesVisible] = useState(false);
  const [userCode, setUserCode] = useState("function solution(x) {\n\n}");

  const [userOutputs, setUserOutputs] = useState([]);
  const [testInputs, setTestInputs] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);

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
        let parsedInput = JSON.parse(x.sampleInput);
        if (Array.isArray(parsedInput)) {
          console.log(typeof parsedInput[1]);
          parsedInput = `[${parsedInput.join(", ")}]`;
        }
        setTestCases({
          input: parsedInput,
          solution: x.solution,
          explanation: x.explanation,
        });

        setTestInputs(x.inputs);
      });

    // TODO don't hard-code the body we send to the BE. need to track the user's userId
    const cur_body = {
      userId: "dconway",
      responses: ["2", "3", "3"],
    };

    // TODO don't hard code this
    const date2 = new Date("1995-12-17T03:24:00");
    setLeaderboard([
      { name: "Joe", progress: 3, time: Date() },
      { name: "Bob", progress: 3, time: Date() },
      { name: "Fred", progress: 1, time: Date() },
      { name: "Jimmy", progress: 0, time: Date() },
    ]);

    // TODO replace this with the actual code results the user has
    setUserOutputs(["1", "2", "3"]);

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
      <h1 className="text-center font-mono text-3xl m-2">Code Race</h1>
      <br />
      <div className="grid grid-cols-2 gap-4">
        <div className="font-mono col-span-1 border border-white m-2 p-3 rounded-lg">
          <h3 className="text-2xl pb-1">Problem</h3>
          <ProblemStatement problem={problem} />
          <br />
          <h3 className="text-2xl pb-1">Sample Test Cases</h3>
          <TestCases cases={testCases} />
          <br />
          <br />
        </div>
        <div className="col-span-1">
          <h3 className="text-2xl font-mono mb-1">JavaScript Code</h3>
          <Solution userCode={userCode} setUserCode={setUserCode} />
          <br />
          <button
            className="btn btn-primary font-mono"
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
      <Leaderboard leaderboard={leaderboard} />
    </>
  );
}
