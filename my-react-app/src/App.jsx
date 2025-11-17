import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import TodoPage from './TodoPage.jsx'

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Todo-App mit React Router</h1>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? '700' : '500',
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/todos"
            style={({ isActive }) => ({
              textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? '700' : '500',
            })}
          >
            Todos
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todos" element={<TodoPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
