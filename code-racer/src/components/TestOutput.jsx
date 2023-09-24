import React from "react";

// TODO make sure to remove all TODO statements

function TestOutput(props) {
  let allTests = [];
  for (let i = 0; i < props.testInputs.length; i++) {
    console.log(i)
    allTests.push({
      userOutputs: props.userOutputs[i],
      testInputs: props.testInputs[i],
      missedQuestions: !(i in props.missedQuestions),
    });
  }

  if (allTests.length === 0) {
    return <div>No test cases provided.</div>;
  }
  return (
    <div className="p-2 rounded-lg border border-white font-mono">
      <div className="text-2xl">Test Cases</div>
      <div className="flex flex-col">
        {allTests.map((element, index) => (
          <div className="border-white border m-1 p-1 rounded-lg" key={index}>
            <div>Case: {element.testInputs}</div>
            <div>User Output: {element.userOutputs}</div>
            {element.missedQuestions.toString() === "false"
              ? <div className="text-error font-bold">Incorrect</div>
              : <div className="text-success font-bold">Correct</div>}
          </div >
        ))
        }
      </div>
    </div>
  );
}

export default TestOutput;
