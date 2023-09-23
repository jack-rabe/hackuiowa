import { useEffect, useState } from "react";

import Solution from "@/components/Solution";
import ProblemStatement from "@/components/ProblemStatement";
import TestCases from "@/components/TestCases";
import TestOutput from "@/components/TestOutput";

export default function Home() {
  const [testCases, setTestCases] = useState([]);
  const [problem, setProblem] = useState("");
  const [testOutput, setTestOutput] = useState([]);

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
