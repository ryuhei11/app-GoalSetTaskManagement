'use client';
import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import { Task, Goal } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: goalData } = await supabase.from('goals').select('*');
    const { data: taskData } = await supabase.from('tasks').select('*');
    if (goalData) setGoals(goalData);
    if (taskData) setTasks(taskData);
  };

  const events: BigCalendarEvent[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.deadline),
    end: new Date(task.deadline),
    allDay: true,
  }));

  const handleEventDrop = async ({ event, start }: { event: BigCalendarEvent; start: Date }) => {
    await supabase.from('tasks').update({ deadline: start.toISOString().split('T')[0] }).eq('id', event.id);
    setTasks(prev => prev.map(t => t.id === event.id ? { ...t, deadline: start.toISOString().split('T')[0] } : t));
  };

  const eventStyleGetter = (event: BigCalendarEvent) => {
    const task = tasks.find(t => t.id === event.id);
    const goal = goals.find(g => g.id === task?.goal_id);
    const today = new Date();
    let backgroundColor = '#008080';

    if (task) {
      const diff = new Date(task.deadline).getTime() - today.getTime();
      if (diff < 0) backgroundColor = '#8b0000';
      else if (diff < 24 * 60 * 60 * 1000) backgroundColor = '#ff0000';
    }

    return { style: { backgroundColor, color: 'white' } };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">カレンダー</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        draggableAccessor={() => true}
        onEventDrop={handleEventDrop}
      />
    </div>
  );
}
