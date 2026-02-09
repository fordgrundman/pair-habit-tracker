export type HabitType = {
  _id: string;
  title: string;
  interval: "daily" | "weekly";
};

//pass in onDelete as well as a prop, and make a new type that extens HabitType to make typescript happy
type HabitProps = HabitType & {
  onDelete: (id: string) => void;
};

function Habit({ _id, title, interval, onDelete }: HabitProps) {
  return (
    <div className="habit-container">
      <input className="habit-checkbox" type="checkbox" />
      <div className="habit-inner-wrapper">
        <div className="habit-title">{title}</div>
        <div className="habit-interval">{interval}</div>
      </div>
      <div className="edit-icon" />
      <div
        className="delete-icon"
        onClick={() => {
          const shouldDelete = window.confirm(
            "Are you sure you want to delete this habit? This action can't be undone.",
          );

          if (shouldDelete) {
            onDelete(_id); //delete the habit of this id
          }
        }}
      />
    </div>
  );
}

export default Habit;
