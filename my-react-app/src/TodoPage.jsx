import { useState, useEffect } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

function TodoPage() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  // Firestore-Realtime-Subscription
  useEffect(() => {
    const todosRef = collection(db, 'todos')
    const todosQuery = query(todosRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        setTodos(
          snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          })),
        )
      },
      (error) => {
        console.error('Fehler beim Live-Laden der Todos:', error)
      },
    )

    return () => unsubscribe()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) return

    setNewTodo('')
    try {
      await addDoc(collection(db, 'todos'), {
        text: trimmed,
        done: false,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Fehler beim Speichern des Todos:', error)
    }
  }

  async function toggleTodo(todo) {
    try {
      await updateDoc(doc(db, 'todos', todo.id), { done: !todo.done })
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Todos:', error)
    }
  }

  async function deleteTodo(id) {
    try {
      await deleteDoc(doc(db, 'todos', id))
    } catch (error) {
      console.error('Fehler beim Löschen des Todos:', error)
    }
  }

  const openList = todos.filter((t) => !t.done);
  const doneList = todos.filter((t) => t.done);
  const openTodos = openList.length;
  const doneTodos = doneList.length;

  return (
    <section className="todo-page">
      <div className="todo-card">
        <h1>Deine Todos</h1>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            className="todo-input"
            type="text"
            placeholder="Neue Aufgabe hinzufügen..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button className="todo-button" type="submit">
            Hinzufügen
          </button>
        </form>

        <p className="todo-stats">
          Offene Aufgaben: {openTodos} / {todos.length}
        </p>

        {openList.length === 0 ? (
          <p className="todo-empty">Keine offenen Todos. 🎉</p>
        ) : (
          <ul className="todo-list">
            {openList.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <input
                  className="todo-checkbox"
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo)}
                />

                <span className="todo-text">{todo.text}</span>

                <button
                  className="todo-delete"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="todo-stats">
          Erledigt ({doneTodos} / {todos.length})
        </p>

        {doneList.length === 0 ? (
          <p className="todo-empty">Noch nichts erledigt.</p>
        ) : (
          <ul className="todo-list todo-list--done">
            {doneList.map((todo) => (
              <li className="todo-item todo-item--done" key={todo.id}>
                <input
                  className="todo-checkbox"
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo)}
                />

                <span className="todo-text todo-text--done">{todo.text}</span>

                <button
                  className="todo-delete"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TodoPage;
