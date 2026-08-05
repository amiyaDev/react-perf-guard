import { useEffect, useState } from "react";
import { PerfProfiler } from "react-perf-guard";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodosWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=20")
      .then((r) => r.json())
      .then(setTodos)
      .catch(() => setTodos([]));
  }, []);

  const done = todos.filter((t) => t.completed).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <PerfProfiler id="TodosWidget" boundaryType="LAYOUT">
      <div className="widget">
        <h3 className="widget-title">✅ Todo Progress</h3>
        <p className="widget-source">jsonplaceholder.typicode.com/todos</p>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress-label">
          {done} / {todos.length} complete ({pct}%)
        </p>
        <ul className="widget-list">
          {todos.slice(0, 6).map((t) => (
            <li key={t.id} className="todo-item">
              <span>{t.completed ? "☑" : "☐"}</span> {t.title}
            </li>
          ))}
        </ul>
      </div>
    </PerfProfiler>
  );
}
