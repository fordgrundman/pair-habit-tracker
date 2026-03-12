import { useEffect, useState } from "react";

const HOLIDAY_API_URL = import.meta.env.VITE_HOLIDAY_API_URL;

function HolidayBanner() {
  const [holidays, setHolidays] = useState<string[]>([]);

  const getCurrentDateParam = () => {
    return new Date().toISOString().slice(5, 10);
  };

  useEffect(() => {
    const holidaysFromApi = async () => {
      try {
        const date = getCurrentDateParam();
        const response = await fetch(`${HOLIDAY_API_URL}?date=${date}`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setHolidays(data.upcomingHolidays ?? []);
      } catch (error) {
        console.error("Failed to fetch upcoming holidays", error);
      }
    };

    void holidaysFromApi();
  }, []);

  return (
    <div id="holiday-banner-container">
      <span style={{ marginRight: "0.5rem" }}>Upcoming Holidays: </span>
      <span>{holidays.length > 0 ? holidays.join(", ") : ""}</span>
    </div>
  );
}

export default HolidayBanner;
