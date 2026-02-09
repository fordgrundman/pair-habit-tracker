import { useState } from "react";
import { useNavigate } from "react-router-dom";
function AccountPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const createAccount = async () => {
    const newAccount = { username, password };

    const response = await fetch(
      "https://pair-habit-tracker.onrender.com/account",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newAccount),
      },
    );

    if (response.status === 201) {
      alert("Successfully created the account");
    } else {
      alert("Failed to create account, status code = " + response.status);
    }

    navigate("/");
  };

  const login = async () => {
    const response = await fetch(
      "https://pair-habit-tracker.onrender.com/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      },
    );

    if (response.status === 200) {
      alert("Successfully logged in");
    } else {
      alert("Failed to log in, status code = " + response.status);
    }

    navigate("/");
  };

  return (
    <>
      <h1>Login</h1>
      <label> Username: </label>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <label> Password: </label>
      <input
        type="password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button onClick={login}>Login</button>
      <button onClick={createAccount}>Create Account</button>
    </>
  );
}

export default AccountPage;
