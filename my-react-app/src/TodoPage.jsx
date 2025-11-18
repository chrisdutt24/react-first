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

  const openTodos = todos.filter((t) => !t.done).length;
  const doneTodos = todos.filter((t) => t.done).length;

  return (
    <section>
      <h2>Deine Todos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Neue Aufgabe hinzufügen..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            minWidth: "260px",
            marginRight: "0.5rem",
          }}
        />
        <button style={{ padding: "0.5rem 1.5rem" }} type="submit">
          Hinzufügen
        </button>
      </form>

      <p>
        Offene Aufgaben: {openTodos} / {todos.length}
      </p>

      {todos.filter((t) => !t.done).length === 0 ? ( // ⬅️⭐ geändert
        <p>Keine offenen Todos. 🎉</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {todos
            .filter((t) => !t.done) // ⬅️⭐ NEU: nur offene Todos
            .map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  style={{ transform: "scale(1.5)" }}
                />

                <span
                  style={{
                    flex: 1,
                  }}
                >
                  {todo.text}
                </span>

                <button
                  style={{ padding: "0.25rem 1.5rem" }}
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  ✕
                </button>
              </li>
            ))}
        </ul>
      )}

      <p style={{ marginTop: "2rem" }}>
        Erledigte Aufgaben: {doneTodos} / {todos.length}
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
        {todos
          .filter((t) => t.done) // ⬅️⭐ NEU: nur erledigte Todos
          .map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0",
                opacity: 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                style={{ transform: "scale(1.5)" }}
              />

              <span style={{ flex: 1, textDecoration: "line-through" }}>
                {todo.text}
              </span>

              <button
                style={{ padding: "0.25rem 1.5rem" }}
                type="button"
                onClick={() => deleteTodo(todo.id)}
              >
                ✕
              </button>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default TodoPage;
