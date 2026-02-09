import Habit, { type HabitType } from "../components/Habit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HabitsList() {
  const [userHabits, setUserHabits] = useState<HabitType[]>([]);
  const [cachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const navigate = useNavigate();

  // Get username from local storage, then fetch habits for the user
  useEffect(() => {
    if (!cachedUsername) {
      return;
    }

    const fetchHabits = async () => {
      try {
        const response = await fetch(
          `https://pair-habit-tracker.onrender.com/habits?username=${cachedUsername}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          return;
        }

        const habits = await response.json();
        setUserHabits(habits);
      } catch (error) {
        console.error("Failed to fetch habits", error);
      }
    };

    void fetchHabits();
  }, [cachedUsername]);

  const deleteHabit = async (id: string) => {
    try {
      const response = await fetch(
        `https://pair-habit-tracker.onrender.com/habits/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      alert("response status = " + response.status);
      if (response.status !== 204) {
        return;
      }

      setUserHabits((prevHabits) =>
        prevHabits.filter((habit) => habit._id !== id),
      );
    } catch (error) {
      console.error("Failed to delete habit", error);
    }
  };

  return (
    <>
      <h1>Habits List</h1>
      <p>Hello {cachedUsername}!</p>
      <button id="add-habit-button" onClick={() => navigate("/add-habit")}>
        Add Habit
      </button>
      <div className="habits-list-container">
        {userHabits.map((habit) => (
          <Habit
            key={habit._id}
            _id={habit._id}
            title={habit.title}
            interval={habit.interval}
            onDelete={deleteHabit}
          />
        ))}
      </div>
    </>
  );
}

export default HabitsList;
