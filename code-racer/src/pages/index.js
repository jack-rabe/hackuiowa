import { useState } from "react";
import { useRouter } from "next/router";

async function checkUsername(router, username) {
  if (username === "") {
    alert("Please enter a username first");
    return;
  }
  fetch("http://localhost:3333/createUser", {
    method: "POST",
    body: JSON.stringify({
      userId: username,
    }),
  }).then((res) => {
    if (res.status != 201) {
      alert(
        "That username has already been selected, please choose a different one",
      );
    } else {
      alert(`Welcome, ${username}!`);
      router.push("/game");
    }
  });
}

export default function Welcome() {
  // TODO check that the length of username is > 0
  // TODO might want to sanitzeHTML(username)
  const [username, setUsername] = useState("");
  const router = useRouter();
  return (
    <>
      <h1 className="text-center text-3xl m-3">Welcome to Code Race</h1>
      <br />
      <div className="flex items-center justify-center">Username</div>
      <div className="flex items-center justify-center">
        <input
          id="username"
          type="text"
          className="w-72 h-12 border-2 border-gray-400 rounded-lg pl-4 text-lg focus:outline-none m-1"
          value={username}
          onChange={(e) => {
            console.log(e);
            console.log(e.target.value);
            setUsername(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              checkUsername(router, username);
            }
          }}
        />
      </div>
      <br />
      <div className="flex items-center justify-center">
        <button
          className="btn btn-primary"
          onClick={() => checkUsername(router, username)}
        >
          Submit
        </button>
      </div>
    </>
  );
}
