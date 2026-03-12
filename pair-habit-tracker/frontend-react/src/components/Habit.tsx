export type HabitType = {
  _id: string;
  title: string;
  interval: "daily" | "weekly";
  completed: boolean;
  streak?: number;
  pairedWithUsername?: string | null;
  pairedWithHabitId?: string | null;
};

export type PairPostType = {
  _id: string;
  habitId: string;
  posterUsername: string;
  title: string;
  interval: "daily" | "weekly";
};

//props for the habits list
type HabitProps = HabitType & {
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string, completed: boolean) => void;
  onEdit: (habit: HabitType) => void;
  onUnpair?: (id: string) => void;
  intervalLabel?: string;
  showActions?: boolean;
};

import streaksIcon from "../assets/streaks-icon.png";

function Habit({
  _id,
  title,
  interval,
  completed,
  streak,
  pairedWithUsername,
  pairedWithHabitId,
  onDelete,
  onToggleCompleted,
  onEdit,
  onUnpair,
  intervalLabel,
  showActions = true,
}: HabitProps) {
  const displayInterval = intervalLabel ?? interval;
  return (
    <div className="habit-container">
      <div className="habit-streak" title="Current streak">
        <img src={streaksIcon} alt="streak" className="streak-icon" />
        {streak ?? 0}
      </div>
      <input
        className="habit-checkbox"
        type="checkbox"
        checked={completed}
        onChange={(event) => onToggleCompleted(_id, event.target.checked)}
      />
      <div className="habit-inner-wrapper">
        {pairedWithUsername && (
          <div className="habit-banner">
            Paired with{" "}
            <span style={{ color: "blue" }}>{pairedWithUsername}</span>
          </div>
        )}
        <div className="habit-main-row">
          <div className="habit-title">{title}</div>
          <div className="habit-interval">{displayInterval}</div>
        </div>
      </div>
      {onUnpair && pairedWithHabitId ? (
        <div className="habit-actions">
          <button
            className="habit-input-button unpair-button"
            onClick={() => onUnpair(_id)}
          >
            Unpair
          </button>
        </div>
      ) : showActions ? (
        <>
          <div
            className="edit-icon"
            onClick={() =>
              onEdit({
                _id,
                title,
                interval,
                completed,
              })
            }
          />
          <div
            className="delete-icon"
            onClick={() => {
              const shouldDelete = window.confirm(
                "Are you sure you want to delete this habit? This action can't be undone.",
              );

              if (shouldDelete) {
                onDelete(_id);
              }
            }}
          />
        </>
      ) : (
        <div style={{ width: "5rem" }} />
      )}
    </div>
  );
}

export default Habit;
