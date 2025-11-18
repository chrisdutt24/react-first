// src/TodoPage.jsx
import { useState, useEffect } from "react";

// Ausgangsituation: keine Beispiel-Todos
const initialTodos = [];

function TodoPage() {
  // 1) Beim ersten Render versuchen wir, aus dem LocalStorage zu laden
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (!saved) return initialTodos;
      const parsed = JSON.parse(saved);

      // nur falls es wirklich ein Array ist:
      if (Array.isArray(parsed)) return parsed;
      return initialTodos;
    } catch (err) {
      console.error("Fehler beim Lesen aus localStorage:", err);
      return initialTodos;
    }
  });

  const [newTodo, setNewTodo] = useState("");

  // 2) Immer wenn sich todos ändern, in localStorage speichern
  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (err) {
      console.error("Fehler beim Schreiben in localStorage:", err);
    }
  }, [todos]);

  // Funktionen zum Hinzufügen, Umschalten und Löschen von Todos
  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = newTodo.trim();
    if (!trimmed) return;

    setNewTodo("");

    setTodos((prev) => [
      { id: Date.now(), text: trimmed, done: false },
      ...prev,
    ]);
  }

  function toggleTodo(id) {
    setTodos((prev) => {
      // 1. Erst alle Todos aktualisieren (done togglen)
      const updated = prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      );

      // 2. Danach sortieren: offene zuerst, erledigte danach
      return updated.sort((a, b) => Number(a.done) - Number(b.done));
    });
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
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
                  onChange={() => toggleTodo(todo.id)}
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
                  onChange={() => toggleTodo(todo.id)}
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
