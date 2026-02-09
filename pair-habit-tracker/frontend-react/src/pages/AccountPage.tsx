import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function AccountPage() {
  const [cachedUsername, setCachedUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");

    // simply save the username in local storage, for barebones temporary login system until microservice
    if (savedUsername) {
      setCachedUsername(savedUsername);
    }
  }, []);

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
      alert("Successfully created the account");
      localStorage.setItem("username", username);

      //only navigate to Habits List after successful signup
      navigate("/");
    } else {
      alert("Failed to create account, status code = " + response.status);
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
      alert("Successfully logged in");
      localStorage.setItem("username", username);

      //only navigate to Habits List after successful login
      navigate("/");
    } else {
      alert("Failed to log in, status code = " + response.status);
    }
  };

  return (
    <>
      <h1>Login</h1>
      <p>Currently logged in as: {cachedUsername}</p>
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
        <div id="login-buttons-wrapper">
          <button onClick={login}>Login</button>
          <button onClick={signUp}>Create Account</button>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
