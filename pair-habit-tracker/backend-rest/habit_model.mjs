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

const habitSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    interval: {
      type: String,
      required: true,
      enum: ["daily", "weekly"],
    },
  },
  { timestamps: true },
);

const Habit = mongoose.model("Habit", habitSchema);

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

async function getHabitsByUsername(username) {
  return await Habit.find({ username }).exec();
}

async function createHabit({ username, title, interval }) {
  const habit = new Habit({ username, title, interval });
  return await habit.save();
}
async function deleteHabit(id) {
  return await Habit.findByIdAndDelete(id).exec();
}
async function updateHabit() {}

export {
  connect,
  createUser,
  findUserByCredentials,
  getHabitsByUsername,
  createHabit,
  deleteHabit,
  updateHabit,
};
