import { useState } from "react";
import { useNavigate } from "react-router-dom";
function AccountPage() {
  const [cachedUsername, setCachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const signUp = async () => {
    const newAccount = { username, password };

    const response = await fetch(
      "https://pair-habit-tracker.onrender.com/signup",
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
      localStorage.setItem("username", username);
      setCachedUsername(username);

      //only navigate to Habits List after successful signup
      navigate("/habits");
    } else {
      alert("Failed to create account, username may already exist");
    }
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
      localStorage.setItem("username", username);
      setCachedUsername(username);

      //only navigate to Habits List after successful login
      navigate("/habits");
    } else {
      alert("Login failed. Incorrect username or password");
    }
  };

  return (
    <>
      <h1>Account</h1>
      <p>
        Currently logged in as:
        <span style={{ color: "blue" }}> {cachedUsername}</span>
      </p>
      <div id="login-container">
        <div className="login-field-wrapper">
          <label> Username: </label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className="login-field-wrapper">
          <label> Password: </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <br />
        <div id="login-buttons-wrapper">
          <button className="habit-input-button" onClick={login}>
            Login
          </button>
          <button className="habit-input-button" onClick={signUp}>
            Create Account
          </button>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
