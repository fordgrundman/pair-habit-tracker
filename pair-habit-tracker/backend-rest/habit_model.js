const mongoose = require("mongoose");

let connection = undefined;
let HABIT_TRACKER_DB_NAME = "user-db";

//connect to MongoDB server
async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_STRING, {
      dbName: HABIT_TRACKER_DB_NAME,
    });
    connection = mongoose.connection;
    console.log("Successfully connected to MongoDB using Mongoose!");
  } catch (err) {
    console.log(err);
    throw Error(`Could not connect to MongoDB ${err.message}`);
  }
}
async function createUser() {}
async function createHabit() {}
async function deleteHabit() {}
async function updateHabit() {}

export { connect, createUser, createHabit, deleteHabit, updateHabit };
