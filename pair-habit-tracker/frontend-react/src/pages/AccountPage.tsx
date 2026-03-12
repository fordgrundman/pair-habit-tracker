import { useState } from "react";
import { useNavigate } from "react-router-dom";

//auth config
const {
  VITE_AUTH_URL: BASE_URL,
  VITE_APP_ID: APP_ID,
  VITE_APP_SECRET: APP_SECRET,
  VITE_RANDOM_USER_API_URL,
} = import.meta.env;

//headers for auth requests
const HEADERS = {
  "Content-Type": "application/json",
  "X-App-Id": APP_ID,
  "X-App-Secret": APP_SECRET,
};

function AccountPage() {
  const [cachedUsername, setCachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const signUp = async () => {
    const signupPayload = { username: username, password: password };
    console.log(signupPayload);
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(signupPayload),
    });

    console.log(JSON.stringify(response));

    if (response.status === 201) {
      const data = await response.json();
      localStorage.setItem("username", username);
      localStorage.setItem("sessionId", data.sessionId);
      setCachedUsername(username);

      //send to habits list
      navigate("/habits");
    } else if (response.status === 409) {
      alert("Username already exists. Please login instead.");
    } else {
      alert("Failed to create account.");
    }
  };

  const login = async () => {
    const loginPayload = { username: username, password: password };
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(loginPayload),
    });

    if (response.status === 200) {
      const data = await response.json();
      localStorage.setItem("username", username);
      localStorage.setItem("sessionId", data.sessionId);
      setCachedUsername(username);

      //send to habits list
      navigate("/habits");
    } else {
      alert("Login failed. Incorrect username or password");
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem("sessionId") ?? "";
    if (!sessionId) {
      alert("No active session.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        localStorage.removeItem("username");
        localStorage.removeItem("sessionId");
        setCachedUsername("");
        setUsername("");
        setPassword("");
      } else {
        alert("Logout failed.");
      }
    } catch {
      alert("Logout request failed.");
    }
  };

  const generateRandomUsername = async () => {
    try {
      const response = await fetch(
        `${VITE_RANDOM_USER_API_URL}/username?maxLen=8`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
      }
    } catch {
      alert("Error generating random username.");
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
        <button id="random-user-button" onClick={generateRandomUsername}>
          Generate Random Username
        </button>
        <div id="login-buttons-wrapper">
          <button className="habit-input-button" onClick={login}>
            Login
          </button>
          <button className="habit-input-button" onClick={signUp}>
            Create Account
          </button>
          {cachedUsername && (
            <button className="habit-input-button" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default AccountPage;
