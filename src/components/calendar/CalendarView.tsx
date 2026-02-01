import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CalendarView({ goals, tasks, userId }: any) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return [...Array(7)].map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  };
  const weekDates = getWeekDates();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleDrop = async (date: string) => {
    if (!dragTaskId) return;
    await supabase.from('tasks').update({ deadline: date }).eq('id', dragTaskId);
    setDragTaskId(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 32 }}>
      {weekDates.map((date) => {
        const dateStr = formatDate(date);
        return (
          <div key={dateStr} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(dateStr)} style={{ border: '1px solid #008080', padding: 8, minHeight: 140, background: '#fff' }}>
            <strong>{date.getMonth() + 1}/{date.getDate()}</strong>
            {tasks.filter((t: any) => t.deadline === dateStr).map((task: any) => {
              const goal = goals.find((g: any) => g.id === task.goal_id);
              return (
                <div key={task.id} draggable onDragStart={() => setDragTaskId(task.id)} style={{ marginTop: 6, padding: 6, background: '#e0ffff', cursor: 'grab' }} title={`目標: ${goal?.title}`}>
                  {task.title}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
