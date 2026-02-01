import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async (userId: string) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('deadline');
    setTasks(data ?? []);
  };

  return { tasks, fetchTasks };
};
