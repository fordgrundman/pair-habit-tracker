import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Help from "./pages/Help";
import HabitsList from "./pages/HabitsList";
import AccountPage from "./pages/AccountPage";

function App() {
  return (
    <Router>
      <header>
        <nav>
          <Link to="/account">Account</Link>
          <Link to="/">Habits List</Link>
          <Link to="/help">Help</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="account" element={<AccountPage />} />
          <Route path="/" element={<HabitsList />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
      <footer>© Ford Grundman</footer>
    </Router>
  );
}

export default App;
