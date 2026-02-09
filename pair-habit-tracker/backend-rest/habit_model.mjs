import mongoose from "mongoose";

let connection = undefined;
const HABIT_TRACKER_DB_NAME = "user-db";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

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

async function createUser({ username, password }) {
  const user = new User({ username, password });
  return await user.save();
}

async function findUserByCredentials({ username, password }) {
  return await User.findOne({ username, password }).exec();
}

async function createHabit() {}
async function deleteHabit() {}
async function updateHabit() {}

export {
  connect,
  createUser,
  findUserByCredentials,
  createHabit,
  deleteHabit,
  updateHabit,
};
