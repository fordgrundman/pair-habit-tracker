import "dotenv/config";
import cors from "cors";
import express from "express";
import session from "express-session";
import * as habits from "./habit_model.mjs";

const app = express();
app.use(express.json());

const allowedConnections = [
  "https://pair-habit-tracker-frontend.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedConnections,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "devSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

app.post("/account", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    const user = await habits.createUser({ username, password });
    return res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to create account" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    const user = await habits.findUserByCredentials({ username, password });

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    req.session.userId = user._id.toString();
    return res.status(200).json({ id: user._id, username: user.username });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "login failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await habits.connect();
  console.log(`Server listening on port ${PORT}...`);
});
