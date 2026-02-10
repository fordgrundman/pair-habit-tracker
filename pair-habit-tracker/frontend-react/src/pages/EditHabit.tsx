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
      localStorage.removeItem("editHabit");
      navigate("/habits");
    } else {
      alert("Failed to update habit");
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
      <div className="habit-inputs-outer-container">
        <div className="habit-inputs-inner-container">
          <div className="habit-input-wrapper">
            <label className="title-input-label">Title: </label>
            <input
              type="text"
              id="habit-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="habit-input-wrapper">
            <label className="interval-input-label">
              <span className="tooltip">
                <span className="tooltip-icon">?</span>
                <span className="tooltip-text">
                  How often the habit needs to be completed to reach your goal.
                </span>
              </span>
              Interval:
            </label>
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
          </div>
          <div className="habit-input-wrapper">
            <label className="completed-input-label">Completed: </label>
            <input
              id="edit-habit-completed-checkbox"
              className="habit-checkbox"
              type="checkbox"
              checked={completed}
              onChange={(event) => setCompleted(event.target.checked)}
            />
          </div>
        </div>
      </div>
      <div className="habit-input-buttons-wrapper">
        <button
          className="habit-input-button"
          onClick={() => navigate("/habits")}
        >
          Cancel
        </button>
        <button
          className="habit-input-button habit-input-confirm-button"
          onClick={requestHabitUpdate}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default EditHabit;
