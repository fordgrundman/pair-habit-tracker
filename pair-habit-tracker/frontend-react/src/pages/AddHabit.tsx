import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddHabit() {
  const [cachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const [title, setTitle] = useState("");
  const [interval, setInterval] = useState("daily");
  const navigate = useNavigate();

  const requestHabitCreation = async () => {
    if (!cachedUsername || !title) {
      return;
    }

    const newHabit = {
      username: cachedUsername,
      title,
      interval,
      completed: false,
    };

    const response = await fetch(
      "https://pair-habit-tracker.onrender.com/habits",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newHabit),
      },
    );

    if (response.status === 201) {
      navigate("/habits");
    } else {
      alert("Failed to create habit.");
    }
  };

  return (
    <>
      <h1>Add Habit</h1>
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
              onChange={(event) => setInterval(event.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
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
          onClick={requestHabitCreation}
        >
          Add
        </button>
      </div>
    </>
  );
}

export default AddHabit;
