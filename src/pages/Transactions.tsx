import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  deleteTransaction,
  loadDashboard,
  loadTransactions,
  saveTransaction,
} from "../features/transactions/transactionSlice";

import type { Transaction } from "../types";

const monthNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const fieldClass =
  "min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[11px] py-[10px] text-xs text-[var(--text)] outline-none focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10";

export default function Transactions() {
  const dispatch = useAppDispatch();

  const { items, categories } = useAppSelector((s) => s.data);

  const [params, setParams] = useSearchParams();

  const [month, setMonth] = useState(monthNow());
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(params.get("new") === "1");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    type: "expense" as "expense" | "income",
    amount: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const reload = () => {
    dispatch(
      loadTransactions({
        month,
        type: type === "all" ? undefined : type,
        search,
      }),
    );

    dispatch(loadDashboard(month));
  };

  useEffect(() => {
    reload();
  }, [dispatch, month, type, search]);

  const openNew = () => {
    setEditing(null);

    setForm({
      type: "expense",
      amount: "",
      categoryId: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
    });

    setModal(true);
    setParams({ new: "1" });
  };

  const close = () => {
    if (saving) return;

    setModal(false);
    setEditing(null);
    setParams({});
  };

  const edit = (t: Transaction) => {
    setEditing(t);

    setForm({
      type: t.type,
      amount: String(t.amount),
      categoryId: t.categoryId ? String(t.categoryId) : "",
      date: t.date,
      description: t.description || "",
    });

    setModal(true);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      await dispatch(
        saveTransaction({
          ...(editing ? { id: editing.id } : {}),
          type: form.type,
          amount: Number(form.amount),
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          date: form.date,
          description: form.description,
        }),
      ).unwrap();

      setModal(false);
      setEditing(null);
      setParams({});
      reload();
    } catch {
      alert("Could not save transaction. Check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;

    setDeletingId(id);

    try {
      await dispatch(deleteTransaction(id)).unwrap();
      reload();
    } catch {
      alert("Could not delete transaction. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-5.75">
      <section className="flex items-center justify-between gap-4.5 max-sm:flex-wrap">
        <div>
          <h1 className="mb-1.75 text-[25px] font-bold tracking-[-0.8px] text-(--text)">
            Transactions
          </h1>

          <p className="text-xs text-(--muted)">
            Keep track of every rupee coming in and going out.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#0c9b74] px-3.75 py-2.75 text-xs font-bold text-white shadow-[0_3px_7px_#0c9b7418] transition hover:bg-[#087f60] max-sm:whitespace-nowrap"
        >
          <Plus size={18} />
          Add transaction
        </button>
      </section>

      <section className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5.5 shadow-(--shadow) max-sm:p-4.25">
        <div className="mb-4.5 flex items-center gap-2.5 max-sm:flex-wrap">
          <label className="flex h-9.75 min-w-30 flex-1 items-center gap-2.25 rounded-[9px] border border-(--border) px-3 text-(--muted) focus-within:border-[#0c9b74]">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full min-w-0 border-0 bg-transparent text-xs text-(--text) outline-none placeholder:text-(--muted)"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-(--muted) hover:text-(--text)"
              >
                <X size={15} />
              </button>
            )}
          </label>

          <select
            aria-label="Filter transaction type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${fieldClass} max-sm:flex-1`}
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          <input
            aria-label="Filter month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`${fieldClass} max-sm:flex-1`}
          />
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[620px] border-collapse text-left whitespace-nowrap">
            <thead>
              <tr>
                <th className="bg-(--surface-2) px-3 py-3.25 text-[10px] font-bold text-(--muted)">
                  Transaction
                </th>
                <th className="bg-(--surface-2) px-3 py-3.25 text-[10px] font-bold text-(--muted)">
                  Category
                </th>
                <th className="bg-(--surface-2) px-3 py-3.25 text-[10px] font-bold text-(--muted)">
                  Date
                </th>
                <th className="bg-(--surface-2) px-3 py-3.25 text-[10px] font-bold text-(--muted)">
                  Amount
                </th>
                <th className="bg-(--surface-2) px-3 py-3.25 text-right text-[10px] font-bold text-(--muted)">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="transition hover:bg-(--surface-2)/50">
                  <td className="border-b border-(--border) px-3 py-3.5 text-[11px]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${
                          t.type === "income"
                            ? "bg-[#def8eb] text-[#0d9b70]"
                            : "bg-[#fff0e5] text-[#e38b3e]"
                        }`}
                      >
                        {t.type === "income" ? (
                          <ArrowDownLeft size={17} />
                        ) : (
                          <ArrowUpRight size={17} />
                        )}
                      </span>

                      <div className="grid min-w-0 gap-1">
                        <strong className="max-w-[220px] truncate text-[11px] font-semibold text-(--text)">
                          {t.description || t.category || "Transaction"}
                        </strong>
                        <small className="text-[10px] text-(--muted)">
                          {t.type === "income" ? "Income" : "Expense"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td className="border-b border-(--border) px-3 py-3.5 text-[11px]">
                    <span className="inline-flex items-center gap-1.75 text-(--muted)">
                      <i
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: t.color || "#94a3b8" }}
                      />
                      {t.category || "Uncategorized"}
                    </span>
                  </td>

                  <td className="border-b border-(--border) px-3 py-3.5 text-[11px] text-(--muted)">
                    {new Date(`${t.date}T12:00:00`).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </td>

                  <td
                    className={`border-b border-(--border) px-3 py-3.5 text-[11px] font-semibold ${
                      t.type === "income" ? "text-[#0d9b70]" : "text-(--text)"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {money(t.amount)}
                  </td>

                  <td className="border-b border-(--border) px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1.25">
                      <button
                        type="button"
                        onClick={() => edit(t)}
                        disabled={deletingId === t.id}
                        className="rounded-md px-1.5 py-1.5 text-[10px] text-(--muted) transition hover:bg-(--surface-2) hover:text-(--text)"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        disabled={deletingId === t.id}
                        aria-label="Delete transaction"
                        className="rounded-md p-1.5 text-(--muted) transition hover:bg-(--surface-2) hover:text-[#e35b5b]"
                      >
                        {deletingId === t.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile transaction cards */}
        <div className="grid gap-3 sm:hidden">
          {items.map((t) => (
            <div
              key={t.id}
              className="min-w-0 rounded-xl border border-(--border) bg-(--surface) p-3.5"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] ${
                      t.type === "income"
                        ? "bg-[#def8eb] text-[#0d9b70]"
                        : "bg-[#fff0e5] text-[#e38b3e]"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-(--text)">
                      {t.description || t.category || "Transaction"}
                    </p>
                    <p className="mt-1 text-[10px] text-(--muted)">
                      {t.type === "income" ? "Income" : "Expense"}
                    </p>
                  </div>
                </div>

                <p
                  className={`shrink-0 text-xs font-bold ${
                    t.type === "income" ? "text-[#0d9b70]" : "text-(--text)"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {money(t.amount)}
                </p>
              </div>

              <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-(--border) pt-3">
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-(--muted)">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ background: t.color || "#94a3b8" }}
                    />
                    {t.category || "Uncategorized"}
                  </p>

                  <p className="mt-1 text-[10px] text-(--muted)">
                    {new Date(`${t.date}T12:00:00`).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => edit(t)}
                    disabled={deletingId === t.id}
                    className="rounded-md border border-(--border) px-3 py-1.5 text-[10px] font-semibold text-(--text)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    disabled={deletingId === t.id}
                    aria-label="Delete transaction"
                    className="rounded-md border border-(--border) p-1.5 text-(--muted)"
                  >
                    {deletingId === t.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="flex min-h-45 flex-col items-center justify-center gap-2.5 px-5 py-5 text-center text-[11px] text-(--muted)">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-(--surface-2)">
              <Search size={20} />
            </div>

            <strong className="text-[13px] text-(--text)">
              No transactions found
            </strong>

            <span>Try a different search or add a new transaction.</span>

            <button
              type="button"
              onClick={openNew}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-[9px] border border-(--border) bg-(--surface) px-3.75 py-2.75 text-xs font-bold text-(--text)"
            >
              <Plus size={16} />
              Add transaction
            </button>
          </div>
        )}
      </section>

      {modal && (
        <div
          className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-[#0c1712a6] p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) close();
          }}
        >
          <section
            className="my-auto max-h-[calc(100vh-32px)] w-full max-w-115 overflow-y-auto rounded-[17px] border border-(--border) bg-[var(--surface)] p-6 text-[var(--text)] shadow-[0_25px_80px_#0002] max-sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-title"
          >
            <div className="mb-5.5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="transaction-title"
                  className="mb-1.5 text-[19px] font-bold tracking-[-0.4px]"
                >
                  {editing ? "Edit transaction" : "Add transaction"}
                </h2>

                <p className="text-[11px] text-(--muted)">
                  Record the details of your money movement.
                </p>
              </div>

              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-(--border) bg-(--surface) text-(--text)"
                onClick={close}
                disabled={saving}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-1 rounded-[9px] bg-(--surface-2) p-1">
                <button
                  type="button"
                  className={`rounded-[7px] border-0 px-2.5 py-2.5 text-xs font-bold transition ${
                    form.type === "expense"
                      ? "bg-(--surface) text-[#e38b3e] shadow-[0_1px_5px_#0001]"
                      : "bg-transparent text-(--muted)"
                  }`}
                  onClick={() =>
                    setForm({ ...form, type: "expense", categoryId: "" })
                  }
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowUpRight size={16} />
                    Expense
                  </span>
                </button>

                <button
                  type="button"
                  className={`rounded-[7px] border-0 px-2.5 py-2.5 text-xs font-bold transition ${
                    form.type === "income"
                      ? "bg-(--surface) text-[#0d9b70] shadow-[0_1px_5px_#0001]"
                      : "bg-transparent text-(--muted)"
                  }`}
                  onClick={() =>
                    setForm({ ...form, type: "income", categoryId: "" })
                  }
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowDownLeft size={16} />
                    Income
                  </span>
                </button>
              </div>

              <label className="grid gap-1.75 text-[11px] font-bold">
                Amount (₹)
                <input
                  required
                  type="number"
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className={`${fieldClass} h-10.5 w-full`}
                />
              </label>

              <label className="grid gap-1.75 text-[11px] font-bold">
                Category
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className={`${fieldClass} h-10.5 w-full`}
                >
                  <option value="">Uncategorized</option>

                  {categories
                    .filter((c) => c.type === form.type || c.type === "both")
                    .map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="grid gap-1.75 text-[11px] font-bold">
                Date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`${fieldClass} h-10.5 w-full`}
                />
              </label>

              <label className="grid gap-1.75 text-[11px] font-bold">
                Description{" "}
                <span className="font-normal text-(--muted)">(optional)</span>
                <input
                  maxLength={255}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="e.g. Weekly groceries"
                  className={`${fieldClass} h-10.5 w-full`}
                />
              </label>

              <div className="mt-1.5 flex justify-end gap-2.25 border-t border-(--border) pt-5 max-sm:flex-col-reverse">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[9px] border border-(--border) bg-(--surface) px-3.75 py-2.75 text-xs font-bold text-(--text) transition hover:bg-(--surface-2)"
                  onClick={close}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.amount ||
                    Number(form.amount) <= 0 ||
                    !form.date
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-[#0c9b74] px-3.75 py-2.75 text-xs font-bold text-white shadow-[0_3px_7px_#0c9b7418] transition hover:bg-[#087f60] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "Save transaction"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
