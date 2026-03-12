import { useEffect, useState } from "react";
import { type HabitType, type PairPostType } from "../components/Habit";
import streaksIcon from "../assets/streaks-icon.png";

const API_URL = import.meta.env.VITE_API_URL;

function PairPage() {
  const [cachedUsername] = useState(
    () => localStorage.getItem("username") ?? "",
  );
  const [pairPosts, setPairPosts] = useState<PairPostType[]>([]);
  const [myPairings, setMyPairings] = useState<HabitType[]>([]);
  const [myHabits, setMyHabits] = useState<HabitType[]>([]);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const getHeaders = () => {
    const sessionId = localStorage.getItem("sessionId") ?? "";
    return {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    };
  };

  const getErrorMessage = async (response: Response) => {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.message || `Request failed (${response.status})`;
    }

    const text = await response.text();
    if (text.includes("Cannot POST")) {
      return `Endpoint not found (${response.status})`;
    }

    return `Request failed (${response.status})`;
  };

  //grab all the pair page data
  useEffect(() => {
    if (!cachedUsername) {
      setIsInitialLoading(false);
      return;
    }

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
      } finally {
        setIsInitialLoading(false);
      }
    };

    void fetchAll();
  }, [cachedUsername]);

  //post habit to the board
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
        setShowPostMenu(false);
      } else {
        alert("Failed to post habit.");
      }
    } catch (error) {
      console.error("Failed to post habit", error);
    }
  };

  //remove a post
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

  //pair with a post
  const pairWithPost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/pair-posts/${postId}/pair`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username: cachedUsername }),
      });

      if (response.ok) {
        const data = await response.json();
        //take it off the board
        setPairPosts((prev) => prev.filter((p) => p._id !== postId));
        //add to pairings
        setMyPairings((prev) => [data.claimerHabit, ...prev]);
      } else {
        const err = await response.json();
        alert(err.message || "Failed to pair.");
      }
    } catch (error) {
      console.error("Failed to pair", error);
    }
  };

  //check/uncheck a paired habit
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

  //unpair a habit (delete the habit and unlink partner)
  const unpairHabit = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/habits/${id}/unpair`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();

        // remove from pairings
        setMyPairings((prev) => prev.filter((p) => p._id !== id));
        setMyHabits((prev) => prev.filter((h) => h._id !== id));

        if (data.repostedPost) {
          setPairPosts((prev) => {
            if (prev.some((p) => p._id === data.repostedPost._id)) {
              return prev;
            }
            return [data.repostedPost, ...prev];
          });
        }

        const boardRes = await fetch(`${API_URL}/pair-posts`, {
          headers: getHeaders(),
        });
        if (boardRes.ok) {
          setPairPosts(await boardRes.json());
        }
      } else {
        const message = await getErrorMessage(response);
        alert(message);
      }
    } catch (error) {
      console.error("Failed to unpair habit", error);
    }
  };

  const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

  return (
    <>
      <h1>Pair Page</h1>

      {isInitialLoading && (
        <div className="my-pairings-section">
          <h2>My Pairings</h2>
          <p>Loading...</p>
        </div>
      )}

      {!isInitialLoading && myPairings.length > 0 && (
        <div className="my-pairings-section">
          <h2>My Pairings</h2>
          <div className="habits-list-container">
            {myPairings.map((habit) => (
              <div
                key={habit._id}
                className="habit-container my-pairings-habit-container"
              >
                <div className="habit-streak" title="Current streak">
                  <img src={streaksIcon} alt="streak" className="streak-icon" />
                  {habit.streak ?? 0}
                </div>
                <input
                  className="habit-checkbox"
                  type="checkbox"
                  checked={habit.completed}
                  onChange={(e) =>
                    togglePairingCompleted(habit._id, e.target.checked)
                  }
                />
                <div className="habit-inner-wrapper">
                  {habit.pairedWithUsername && (
                    <div className="habit-banner">
                      Paired with{" "}
                      <span style={{ color: "blue" }}>
                        {habit.pairedWithUsername}
                      </span>
                    </div>
                  )}
                  <div className="habit-main-row">
                    <div className="habit-title">{habit.title}</div>
                    <div className="habit-interval">
                      {capitalize(habit.interval)}
                    </div>
                  </div>
                </div>
                <div className="habit-actions">
                  <button
                    className="habit-input-button unpair-button"
                    onClick={() => unpairHabit(habit._id)}
                  >
                    Unpair
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPostMenu &&
        (() => {
          //only show habits that arent paired or posted yet
          const postedHabitIds = new Set(pairPosts.map((p) => p.habitId));
          const availableHabits = myHabits.filter(
            (h) => !h.pairedWithHabitId && !postedHabitIds.has(h._id),
          );
          return (
            <div className="post-habit-menu">
              <h3>Choose a habit to post:</h3>
              {availableHabits.length === 0 && (
                <p>No available habits to post.</p>
              )}
              {availableHabits.map((habit) => (
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
                onClick={() => setShowPostMenu(false)}
              >
                Cancel
              </button>
            </div>
          );
        })()}

      <h2>Public Board</h2>
      <button
        id="add-habit-button"
        onClick={() => setShowPostMenu(!showPostMenu)}
        style={{ backgroundColor: "blue", color: "white", marginTop: 0 }}
      >
        Post Habit
      </button>
      <div className="habits-list-container">
        {isInitialLoading && <p>Loading...</p>}
        {!isInitialLoading && pairPosts.length === 0 && (
          <p>No habits posted yet. Be the first!</p>
        )}
        {pairPosts.map((post) => {
          const isOwn = post.posterUsername === cachedUsername;
          return (
            <div key={post._id} className="habit-container pair-post-container">
              <div className="pair-post-username">{post.posterUsername}</div>
              <div className="habit-inner-wrapper">
                <div className="habit-main-row">
                  <div className="habit-title">{post.title}</div>
                  <div className="habit-interval">
                    {capitalize(post.interval)}
                  </div>
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
