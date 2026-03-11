import mongoose from "mongoose";

let connection = undefined;
const HABIT_TRACKER_DB_NAME = "user-db";

const habitSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    interval: {
      type: String,
      required: true,
      enum: ["daily", "weekly"],
    },
    completed: { type: Boolean, required: true, default: false },

    //streak tracking
    streak: { type: Number, default: 0 },
    lastCompletedAt: { type: Date, default: null },

    //pairing links two habits together
    pairedWithHabitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      default: null,
    },
    pairedWithUsername: { type: String, default: null },
  },
  { timestamps: true },
);

const Habit = mongoose.model("Habit", habitSchema);

//pair post schema for the public pair board
const pairPostSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    posterUsername: { type: String, required: true, index: true },
    title: { type: String, required: true },
    interval: { type: String, required: true, enum: ["daily", "weekly"] },
  },
  { timestamps: true },
);

const PairPost = mongoose.model("PairPost", pairPostSchema);

//connect to MongoDB
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

//figures out when the current interval started (daily or weekly)
function getIntervalStart(interval) {
  const now = new Date();
  if (interval === "daily") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }
  //weekly resets on Monday 00:00 UTC
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff),
  );
  return monday;
}

async function applyIntervalResets(habitDocs) {
  const bulkOps = [];

  for (const h of habitDocs) {
    //handle old habits that predate the streak fields
    h.streak ??= 0;
    h.lastCompletedAt ??= null;

    const intervalStart = getIntervalStart(h.interval);
    const lastDone = h.lastCompletedAt ? new Date(h.lastCompletedAt) : null;
    const completedInCurrentInterval = lastDone && lastDone >= intervalStart;

    if (!completedInCurrentInterval) {
      //new interval started and user didnt complete the prior one
      if (h.completed) {
        //edge case: completed=true but lastCompletedAt is stale
        bulkOps.push({
          updateOne: {
            filter: { _id: h._id },
            update: { $set: { completed: false, streak: 0 } },
          },
        });
        h.completed = false;
        h.streak = 0;
      } else if (h.streak > 0 && lastDone) {
        //missed the interval entirely so reset streak
        bulkOps.push({
          updateOne: {
            filter: { _id: h._id },
            update: { $set: { streak: 0 } },
          },
        });
        h.streak = 0;
      }
    } else if (completedInCurrentInterval && h.completed) {
      //already done this interval, nothing to do
    }
  }

  if (bulkOps.length > 0) {
    await Habit.bulkWrite(bulkOps);
  }

  return habitDocs;
}

async function getHabitsByUsername(username) {
  const habits = await Habit.find({ username }).exec();
  return applyIntervalResets(habits);
}

async function getHabitById(id) {
  return await Habit.findById(id).exec();
}

async function createHabit({ username, title, interval, completed }) {
  const habit = new Habit({ username, title, interval, completed });
  return await habit.save();
}

async function deleteHabit(id) {
  const habit = await Habit.findById(id).exec();
  if (!habit) return null;

  //if this habit was paired, unlink the partner
  if (habit.pairedWithHabitId) {
    await Habit.findByIdAndUpdate(habit.pairedWithHabitId, {
      $set: { pairedWithHabitId: null, pairedWithUsername: null },
    });
  }

  //remove any pair posts for this habit
  await PairPost.deleteMany({ habitId: id });

  return await Habit.findByIdAndDelete(id).exec();
}

async function updateHabit(id, updates) {
  return await Habit.findByIdAndUpdate(id, updates, { new: true }).exec();
}

//handles streak logic when toggling completion
async function toggleCompletion(id, completed) {
  const habit = await Habit.findById(id).exec();
  if (!habit) return null;

  //handle old habits that predate the streak fields
  habit.streak ??= 0;
  habit.lastCompletedAt ??= null;

  const now = new Date();
  const intervalStart = getIntervalStart(habit.interval);

  if (completed) {
    habit.completed = true;
    habit.lastCompletedAt = now;

    if (habit.pairedWithHabitId) {
      //paired habit, only advance streak if partner also completed this interval
      const partner = await Habit.findById(habit.pairedWithHabitId).exec();
      const partnerDone =
        partner &&
        partner.lastCompletedAt &&
        new Date(partner.lastCompletedAt) >= intervalStart &&
        partner.completed;

      if (partnerDone) {
        habit.streak += 1;
        partner.streak += 1;
        await partner.save();
      }
    } else {
      //solo habit, advance streak right away
      habit.streak += 1;
    }
  } else {
    //unchecking
    const wasCompleted = habit.completed;
    habit.completed = false;
    habit.lastCompletedAt = null;

    if (wasCompleted && habit.streak > 0) {
      habit.streak -= 1;

      //if paired, revert partner's streak bump too
      if (habit.pairedWithHabitId) {
        const partner = await Habit.findById(habit.pairedWithHabitId).exec();
        if (partner && partner.streak > 0) {
          partner.streak -= 1;
          await partner.save();
        }
      }
    }
  }

  return await habit.save();
}

async function getAllPairPosts() {
  return await PairPost.find().sort({ createdAt: -1 }).exec();
}

async function createPairPost({ habitId, posterUsername, title, interval }) {
  const post = new PairPost({ habitId, posterUsername, title, interval });
  return await post.save();
}

async function deletePairPost(id) {
  return await PairPost.findByIdAndDelete(id).exec();
}

async function getPairPostById(id) {
  return await PairPost.findById(id).exec();
}

//user claims a pair post, creates linked habit for the claimer and links both together
async function pairWithPost(postId, claimerUsername) {
  const post = await PairPost.findById(postId).exec();
  if (!post) return { error: "post_not_found" };

  if (post.posterUsername === claimerUsername) {
    return { error: "cannot_pair_self" };
  }

  const originalHabit = await Habit.findById(post.habitId).exec();
  if (!originalHabit) {
    await PairPost.findByIdAndDelete(postId);
    return { error: "original_habit_deleted" };
  }

  //create a linked habit for the claimer
  const claimerHabit = new Habit({
    username: claimerUsername,
    title: originalHabit.title,
    interval: originalHabit.interval,
    completed: false,
    streak: 0,
    pairedWithHabitId: originalHabit._id,
    pairedWithUsername: originalHabit.username,
  });
  await claimerHabit.save();

  //link the original habit back to the claimer
  originalHabit.pairedWithHabitId = claimerHabit._id;
  originalHabit.pairedWithUsername = claimerUsername;
  await originalHabit.save();

  //remove the post from the board
  await PairPost.findByIdAndDelete(postId);

  return { claimerHabit, originalHabit };
}

//get habits this user is paired on
async function getPairedHabits(username) {
  return await Habit.find({
    username,
    pairedWithHabitId: { $ne: null },
  }).exec();
}

export {
  connect,
  getHabitsByUsername,
  getHabitById,
  createHabit,
  deleteHabit,
  updateHabit,
  toggleCompletion,
  getAllPairPosts,
  createPairPost,
  deletePairPost,
  getPairPostById,
  pairWithPost,
  getPairedHabits,
};
