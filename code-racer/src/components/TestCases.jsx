function TestCases(props) {
  return (
    <>
      <div>Input: {props.cases.input}</div>
      <div>Answer: {props.cases.solution}</div>
      <div>Explanation: {props.cases.explanation}</div>
    </>
  );
}

export default TestCases;
