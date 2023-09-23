import { useEffect, useState } from "react";

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";

export default function Home() {
  const [testCases, setTestCases] = useState({});
  const [problem, setProblem] = useState("");
  const [testOutput, setTestOutput] = useState([]);
  const [testCasesVisible, setTestCasesVisible] = useState(false);
  const [userCode, setUserCode] = useState("function solution(x) {\n\n}");

  const [userOutputs, setUserOutputs] = useState([]);
  const [testInputs, setTestInputs] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);

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
        if (x.hasWon) {
          alert("Congratulations! You solved the problem!");
        }
        setMissedQuestions(x.missedQuestions);
      });

    // setTestOutput([
    //   {
    //     case: "x=[1, 3, 4]",
    //     correct: true,
    //     userOutput: 2,
    //   },
    //   {
    //     case: "x=[12, 3, 5, 1, 8, 9, 7, 6, 10, 11, 2]",
    //     correct: false,
    //     userOutput: 5,
    //   },
    //   {
    //     case: "x=[3, 4, 5, 2]",
    //     correct: false,
    //     userOutput: 2,
    //   },
    // ]);
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
