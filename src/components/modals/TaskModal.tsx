import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function TaskModal({ userId, goals, onClose, onAdded }: any) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '');

  const handleAdd = async () => {
    if (!title || !deadline || !goalId) return;
    await supabase.from('tasks').insert({ title, deadline, goal_id: goalId, status: '未完了', user_id: userId });
    onAdded();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
      <h2>タスク追加</h2>
      <Input placeholder="タスク名" value={title} onChange={(e: any) => setTitle(e.target.value)} />
      <Input type="date" value={deadline} onChange={(e: any) => setDeadline(e.target.value)} />
      <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
        {goals.map((g: any) => <option key={g.id} value={g.id}>{g.title}</option>)}
      </select>
      <Button onClick={handleAdd} style={{ marginTop: 8 }}>追加</Button>
      <Button onClick={onClose} style={{ marginTop: 8, marginLeft: 8 }}>キャンセル</Button>
    </div>
  );
}
