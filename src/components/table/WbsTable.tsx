import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function WbsTable({ goals, tasks, keyword, userId }: any) {
  const [editing, setEditing] = useState({ type: '', id: '', field: '' });
  const [editValue, setEditValue] = useState('');

  const saveEdit = async () => {
    if (!editing.id) return;
    const table = editing.type === 'goal' ? 'goals' : 'tasks';
    await supabase.from(table).update({ title: editValue }).eq('id', editing.id);
    setEditing({ type: '', id: '', field: '' });
    setEditValue('');
  };

  const filteredGoals = goals.filter((goal: any) => {
    if (goal.title.includes(keyword)) return true;
    return tasks.some((t: any) => t.goal_id === goal.id && t.title.includes(keyword));
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ background: '#008080', color: '#fff' }}>
        <tr>
          <th>目標</th>
          <th>タスク</th>
          <th>期限</th>
          <th>進捗率</th>
          <th>ステータス</th>
        </tr>
      </thead>
      <tbody>
        {filteredGoals.map((goal: any) => {
          const goalTasks = tasks.filter((t: any) => t.goal_id === goal.id);
          const progress = goalTasks.length === 0 ? 0 : Math.round((goalTasks.filter((t: any) => t.status === '完了').length / goalTasks.length) * 100);

          return (
            <tr key={goal.id} style={{ color: progress === 100 ? '#d3d3d3' : '#2f4f4f' }}>
              <td onDoubleClick={() => { setEditing({ type: 'goal', id: goal.id, field: 'title' }); setEditValue(goal.title); }}>
                {editing.id === goal.id && editing.type === 'goal' ? <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} /> : goal.title}
              </td>
              <td>
                {goalTasks.map((t: any) => (
                  <div key={t.id} onDoubleClick={() => { setEditing({ type: 'task', id: t.id, field: 'title' }); setEditValue(t.title); }}>
                    {editing.id === t.id && editing.type === 'task' ? <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} /> : t.title}
                  </div>
                ))}
              </td>
              <td>{goal.deadline}</td>
              <td>{progress}%</td>
              <td>
                {goalTasks.map((t: any) => (
                  <select key={t.id} value={t.status} onChange={async (e) => { await supabase.from('tasks').update({ status: e.target.value }).eq('id', t.id); }}>
                    <option>未完了</option>
                    <option>実施中</option>
                    <option>完了</option>
                  </select>
                ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
