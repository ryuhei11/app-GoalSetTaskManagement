'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');

    // ① Supabase Auth にユーザー作成（匿名でOK）
    const { data, error: authError } = await supabase.auth.signUp({
      email: `${userId}@example.com`,
      password: userId,
    });

    if (authError || !data.user) {
      setError('サインアップに失敗しました');
      return;
    }

    // ② users テーブルに保存
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      user_id: userId,
      name: name,
    });

    if (insertError) {
      setError('ユーザー登録に失敗しました');
      return;
    }

    // ③ メイン画面へ
    router.push('/');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>サインアップ</h1>

      <div>
        <input
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="ユーザーID（自由入力）"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <button onClick={handleSignup}>登録</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
