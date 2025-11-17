// src/TodoPage.jsx
import { useState, useEffect } from 'react'

let nextId = 3 // Start-ID für Beispiel-Daten

const initialTodos = [
  { id: 1, text: 'React installieren', done: true },
  { id: 2, text: 'Todo-App bauen', done: false },
]

function TodoPage() {
  // 1) Beim ersten Render versuchen wir, aus dem LocalStorage zu laden
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos')
      if (!saved) return initialTodos
      const parsed = JSON.parse(saved)

      // nur falls es wirklich ein Array ist:
      if (Array.isArray(parsed)) return parsed
      return initialTodos
    } catch (err) {
      console.error('Fehler beim Lesen aus localStorage:', err)
      return initialTodos
    }
  })

  const [newTodo, setNewTodo] = useState('')

  // 2) Immer wenn sich todos ändern, in localStorage speichern
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos))
    } catch (err) {
      console.error('Fehler beim Schreiben in localStorage:', err)
    }
  }, [todos])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) return

    setTodos((prev) => [
      ...prev,
      { id: nextId++, text: trimmed, done: false },
    ])
    setNewTodo('')
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const openTodos = todos.filter((t) => !t.done).length

  return (
    <section>
      <h2>Deine Todos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Neue Aufgabe hinzufügen..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            minWidth: '260px',
            marginRight: '0.5rem',
          }}
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <p>
        Offene Aufgaben: <strong>{openTodos}</strong> / {todos.length}
      </p>

      {todos.length === 0 ? (
        <p>Du hast noch keine Todos. 🎉</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />

              <span
                style={{
                  textDecoration: todo.done ? 'line-through' : 'none',
                  opacity: todo.done ? 0.6 : 1,
                  flex: 1,
                }}
              >
                {todo.text}
              </span>

              <button type="button" onClick={() => deleteTodo(todo.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TodoPage
