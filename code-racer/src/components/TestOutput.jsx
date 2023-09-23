import React from "react";

// TODO make sure to remove all TODO statements
// TODO test how resizable this is

function TestOutput(props) {
  if (props.tests.length == 0) {
    return <></>;
  }
  return (
    <>
      <div className="text-2xl">Test Cases</div>
      {props.tests.map((element, index) => (
        <div key={index}>
          Case: {element.case}
          <br />
          User Output: {element.userOutput}
          <br />
          {element.correct.toString() == "false" ? "Incorrect" : "Correct"}
          <br />
          <br />
        </div>
      ))}
    </>
  );
}

export default TestOutput;
