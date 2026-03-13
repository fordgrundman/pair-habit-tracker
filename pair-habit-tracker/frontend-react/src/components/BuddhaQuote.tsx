import { useEffect, useState } from "react";

function BuddhaQuote() {
  const BUDDHA_API_URL = import.meta.env.VITE_BUDDHA_API_URL;
  const [quote, setQuote] = useState("");

  const fetchQuote = async () => {
    try {
      const response = await fetch(BUDDHA_API_URL, {
        method: "POST",
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setQuote(data.text);
    } catch (error) {
      console.error("Failed to fetch Buddha quote", error);
    }
  };

  useEffect(() => {
    void fetchQuote();
  }, []);

  return <div style={{ fontSize: 15 }}>{quote}</div>;
}

export default BuddhaQuote;
