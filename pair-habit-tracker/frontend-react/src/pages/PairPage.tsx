import { useEffect, useState } from "react";
import { type HabitType, type PairPostType } from "../components/Habit";

const API_URL = import.meta.env.VITE_API_URL;

function PairPage() {
  const [cachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const [pairPosts, setPairPosts] = useState<PairPostType[]>([]);
  const [myPairings, setMyPairings] = useState<HabitType[]>([]);
  const [myHabits, setMyHabits] = useState<HabitType[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);

  const getHeaders = () => {
    const sessionId = localStorage.getItem("sessionId") ?? "";
    return {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    };
  };

  //fetch pair posts, user pairings, and user habits
  useEffect(() => {
    if (!cachedUsername) return;

    const fetchAll = async () => {
      try {
        const [postsRes, pairingsRes, habitsRes] = await Promise.all([
          fetch(`${API_URL}/pair-posts`, {
            headers: getHeaders(),
          }),
          fetch(`${API_URL}/my-pairings?username=${cachedUsername}`, {
            headers: getHeaders(),
          }),
          fetch(`${API_URL}/habits?username=${cachedUsername}`, {
            headers: getHeaders(),
          }),
        ]);

        if (postsRes.ok) {
          setPairPosts(await postsRes.json());
        }
        if (pairingsRes.ok) {
          setMyPairings(await pairingsRes.json());
        }
        if (habitsRes.ok) {
          setMyHabits(await habitsRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch pair page data", error);
      }
    };

    void fetchAll();
  }, [cachedUsername]);

  //post a habit to the pair board
  const postHabit = async (habitId: string) => {
    try {
      const response = await fetch(`${API_URL}/pair-posts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ habitId }),
      });

      if (response.status === 201) {
        const newPost = await response.json();
        setPairPosts((prev) => [newPost, ...prev]);
        setShowPostModal(false);
      } else {
        alert("Failed to post habit.");
      }
    } catch (error) {
      console.error("Failed to post habit", error);
    }
  };

  //unpost a pair post
  const unpostHabit = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/pair-posts/${postId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.status === 204) {
        setPairPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (error) {
      console.error("Failed to unpost habit", error);
    }
  };

  //pair with a posted habit
  const pairWithPost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/pair-posts/${postId}/pair`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username: cachedUsername }),
      });

      if (response.ok) {
        const data = await response.json();
        //remove from the board
        setPairPosts((prev) => prev.filter((p) => p._id !== postId));
        //add to my pairings
        setMyPairings((prev) => [data.claimerHabit, ...prev]);
      } else {
        const err = await response.json();
        alert(err.message || "Failed to pair.");
      }
    } catch (error) {
      console.error("Failed to pair", error);
    }
  };

  //toggle completion on a paired habit
  const togglePairingCompleted = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) return;

      const updatedHabit = await response.json();
      setMyPairings((prev) =>
        prev.map((h) =>
          h._id === id
            ? {
                ...h,
                completed: updatedHabit.completed,
                streak: updatedHabit.streak,
              }
            : h,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle pairing completion", error);
    }
  };

  const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

  return (
    <>
      <h1>Pair Page</h1>

      {myPairings.length > 0 && (
        <div className="my-pairings-section">
          <h2>My Pairings</h2>
          <div className="habits-list-container">
            {myPairings.map((habit) => (
              <div key={habit._id} className="habit-container">
                <input
                  className="habit-checkbox"
                  type="checkbox"
                  checked={habit.completed}
                  onChange={(e) =>
                    togglePairingCompleted(habit._id, e.target.checked)
                  }
                />
                <div className="habit-inner-wrapper">
                  <div className="habit-title">
                    {habit.title}
                    {typeof habit.streak === "number" && (
                      <span className="habit-streak" title="Current streak">
                        {" "}
                        🔥 {habit.streak}
                      </span>
                    )}
                  </div>
                  <div className="habit-interval">
                    {capitalize(habit.interval)}
                    {habit.pairedWithUsername && (
                      <span className="habit-paired-label">
                        {" "}
                        · Paired with {habit.pairedWithUsername}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* post habit button and modal */}
      <button
        id="add-habit-button"
        onClick={() => setShowPostModal(!showPostModal)}
      >
        Post Habit
      </button>

      {showPostModal && (
        <div className="post-habit-modal">
          <h3>Choose a habit to post:</h3>
          {myHabits.length === 0 && (
            <p>You have no habits. Create one first!</p>
          )}
          {myHabits.map((habit) => (
            <div key={habit._id} className="post-habit-option">
              <span>
                {habit.title} ({capitalize(habit.interval)})
              </span>
              <button
                className="habit-input-button"
                onClick={() => postHabit(habit._id)}
              >
                Post
              </button>
            </div>
          ))}
          <button
            className="habit-input-button"
            onClick={() => setShowPostModal(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* public pair board */}
      <h2>Public Board</h2>
      <div className="habits-list-container">
        {pairPosts.length === 0 && <p>No habits posted yet. Be the first!</p>}
        {pairPosts.map((post) => {
          const isOwn = post.posterUsername === cachedUsername;
          return (
            <div key={post._id} className="habit-container pair-post-container">
              <div className="pair-post-username">{post.posterUsername}</div>
              <div className="habit-inner-wrapper">
                <div className="habit-title">{post.title}</div>
                <div className="habit-interval">
                  {capitalize(post.interval)}
                </div>
              </div>
              {isOwn ? (
                <button
                  className="habit-input-button unpost-button"
                  onClick={() => unpostHabit(post._id)}
                >
                  Unpost
                </button>
              ) : (
                <button
                  className="habit-input-button pair-button"
                  onClick={() => pairWithPost(post._id)}
                >
                  Pair
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PairPage;
