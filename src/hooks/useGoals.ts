import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useGoals = () => {
  const [goals, setGoals] = useState<any[]>([]);

  const fetchGoals = async (userId: string) => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('deadline');
    setGoals(data ?? []);
  };

  return { goals, fetchGoals };
};
