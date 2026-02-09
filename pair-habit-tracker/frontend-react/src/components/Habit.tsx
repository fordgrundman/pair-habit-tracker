export type HabitType = {
  _id: string;
  title: string;
  interval: "daily" | "weekly";
  completed: boolean;
};

//pass in onDelete and onToggleCompleted as well as a prop, and make a new type that extens HabitType to make typescript happy
type HabitProps = HabitType & {
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string, completed: boolean) => void;
  onEdit: (habit: HabitType) => void;
};

function Habit({
  _id,
  title,
  interval,
  completed,
  onDelete,
  onToggleCompleted,
  onEdit,
}: HabitProps) {
  return (
    <div className="habit-container">
      <input
        className="habit-checkbox"
        type="checkbox"
        checked={completed}
        onChange={(event) => onToggleCompleted(_id, event.target.checked)}
      />
      <div className="habit-inner-wrapper">
        <div className="habit-title">{title}</div>
        <div className="habit-interval">{interval}</div>
      </div>
      <div className="edit-icon" onClick={() => onEdit({
        _id,
        title,
        interval,
        completed,
      })} />
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
