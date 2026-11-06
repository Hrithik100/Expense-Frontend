export type User = { id: number; name: string; email: string };
export type Category = {
  id: number;
  name: string;
  type: "income" | "expense" | "both";
  color: string;
};
export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  categoryId: number | null;
  category: string;
  description: string;
  date: string;
  color?: string;
};
export type Dashboard = {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  byCategory: { name: string; color: string; total: number }[];
  recent: Transaction[];
};
