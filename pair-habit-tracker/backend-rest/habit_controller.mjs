import "dotenv/config";
import cors from "cors";
import express from "express";
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

//Auth microservice settings
const AUTH_URL = process.env.AUTH_URL || "http://127.0.0.1:5000";
const APP_ID = process.env.APP_ID || "";
const APP_SECRET = process.env.APP_SECRET || "";

/*
 *Validate  session using auth microservice /introspect endpoint
 *expects frontend to send an "X-Session-Id" header with sessionId
 *on success attaches req.userId and req.appId
 */
async function requireAuth(req, res, next) {
  const sessionId = req.headers["x-session-id"] || "";
  if (!sessionId) {
    return res.status(401).json({ message: "Missing X-Session-Id header" });
  }

  try {
    const introspectRes = await fetch(`${AUTH_URL}/introspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
        "X-App-Secret": APP_SECRET,
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await introspectRes.json();

    if (!data.active) {
      return res
        .status(401)
        .json({ message: "Session is not active. Please log in again." });
    }

    req.userId = data.userId;
    req.appId = data.appId;
    next();
  } catch (err) {
    console.error("Auth introspect failed:", err);
    return res.status(502).json({ message: "Auth service unavailable" });
  }
}

app.get("/habits", requireAuth, async (req, res) => {
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

app.post("/habits", requireAuth, async (req, res) => {
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
    return res.status(201).json({
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

app.get("/habits/:id", requireAuth, async (req, res) => {
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

app.patch("/habits/:id", requireAuth, async (req, res) => {
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

app.delete("/habits/:id", requireAuth, async (req, res) => {
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
