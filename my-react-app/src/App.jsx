import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import TodoPage from './TodoPage.jsx'

function App() {
  return (
      <main>
        <Routes>
          <Route path="/todos" element={<TodoPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
