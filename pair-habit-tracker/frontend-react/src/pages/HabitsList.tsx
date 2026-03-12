import Habit, { type HabitType } from "../components/Habit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function HabitsList() {
  const [userHabits, setUserHabits] = useState<HabitType[]>([]);
  const [cachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const navigate = useNavigate();

  //headers with session id
  const getHeaders = () => {
    const sessionId = localStorage.getItem("sessionId") ?? "";
    return {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    };
  };

  //load the users habits
  useEffect(() => {
    if (!cachedUsername) {
      return;
    }

    const fetchHabits = async () => {
      try {
        const response = await fetch(
          `${API_URL}/habits?username=${cachedUsername}`,
          {
            method: "GET",
            headers: getHeaders(),
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
      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
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

  const toggleCompleted = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        return;
      }

      const updatedHabit = await response.json();
      setUserHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit._id === id
            ? {
                ...habit,
                completed: updatedHabit.completed,
                streak: updatedHabit.streak,
              }
            : habit,
        ),
      );
    } catch (error) {
      console.error("Failed to update habit", error);
    }
  };

  const editHabit = (habit: HabitType) => {
    localStorage.setItem("editHabit", JSON.stringify(habit));
    navigate("/habits/edit");
  };

  return (
    <>
      <h1>Habits List</h1>
      <p>
        Hello
        <span style={{ color: "blue" }}> {cachedUsername}</span>!
      </p>
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
            intervalLabel={`${habit.interval[0].toUpperCase()}${habit.interval.slice(1)}`}
            completed={habit.completed}
            streak={habit.streak}
            pairedWithUsername={habit.pairedWithUsername}
            pairedWithHabitId={habit.pairedWithHabitId}
            onDelete={deleteHabit}
            onToggleCompleted={toggleCompleted}
            onEdit={editHabit}
            showActions={!habit.pairedWithHabitId}
          />
        ))}
      </div>
    </>
  );
}

export default HabitsList;
