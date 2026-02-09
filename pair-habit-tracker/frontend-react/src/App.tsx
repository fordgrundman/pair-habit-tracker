import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Help from './pages/Help';
import HabitsList from './pages/HabitsList';
import Login from './pages/Login';

function App() {

  return (
    <Router>
        <header>
          <nav>
            <Link to="/login">Login</Link>
            <Link to="/">Habits List</Link>
            <Link to="/help">Help</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="login" element={<Login/>} />
            <Route
              path="/"
              element={<HabitsList />}
            />
            <Route
              path="/help"
              element={<Help />}
            />
          </Routes>
        </main>
        <footer>© Ford Grundman</footer>
      </Router>
  )
}

export default App
