'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import AddGoalModal from '../components/addGoalModal';
import AddTaskModal from '../components/addTaskModal';

type Goal = {
  id: string;
  title: string;
  deadline: string;
};

type Task = {
  id: string;
  goal_id: string;
  title: string;
  deadline: string;
  status: '未完了' | '実施中' | '完了';
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    field: 'goal' | 'goalDeadline' | 'task' | 'taskDeadline' | 'taskStatus';
    taskId?: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // =========================
  // DBから目標・タスク取得
  // =========================
  const fetchGoalsAndTasks = async (userId: string) => {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline');

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('deadline');

    setGoals(goals ?? []);
    setTasks(tasks ?? []);
  };

  // =========================
  // 初期処理
  // =========================
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) await fetchGoalsAndTasks(user.id);

      setLoading(false);
    };
    init();
  }, []);

  // =========================
  // 目標・タスク検索
  // =========================
  const filteredGoals = goals.filter((goal) => {
    if (goal.title.includes(keyword)) return true;
    const relatedTasks = tasks.filter((task) => task.goal_id === goal.id);
    return relatedTasks.some((task) => task.title.includes(keyword));
  });

  if (loading) return <p>読み込み中...</p>;

  return (
    <main style={{ padding: 24, backgroundColor: '#f8f8ff' }}>
      {/* ヘッダー */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ color: '#2f4f4f' }}>目標・タスク管理アプリ</h1>
        <div>
          {!user && (
            <>
              <Link href="/auth/signup">
                <button style={buttonStyle}>サインアップ</button>
              </Link>
              <Link href="/auth/signin">
                <button style={{ ...buttonStyle, marginLeft: 8 }}>サインイン</button>
              </Link>
            </>
          )}
          {user && (
            <button
              style={buttonStyle}
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
            >
              ログアウト
            </button>
          )}
        </div>
      </header>

      {!user && <p>ログインするとDBに保存されます。未ログインでも追加・編集は可能です。</p>}

      {/* 操作ボタン */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowAddGoal(true)} style={buttonStyle}>
          目標追加
        </button>

        <button
          onClick={() => {
            if (goals.length === 0) return alert('まず目標を追加してください');
            setShowAddTask(true);
          }}
          style={{ ...buttonStyle, marginLeft: 8 }}
        >
          タスク追加
        </button>
      </div>

      {/* 検索 */}
      <input
        type="text"
        placeholder="目標名・タスク名で検索"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          marginBottom: 16,
          padding: 8,
          width: '100%',
          maxWidth: 400,
        }}
      />

      {/* 表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
        <thead>
          <tr style={{ backgroundColor: '#008080', color: '#fff' }}>
            <th style={{ border: '1px solid #ccc', textAlign: 'left', padding: 8 }}>目標</th>
            <th style={{ border: '1px solid #ccc', textAlign: 'left', padding: 8 }}>タスク</th>
            <th style={{ border: '1px solid #ccc', textAlign: 'left', padding: 8 }}>期限</th>
            <th style={{ border: '1px solid #ccc', textAlign: 'left', padding: 8 }}>進捗率</th>
            <th style={{ border: '1px solid #ccc', textAlign: 'left', padding: 8 }}>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {filteredGoals.map((goal) => {
            const goalTasks = tasks.filter((task) => task.goal_id === goal.id);
            const completed = goalTasks.filter((task) => task.status === '完了').length;
            const progress = goalTasks.length === 0 ? 0 : Math.round((completed / goalTasks.length) * 100);

            return (
              <>
                {/* 親目標行 */}
                <tr key={goal.id} style={{ color: progress === 100 ? '#d3d3d3' : getDeadlineColor(goal.deadline) }}>
                  {/* 目標タイトル */}
                  <td
                    style={{ border: '1px solid #ccc', padding: 8 }}
                    onDoubleClick={() => {
                      setEditingCell({ rowId: goal.id, field: 'goal' });
                      setEditingValue(goal.title);
                    }}
                  >
                    {editingCell?.rowId === goal.id && editingCell.field === 'goal' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            if (user) await supabase.from('goals').update({ title: editingValue }).eq('id', goal.id);
                            setGoals(goals.map((g) => (g.id === goal.id ? { ...g, title: editingValue } : g)));
                            setEditingCell(null);
                            if (user) fetchGoalsAndTasks(user.id);
                          }
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      goal.title
                    )}
                  </td>

                  {/* タスク列空白 */}
                  <td style={{ border: '1px solid #ccc', padding: 8 }}></td>

                  {/* 期限列（目標のみ） */}
                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: 8,
                      fontWeight: 'bold',
                      color: getDeadlineColor(goal.deadline),
                    }}
                    onDoubleClick={() => {
                      setEditingCell({ rowId: goal.id, field: 'goalDeadline' });
                      setEditingValue(goal.deadline);
                    }}
                  >
                    {editingCell?.rowId === goal.id && editingCell.field === 'goalDeadline' ? (
                      <input
                        type="date"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            if (user) await supabase.from('goals').update({ deadline: editingValue }).eq('id', goal.id);
                            setGoals(goals.map((g) => (g.id === goal.id ? { ...g, deadline: editingValue } : g)));
                            setEditingCell(null);
                            if (user) fetchGoalsAndTasks(user.id);
                          }
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      goal.deadline
                    )}
                  </td>

                  {/* 進捗率 */}
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{progress}%</td>

                  {/* ステータス列空白 */}
                  <td style={{ border: '1px solid #ccc', padding: 8 }}></td>
                </tr>

                {/* 子タスク行 */}
                {goalTasks.map((task) => (
                  <tr key={task.id}>
                    {/* 目標列空白 */}
                    <td style={{ border: '1px solid #ccc', padding: 8 }}></td>

                    {/* タスクタイトル */}
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {editingCell?.taskId === task.id && editingCell.field === 'task' ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              if (user) await supabase.from('tasks').update({ title: editingValue }).eq('id', task.id);
                              setTasks(tasks.map((t) => (t.id === task.id ? { ...t, title: editingValue } : t)));
                              setEditingCell(null);
                              if (user) fetchGoalsAndTasks(user.id);
                            }
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        task.title
                      )}
                    </td>

                    {/* タスク期限 */}
                    <td
                      style={{
                        border: '1px solid #ccc',
                        padding: 8,
                        color: getDeadlineColor(task.deadline),
                      }}
                      onDoubleClick={() => {
                        setEditingCell({ rowId: goal.id, field: 'taskDeadline', taskId: task.id });
                        setEditingValue(task.deadline);
                      }}
                    >
                      {editingCell?.taskId === task.id && editingCell.field === 'taskDeadline' ? (
                        <input
                          type="date"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              if (user) await supabase.from('tasks').update({ deadline: editingValue }).eq('id', task.id);
                              setTasks(tasks.map((t) => (t.id === task.id ? { ...t, deadline: editingValue } : t)));
                              setEditingCell(null);
                              if (user) fetchGoalsAndTasks(user.id);
                            }
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        task.deadline
                      )}
                    </td>

                    {/* 進捗率空白 */}
                    <td style={{ border: '1px solid #ccc', padding: 8 }}></td>

                    {/* タスクステータス */}
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {editingCell?.taskId === task.id && editingCell.field === 'taskStatus' ? (
                        <select
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={async () => {
                            if (user) await supabase.from('tasks').update({ status: editingValue }).eq('id', task.id);
                            setTasks(
                              tasks.map((t) =>
                                t.id === task.id ? { ...t, status: editingValue as Task['status'] } : t
                              )
                            );
                            setEditingCell(null);
                            if (user) fetchGoalsAndTasks(user.id);
                          }}
                          autoFocus
                        >
                          <option value="未完了">未完了</option>
                          <option value="実施中">実施中</option>
                          <option value="完了">完了</option>
                        </select>
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingCell({ rowId: goal.id, field: 'taskStatus', taskId: task.id });
                            setEditingValue(task.status);
                          }}
                          style={{
                            color: task.status === '未完了' ? '#ff0000' : task.status === '実施中' ? '#1e90ff' : '#808080',
                          }}
                        >
                          {task.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>

      {/* モーダル */}
      {showAddGoal && (
        <AddGoalModal
          userId={user?.id ?? null}
          onClose={() => setShowAddGoal(false)}
          onAdded={(newGoal) => {
            if (user) fetchGoalsAndTasks(user.id);
            else setGoals([...goals, newGoal]);
          }}
        />
      )}
      {showAddTask && (
        <AddTaskModal
          userId={user?.id ?? null}
          goals={goals}
          onClose={() => setShowAddTask(false)}
          onAdded={(newTask) => {
            if (user) fetchGoalsAndTasks(user.id);
            else setTasks([...tasks, newTask]);
          }}
        />
      )}
    </main>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#008080',
  color: '#fff',
  borderRadius: 4,
};

const getDeadlineColor = (deadline: string) => {
  const today = new Date();
  const dueDate = new Date(deadline);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diff = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff < 0) return '#8b0000'; // 期限切れ
  if (diff === 0) return '#ff0000'; // 本日
  if (diff === 1) return '#deb887'; // 明日
  return '#2f4f4f';
};
