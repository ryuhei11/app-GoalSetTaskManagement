"use client";
import { useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    setTasks([...tasks, input]);
    setInput("");
  };

  return (
    <main>
      <h1>タスク管理</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addTask}>追加</button>

      <ul>
        {tasks.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>
    </main>
  );
}
