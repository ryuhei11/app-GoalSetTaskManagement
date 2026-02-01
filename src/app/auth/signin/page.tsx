'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SigninPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSignin = async () => {
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: `${userId}@example.com`,
      password: userId,
    });

    if (error) {
      setError('ログインに失敗しました');
      return;
    }

    router.push('/');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>サインイン</h1>

      <input
        placeholder="ユーザーID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={handleSignin}>ログイン</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
