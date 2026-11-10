import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import type { Category, Dashboard, Transaction } from "../../types";
type State = {
  items: Transaction[];
  categories: Category[];
  dashboard: Dashboard | null;
  loading: boolean;
  error: string | null;
  totalTransactions: number;
};
const initialState: State = {
  items: [],
  categories: [],
  dashboard: null,
  loading: false,
  error: null,
  totalTransactions: 0,
};
export const loadDashboard = createAsyncThunk(
  "data/dashboard",
  async (month: string) => {
    const [d, c] = await Promise.all([
      api.get("/dashboard", { params: { month } }),
      api.get("/categories"),
    ]);
    return { dashboard: d.data as Dashboard, categories: c.data as Category[] };
  },
);
export const loadTransactions = createAsyncThunk(
  "data/transactions",
  async (params: {
    month: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/transactions", {
      params: {
        ...params,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });

    return {
      items: response.data.items as Transaction[],
      total: Number(response.data.total),
    };
  },
);
export const saveTransaction = createAsyncThunk(
  "data/save",
  async (
    data: Partial<Transaction> & {
      type: "income" | "expense";
      amount: number;
      date: string;
    },
  ) => {
    const r = data.id
      ? await api.put(`/transactions/${data.id}`, data)
      : await api.post("/transactions", data);
    return r.data as Transaction;
  },
);
export const deleteTransaction = createAsyncThunk(
  "data/delete",
  async (id: number) => {
    await api.delete(`/transactions/${id}`);
    return id;
  },
);
const slice = createSlice({
  name: "data",
  initialState,
  reducers: {
    clearData(s) {
      s.items = [];
      s.categories = [];
      s.dashboard = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadDashboard.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(loadDashboard.fulfilled, (s, a) => {
        s.loading = false;
        s.dashboard = a.payload.dashboard;
        s.categories = a.payload.categories;
      })
      .addCase(loadDashboard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Unable to load dashboard";
      });
    b.addCase(loadTransactions.fulfilled, (s, a) => {
      s.items = a.payload.items;
      s.totalTransactions = a.payload.total;
    })
      .addCase(saveTransaction.fulfilled, (s) => {
        s.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t.id !== a.payload);
      });
  },
});
export const { clearData } = slice.actions;
export default slice.reducer;
