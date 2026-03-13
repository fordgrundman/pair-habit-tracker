import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Help from "./pages/Help";
import HabitsList from "./pages/HabitsList";
import AccountPage from "./pages/AccountPage";
import AddHabit from "./pages/AddHabit";
import EditHabit from "./pages/EditHabit";
import PairPage from "./pages/PairPage";
import HolidayBanner from "./components/HolidayBanner";
import BuddhaQuote from "./components/BuddhaQuote";

function App() {
  return (
    <Router>
      <header>
        <HolidayBanner />
        <nav>
          <Link to="/account">Account</Link>
          <Link to="/habits">Habits List</Link>
          <Link to="/pair">Pair Page</Link>
          <Link to="/help">Help</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="/habits" element={<HabitsList />} />
          <Route path="/add-habit" element={<AddHabit />} />
          <Route path="/habits/edit" element={<EditHabit />} />
          <Route path="/pair" element={<PairPage />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
      <footer>
        <BuddhaQuote />
        <div id="tagline">~Track your habits to stay consistent~</div>
        <p>© Ford Grundman</p>
      </footer>
    </Router>
  );
}

export default App;
