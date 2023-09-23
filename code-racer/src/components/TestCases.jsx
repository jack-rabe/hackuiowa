function TestCases(props) {
  return (
    <>
      {props.cases.map((element, index) => (
        <>
          <div key={index}>{element}</div>
          <br />
        </>
      ))}
    </>
  );
}

export default TestCases;
