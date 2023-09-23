import React from "react";

// TODO make sure to remove all TODO statements

function TestOutput(props) {
  let allTests = [];
  for (let i = 0; i < props.testInputs.length; i++) {
    allTests.push({
      userOutputs: props.userOutputs[i],
      testInputs: props.testInputs[i],
      missedQuestions: !(i in props.missedQuestions),
    });
  }

  if (allTests.length == 0) {
    return <div>No test cases provided.</div>;
  }
  return (
    <>
      <div className="text-2xl">Test Cases</div>
      {allTests.map((element, index) => (
        <div key={index}>
          Case: {element.testInputs}
          <br />
          User Output: {element.userOutputs}
          <br />
          {element.missedQuestions.toString() == "false"
            ? "Incorrect"
            : "Correct"}
          <br />
          <br />
        </div>
      ))}
    </>
  );
}

export default TestOutput;
