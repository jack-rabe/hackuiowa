function Solution(props) {
  return (
    <textarea
      id="solution"
      className="border-2 border-primary rounded-lg w-5/6"
      rows="9"
      value={props.userCode}
      onChange={(e) => props.setUserCode(e.target.value)}
    />
  );
}

export default Solution;
