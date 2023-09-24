function handleTab(e, updateVal) {
  if (e.key == "Tab") {
    console.log(e);
    e.preventDefault();
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    // Insert a tab character at the caret position
    const newValue =
      currentValue.substring(0, start) + "\t" + currentValue.substring(end);

    textarea.selectionStart = start + 2;

    console.log(newValue);

    updateVal(newValue);
  }
}

function Solution(props) {
  return (
    <textarea
      id="solution"
      className="border-2 border-secondary rounded-lg w-5/6"
      rows="9"
      value={props.userCode}
      onChange={(e) => props.setUserCode(e.target.value)}
      onKeyDown={(e) => handleTab(e, props.setUserCode)}
    />
  );
}

export default Solution;
