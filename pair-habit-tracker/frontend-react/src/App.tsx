import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Help from "./pages/Help";
import HabitsList from "./pages/HabitsList";
import AccountPage from "./pages/AccountPage";
import AddHabit from "./pages/AddHabit";

function App() {
  return (
    <Router>
      <header>
        <nav>
          <Link to="/account">Account</Link>
          <Link to="/habits">Habits List</Link>
          <Link to="/help">Help</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="account" element={<AccountPage />} />
          <Route path="/habits" element={<HabitsList />} />
          <Route path="/add-habit" element={<AddHabit />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
      <footer>
        <div id="tagline">Track your habits to stay consistent</div>
        <p>© Ford Grundman</p>
      </footer>
    </Router>
  );
}

export default App;
