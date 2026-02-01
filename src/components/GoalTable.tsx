'use client';
import React, { useState } from 'react';
import { Goal, Task } from '/types';
import DataGrid, { Column } from 'react-data-grid'; // ✅ import 修正
import { calculateProgress, getDeadlineColor } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

type Props = {
  goals: Goal[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onUpdateGoal?: (goal: Goal) => void;
  onUpdateTask?: (task: Task) => void;
};

export default function GoalTable({ goals, tasks, setTasks, onUpdateGoal, onUpdateTask }: Props) {
  const [filter, setFilter] = useState('');

  // DataGrid 用の行（検索フィルター済み）
  const rows = goals.flatMap(goal => {
    const goalTasks = tasks.filter(t => t.goal_id === goal.id && t.title.includes(filter));
    return goalTasks.length > 0
      ? goalTasks.map(t => ({ ...t, goal }))
      : [{ goal, id: '', title: '', deadline: '', status: '未完了' as const }];
  });

  const columns: Column<any>[] = [
    {
      key: 'goal',
      name: '目標',
      editable: false,
      formatter: ({ row }) => row.goal.title || '',
    },
    {
      key: 'title',
      name: 'タスク',
      editable: true,
    },
    {
      key: 'deadline',
      name: '期限',
      editable: true,
    },
    {
      key: 'progress',
      name: '進捗率',
      editable: false,
      formatter: ({ row }) =>
        row.goal ? calculateProgress(tasks.filter(t => t.goal_id === row.goal.id)) + '%' : '',
    },
    {
      key: 'status',
      name: 'タスクステータス',
      editable: true,
    },
  ];

  // DataGrid セル編集後の更新
  const handleRowsChange = async (updatedRows: any[]) => {
    for (const row of updatedRows) {
      if (!row.id) continue;

      // Supabase 更新
      await supabase
        .from('tasks')
        .update({ title: row.title, deadline: row.deadline, status: row.status })
        .eq('id', row.id);

      // state 更新
      setTasks(prev => prev.map(t => (t.id === row.id ? { ...t, ...row } : t)));

      // 呼び出し側の onUpdateTask コール
      if (onUpdateTask) onUpdateTask(row);
    }
  };

  // 目標間のタスクドラッグ＆ドロップ
  const onDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newGoalId = destination.droppableId;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // DB 更新
    await supabase.from('tasks').update({ goal_id: newGoalId }).eq('id', draggableId);

    // state 更新
    const updatedTask = { ...task, goal_id: newGoalId };
    setTasks(prev => prev.map(t => (t.id === draggableId ? updatedTask : t)));

    // 呼び出し側の onUpdateTask コール
    if (onUpdateTask) onUpdateTask(updatedTask);
  };

  return (
    <div className="mt-4">
      {/* 検索 */}
      <input
        type="text"
        placeholder="検索"
        className="border p-2 mb-2 w-full"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {/* タスクドラッグ */}
      <DragDropContext onDragEnd={onDragEnd}>
        {goals.map(goal => (
          <Droppable droppableId={goal.id} key={goal.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="mb-6 p-2 border rounded"
              >
                <h3 className="text-lg font-bold mb-2">{goal.title}</h3>
                {tasks
                  .filter(t => t.goal_id === goal.id && t.title.includes(filter))
                  .map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 mb-1 border rounded flex justify-between items-center"
                          style={{
                            backgroundColor: getDeadlineColor(task.deadline, task.status === '完了' ? 100 : undefined),
                            color: '#fff',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <span>{task.title}</span>
                          <span>{task.status}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>

      {/* DataGrid 表示（Excel風編集用） */}
      <DataGrid columns={columns} rows={rows} onRowsChange={handleRowsChange} />
    </div>
  );
}
