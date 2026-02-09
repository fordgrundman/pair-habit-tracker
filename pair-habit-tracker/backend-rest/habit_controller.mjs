import "dotenv/config";
import express from "express";
import * as habits from "./habit_model.mjs";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await habits.connect(false);
  console.log(`Server listening on port ${PORT}...`);
});
