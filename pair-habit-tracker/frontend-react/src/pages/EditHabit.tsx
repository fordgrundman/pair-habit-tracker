import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type HabitType } from "../components/Habit";

function EditHabit() {
  const navigate = useNavigate();
  const storedHabit = localStorage.getItem("editHabit");
  const habitFromStorage = storedHabit
    ? (JSON.parse(storedHabit) as HabitType)
    : undefined;
  const habitId = habitFromStorage?._id ?? "";

  const [title, setTitle] = useState(() => habitFromStorage?.title ?? "");
  const [interval, setInterval] = useState<"daily" | "weekly">(
    () => habitFromStorage?.interval ?? "daily",
  );
  const [completed, setCompleted] = useState(
    () => habitFromStorage?.completed ?? false,
  );

  const requestHabitUpdate = async () => {
    if (!habitId || !title) {
      return;
    }

    const response = await fetch(
      `https://pair-habit-tracker.onrender.com/habits/${habitId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, interval, completed }),
      },
    );

    if (response.ok) {
      alert("Successfully updated the habit");
      localStorage.removeItem("editHabit");
      navigate("/habits");
    } else {
      alert("Failed to update habit, status code = " + response.status);
    }
  };

  if (!habitId) {
    return (
      <>
        <h1>Edit Habit</h1>
        <p>Missing habit data. Return to the habits list and try again.</p>
      </>
    );
  }

  return (
    <>
      <h1>Edit Habit</h1>
      <label>Title: </label>
      <input
        type="text"
        id="habit-title-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <br />
      <label>Interval: </label>
      <select
        id="habit-interval-select"
        value={interval}
        onChange={(event) =>
          setInterval(event.target.value as "daily" | "weekly")
        }
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <br />
      <label>
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) => setCompleted(event.target.checked)}
        />
        Completed
      </label>
      <br />
      <button id="edit-habit-submit-button" onClick={requestHabitUpdate}>
        Save
      </button>
    </>
  );
}

export default EditHabit;
