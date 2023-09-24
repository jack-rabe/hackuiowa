import React from "react";

function Leaderboard(props) {
  // props.leaderboard has the form {name: "bob", progress: 5}
  // progress is a scale of 0-5, where 0 means no test cases passed, 5 means all test cases passed, and anything else means that number of test cases passed

  // TODO sort the leaderboard
  // TODO only display the top 5 results

  const sortedLeaderboard = props.leaderboard.sort((a, b) => {
    if (a.progress == b.progress) {
      return b.time - a.time;
    }
    return b.progress - a.progress;
  });
  return (
    <>
      <div>Leaderboard</div>
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Place</th>
            <th>Name</th>
            <th>Number of tests</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeaderboard.map((element, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{element.name}</td>
              <td>{element.progress}</td>
              <td>{element.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Leaderboard;
