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
      alert("Successfully created the habit");
      navigate("/habits");
    } else {
      alert("Failed to create habit, status code = " + response.status);
    }
  };

  return (
    <>
      <h1>Add Habit</h1>
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
        onChange={(event) => setInterval(event.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <br />
      <button id="add-habit-submit-button" onClick={requestHabitCreation}>
        Add
      </button>
    </>
  );
}

export default AddHabit;
