'use client';

import {
  Calendar,
  dateFnsLocalizer,
  Event,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task, Goal } from '../types';

type Props = {
  tasks: Task[];
  goals: Goal[];
  onUpdateTask: (taskId: string, newDeadline: string) => void;
};

const locales = { 'ja': ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function TaskCalendar({ tasks, goals, onUpdateTask }: Props) {
  // タスクをカレンダーイベント形式に変換
  const events: Event[] = tasks.map((task) => {
    const goal = goals.find((g) => g.id === task.goal_id);
    return {
      id: task.id,
      title: `${task.title} (${goal?.title ?? ''})`,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      allDay: true,
    };
  });

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['week']}
        style={{ height: '100%' }}
        draggableAccessor={() => true}
        onEventDrop={(e: any) => {
          const newDate = e.start.toISOString().split('T')[0];
          onUpdateTask(e.event.id, newDate);
        }}
        resizable
      />
    </div>
  );
}
