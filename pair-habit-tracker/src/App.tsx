import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Help from './pages/Help';
import HabitsList from './pages/HabitsList';

function App() {

  return (
    <Router>
        <header>
          <nav>
            <Link to="/">Habits List</Link>
            <Link to="/help">Help</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route
              path="/"
              element={<HabitsList />}
            ></Route>
            <Route
              path="/help"
              element={<Help />}
            ></Route>
          </Routes>
        </main>
        <footer>© Ford Grundman</footer>
      </Router>
  )
}

export default App
