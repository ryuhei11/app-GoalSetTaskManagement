import { Task } from '../types';
import { differenceInCalendarDays } from 'date-fns';

export const calculateProgress = (tasks: Task[]) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === '完了').length;
  return Math.round((completed / tasks.length) * 100);
};

// 期限による色判定
export const getDeadlineColor = (date: string, progress?: number) => {
  const today = new Date();
  const target = new Date(date);

  if (progress === 100) return '#d3d3d3';
  if (differenceInCalendarDays(target, today) < 0) return '#8b0000';
  if (differenceInCalendarDays(target, today) === 1) return '#ff0000';
  return '#008080';
};
