'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/types';

type Props = {
  onClose: () => void;
  onSignUp: (user: User) => void;
};

export default function SignupModal({ onClose, onSignUp }: Props) {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !accountId) {
      setError('名前とIDを入力してください');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ name, account_id: accountId })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (data) onSignUp(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl mb-4">サインアップ</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          className="border p-2 w-full mb-2"
          placeholder="名前"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
        />
        <input
          className="border p-2 w-full mb-4"
          placeholder="ID"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          maxLength={20}
        />
        <button className="bg-teal-600 text-white px-4 py-2 mr-2" onClick={handleSignup}>登録</button>
        <button className="bg-gray-400 text-white px-4 py-2" onClick={onClose}>キャンセル</button>
      </div>
    </div>
  );
}
