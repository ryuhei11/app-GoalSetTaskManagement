'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Goal = {
  id: string;
  title: string;
};

type Task = {
  id: string;
  goal_id: string;
  title: string;
  deadline: string;
  status: '未完了' | '実施中' | '完了';
};

type Props = {
  userId: string | null;
  goals: Goal[];
  onClose: () => void;
  onAdded: (newTask: Task) => void;
};

export default function AddTaskModal({ userId, goals, onClose, onAdded }: Props) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '');

  const handleAdd = async () => {
    if (!title || !goalId) return alert('タイトルと目標を選択してください');

    if (userId) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, deadline, goal_id: goalId, status: '未完了', user_id: userId }])
        .select()
        .single();
      if (error) return alert(error.message);
      onAdded(data);
    } else {
      const tempId = `temp-${Date.now()}`;
      onAdded({ id: tempId, title, deadline, goal_id: goalId, status: '未完了' });
    }

    onClose();
  };

  return (
    <div style={modalStyle}>
      <h2>タスク追加</h2>
      <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>{g.title}</option>
        ))}
      </select>
      <input placeholder="タスク名" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleAdd} style={buttonStyle}>追加</button>
        <button onClick={onClose} style={{ ...buttonStyle, marginLeft: 8 }}>キャンセル</button>
      </div>
    </div>
  );
}

const modalStyle = {
  position: 'fixed' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  zIndex: 1000,
};

const buttonStyle = {
  padding: '6px 12px',
  backgroundColor: '#008080',
  color: '#fff',
  borderRadius: 4,
};
