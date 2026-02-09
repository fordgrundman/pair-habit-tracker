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

app.post("/signup", async (req, res) => {
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

app.get("/habits", async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ message: "username is required" });
  }

  try {
    const userHabits = await habits.getHabitsByUsername(username);
    return res.status(200).json(userHabits);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to fetch habits" });
  }
});

app.post("/habits", async (req, res) => {
  const { username, title, interval, completed } = req.body ?? {};

  if (!username || !title || !interval) {
    return res
      .status(400)
      .json({ message: "username, title, and interval are required" });
  }

  try {
    const habit = await habits.createHabit({
      username,
      title,
      interval,
      completed,
    });
    return res
      .status(201)
      .json({
        id: habit._id,
        title: habit.title,
        interval: habit.interval,
        completed: habit.completed,
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to create habit" });
  }
});

app.get("/habits/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "habit id is required" });
  }

  try {
    const habit = await habits.getHabitById(id);

    if (!habit) {
      return res.status(404).json({ message: "habit not found" });
    }

    return res.status(200).json(habit);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to fetch habit" });
  }
});

app.patch("/habits/:id", async (req, res) => {
  const { id } = req.params;
  const { title, interval, completed } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ message: "habit id is required" });
  }

  if (
    typeof title === "undefined" &&
    typeof interval === "undefined" &&
    typeof completed === "undefined"
  ) {
    return res.status(400).json({ message: "no updates provided" });
  }

  if (typeof completed !== "undefined" && typeof completed !== "boolean") {
    return res.status(400).json({ message: "completed must be boolean" });
  }

  try {
    const updatedHabit = await habits.updateHabit(id, {
      title,
      interval,
      completed,
    });

    if (!updatedHabit) {
      return res.status(404).json({ message: "habit not found" });
    }

    return res.status(200).json({
      id: updatedHabit._id,
      title: updatedHabit.title,
      interval: updatedHabit.interval,
      completed: updatedHabit.completed,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to update habit" });
  }
});

app.delete("/habits/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "habit id is required" });
  }

  try {
    const deletedHabit = await habits.deleteHabit(id);

    if (!deletedHabit) {
      return res.status(404).json({ message: "habit not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to delete habit" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await habits.connect();
  console.log(`Server listening on port ${PORT}...`);
});
