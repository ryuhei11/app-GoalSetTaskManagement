import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function GoalModal({ userId, onClose, onAdded }: any) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = async () => {
    if (!title || !deadline) return;
    await supabase.from('goals').insert({ title, deadline, user_id: userId });
    onAdded();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
      <h2>目標追加</h2>
      <Input placeholder="目標名" value={title} onChange={(e: any) => setTitle(e.target.value)} />
      <Input type="date" value={deadline} onChange={(e: any) => setDeadline(e.target.value)} />
      <Button onClick={handleAdd} style={{ marginTop: 8 }}>追加</Button>
      <Button onClick={onClose} style={{ marginTop: 8, marginLeft: 8 }}>キャンセル</Button>
    </div>
  );
}
