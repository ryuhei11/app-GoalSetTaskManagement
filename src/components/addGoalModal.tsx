'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = {
  userId: string | null;
  onClose: () => void;
  onAdded: (newGoal: { id: string; title: string; deadline: string }) => void;
};

export default function AddGoalModal({ userId, onClose, onAdded }: Props) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = async () => {
    if (!title) return alert('タイトルを入力してください');

    if (userId) {
      // DBに保存
      const { data, error } = await supabase.from('goals').insert([{ title, deadline, user_id: userId }]).select().single();
      if (error) return alert(error.message);
      onAdded(data);
    } else {
      // 未ログインはローカル state
      const tempId = `temp-${Date.now()}`;
      onAdded({ id: tempId, title, deadline });
    }

    onClose();
  };

  return (
    <div style={modalStyle}>
      <h2>目標追加</h2>
      <input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
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
