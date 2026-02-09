import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await exercises.connect(false);
  console.log(`Server listening on port ${PORT}...`);
});
