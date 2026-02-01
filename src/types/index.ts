export type User = {
  id: string;
  name: string;
  account_id: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  deadline: string; // ISO日付
};

export type Task = {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  deadline: string; // ISO日付
  status: '未完了' | '実施中' | '完了';
};
