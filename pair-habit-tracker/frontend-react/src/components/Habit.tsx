export type HabitType = {
  title: string;
  interval: "daily" | "weekly";
};

function Habit({ title, interval }: HabitType) {
  return (
    <div className="habit-container">
      <input className="habit-checkbox" type="checkbox" />
      <div className="habit-inner-wrapper">
        <div className="habit-title">{title}</div>
        <div className="habit-interval">{interval}</div>
      </div>
      <div className="edit-icon" />
      <div className="delete-icon" />
    </div>
  );
}

export default Habit;
