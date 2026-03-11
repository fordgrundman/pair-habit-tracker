import "dotenv/config";
import mongoose from "mongoose";

//one-time wipe of old test habits and pair posts
async function clearAll() {
  await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, {
    dbName: "user-db",
  });

  const habits = await mongoose.connection.collection("habits").deleteMany({});
  const posts = await mongoose.connection
    .collection("pairposts")
    .deleteMany({});

  console.log(
    `Deleted ${habits.deletedCount} habits, ${posts.deletedCount} pair posts`,
  );
  process.exit(0);
}

clearAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
