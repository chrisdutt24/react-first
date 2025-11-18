import { useState, useEffect } from "react";

const STORAGE_KEY = "todo-lists-v1";
const MAX_LISTS = 5;

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const createList = (name) => ({
  id: generateId(),
  name,
  todos: [],
});

const loadInitialState = () => {
  const fallbackList = createList("Meine Todos");

  if (typeof window === "undefined") {
    return { lists: [fallbackList], activeListId: fallbackList.id };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.lists) && parsed.lists.length > 0) {
        const normalizedLists = parsed.lists.map((list) => ({
          ...list,
          todos: Array.isArray(list.todos) ? list.todos : [],
        }));

        const activeList =
          normalizedLists.find((list) => list.id === parsed.activeListId) ??
          normalizedLists[0];

        return {
          lists: normalizedLists,
          activeListId: activeList.id,
        };
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Listen aus dem Speicher:", error);
  }

  return { lists: [fallbackList], activeListId: fallbackList.id };
};

function TodoPage() {
  const [listState, setListState] = useState(loadInitialState);
  const [newTodo, setNewTodo] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const { lists, activeListId } = listState;
  const activeList =
    lists.find((list) => list.id === activeListId) ?? lists[0] ?? null;
  const todos = activeList?.todos ?? [];

  const openList = todos.filter((todo) => !todo.done);
  const doneList = todos.filter((todo) => todo.done);
  const openTodos = openList.length;
  const doneTodos = doneList.length;
  const canAddList = lists.length < MAX_LISTS;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lists,
        activeListId: activeList?.id ?? activeListId,
      })
    );
  }, [lists, activeList?.id, activeListId]);

  const updateActiveListTodos = (updater) => {
    setListState((prev) => {
      const targetId = prev.activeListId;
      const updatedLists = prev.lists.map((list) => {
        if (list.id !== targetId) return list;
        const nextTodos = updater(Array.isArray(list.todos) ? list.todos : []);
        return { ...list, todos: nextTodos };
      });
      return { ...prev, lists: updatedLists };
    });
  };

  function handleSubmit(event) {
    event.preventDefault();
    if (!activeList) return;
    const trimmed = newTodo.trim();
    if (!trimmed) return;

    setNewTodo("");
    updateActiveListTodos((prevTodos) => [
      { id: Date.now(), text: trimmed, done: false },
      ...prevTodos,
    ]);
  }

  function toggleTodo(id) {
    updateActiveListTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  function deleteTodo(id) {
    updateActiveListTodos((prevTodos) =>
      prevTodos.filter((todo) => todo.id !== id)
    );
  }

  function handleSwitchList(id) {
    if (id === activeListId) {
      setIsMenuOpen(false);
      return;
    }

    const exists = lists.some((list) => list.id === id);
    if (!exists) return;

    setListState((prev) => ({ ...prev, activeListId: id }));
    setIsMenuOpen(false);
  }

  function handleAddList(event) {
    event.preventDefault();
    if (!canAddList) return;

    const trimmed = newListName.trim();
    if (!trimmed) return;

    const newList = createList(trimmed);
    setListState((prev) => ({
      lists: [...prev.lists, newList],
      activeListId: newList.id,
    }));
    setNewListName("");
    setIsMenuOpen(false);
  }

  return (
    <section className="todo-page">
      <div className="todo-card">
        <div className="todo-top-bar">
          <div>
            <p className="todo-label">Aktuelle Liste</p>
            <h1>{activeList?.name ?? "Todo-Liste"}</h1>
          </div>

          <button
            type="button"
            className={`todo-menu-toggle ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Listenmenü öffnen"
            aria-pressed={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {isMenuOpen && (
          <>
            <button
              type="button"
              className="todo-menu-overlay"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Listenmenü schließen"
            />

            <div className="todo-menu" role="menu">
              <div className="todo-menu-header">
                <div>
                  <p className="todo-label">Listen</p>
                  <h3>Deine Boards</h3>
                </div>
                <span className="todo-menu-count">
                  {lists.length} / {MAX_LISTS}
                </span>
              </div>

              <ul className="todo-menu-list">
                {lists.map((list) => (
                  <li key={list.id}>
                    <button
                      type="button"
                      className={`todo-menu-item${
                        list.id === activeList?.id ? " is-active" : ""
                      }`}
                      onClick={() => handleSwitchList(list.id)}
                    >
                      <span>{list.name}</span>
                      <small>{list.todos?.length ?? 0} Todos</small>
                    </button>
                  </li>
                ))}
              </ul>

              <form className="todo-menu-form" onSubmit={handleAddList}>
                <input
                  className="todo-menu-input"
                  type="text"
                  placeholder="Neue Liste benennen..."
                  value={newListName}
                  onChange={(event) => setNewListName(event.target.value)}
                  disabled={!canAddList}
                />
                <button
                  className="todo-menu-submit"
                  type="submit"
                  disabled={
                    !canAddList || newListName.trim().length === 0
                  }
                >
                  Liste erstellen
                </button>
              </form>

              {!canAddList && (
                <p className="todo-menu-limit">
                  Du hast das Maximum von fünf Listen erreicht.
                </p>
              )}
            </div>
          </>
        )}

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
