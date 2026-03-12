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

//auth config
const AUTH_URL = process.env.AUTH_URL || "http://127.0.0.1:5000";
const APP_ID = process.env.APP_ID || "";
const APP_SECRET = process.env.APP_SECRET || "";

//check session with auth service
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
    //just toggling completed, use streak logic
    if (
      typeof completed !== "undefined" &&
      typeof title === "undefined" &&
      typeof interval === "undefined"
    ) {
      const updatedHabit = await habits.toggleCompletion(id, completed);
      if (!updatedHabit) {
        return res.status(404).json({ message: "habit not found" });
      }
      return res.status(200).json(updatedHabit);
    }

    //block editing paired habits
    const existing = await habits.getHabitById(id);
    if (existing && existing.pairedWithHabitId) {
      return res.status(403).json({ message: "cannot edit a paired habit" });
    }

    //normal field update
    const updatedHabit = await habits.updateHabit(id, {
      title,
      interval,
      completed,
    });

    if (!updatedHabit) {
      return res.status(404).json({ message: "habit not found" });
    }

    return res.status(200).json(updatedHabit);
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
    //block deleting paired habits
    const existing = await habits.getHabitById(id);
    if (existing && existing.pairedWithHabitId) {
      return res.status(403).json({ message: "cannot delete a paired habit" });
    }

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

//pair board

app.get("/pair-posts", requireAuth, async (req, res) => {
  try {
    const posts = await habits.getAllPairPosts();
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to fetch pair posts" });
  }
});

app.post("/pair-posts", requireAuth, async (req, res) => {
  const { habitId } = req.body ?? {};

  if (!habitId) {
    return res.status(400).json({ message: "habitId is required" });
  }

  try {
    const habit = await habits.getHabitById(habitId);

    //cant post a paired habit
    if (habit && habit.pairedWithHabitId) {
      return res.status(400).json({ message: "this habit is already paired" });
    }

    //no duplicate posts
    const existingPost = await habits.getPairPostByHabitId(habitId);
    if (existingPost) {
      return res.status(400).json({ message: "this habit is already posted" });
    }
    if (!habit) {
      return res.status(404).json({ message: "habit not found" });
    }

    const post = await habits.createPairPost({
      habitId: habit._id,
      posterUsername: habit.username,
      title: habit.title,
      interval: habit.interval,
    });

    return res.status(201).json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to create pair post" });
  }
});

app.delete("/pair-posts/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await habits.getPairPostById(id);
    if (!post) {
      return res.status(404).json({ message: "pair post not found" });
    }

    await habits.deletePairPost(id);
    return res.status(204).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to delete pair post" });
  }
});

app.post("/pair-posts/:id/pair", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { username } = req.body ?? {};

  if (!username) {
    return res.status(400).json({ message: "username is required" });
  }

  try {
    const result = await habits.pairWithPost(id, username);

    if (result.error === "post_not_found") {
      return res.status(404).json({ message: "pair post not found" });
    }
    if (result.error === "cannot_pair_self") {
      return res
        .status(400)
        .json({ message: "You cannot pair with your own habit" });
    }
    if (result.error === "original_habit_deleted") {
      return res
        .status(410)
        .json({ message: "The original habit was deleted" });
    }

    return res.status(200).json({
      claimerHabit: result.claimerHabit,
      originalHabit: result.originalHabit,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to pair" });
  }
});

app.get("/my-pairings", requireAuth, async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ message: "username is required" });
  }

  try {
    const paired = await habits.getPairedHabits(username);
    return res.status(200).json(paired);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to fetch pairings" });
  }
});

//unpair a habit: delete the habit and unlink its partner
app.post("/habits/:id/unpair", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "habit id is required" });
  }

  try {
    const result = await habits.unpairHabit(id);

    if (result.error === "habit_not_found") {
      return res.status(404).json({ message: "habit not found" });
    }

    if (result.error === "habit_not_paired") {
      return res.status(400).json({ message: "habit is not paired" });
    }

    return res.status(200).json({
      habit: result.unpairedHabit,
      repostedPost: result.repostedPost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to unpair habit" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await habits.connect();
  console.log(`Server listening on port ${PORT}...`);
});
