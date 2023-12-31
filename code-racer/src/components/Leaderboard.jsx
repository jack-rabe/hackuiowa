import React from "react";

function Leaderboard(props) {
  // props.leaderboard has the form {name: "bob", progress: 5}
  // progress is a scale of 0-5, where 0 means no test cases passed, 5 means all test cases passed, and anything else means that number of test cases passed

  const sortedLeaderboard = props.leaderboard.sort((a, b) => {
    if (a.progress == b.progress) {
      return b.time - a.time;
    }
    return b.progress - a.progress;
  });

  // filter to only show the top 5 results
  const selectedElements = sortedLeaderboard.filter(
    (element, index) => index < 5
  );

  return (
    <div className="font-mono col-span-1 border border-secondary m-2 p-3 rounded-lg">
      <div className="text-2xl text-secondary m-2">Leaderboard</div>
      <table className="table">
        <thead>
          <tr>
            <th>Place</th>
            <th>Name</th>
            <th>Tests Passing</th>
            <th>Finish Time</th>
          </tr>
        </thead>
        <tbody>
          {selectedElements.map((element, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{element.name}</td>
              <td>{element.progress}</td>
              <td>{element.time || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
