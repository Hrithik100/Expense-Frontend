import { useEffect, useState } from "react";
import { Target, Plus } from "lucide-react";
import { api } from "../services/api";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadDashboard } from "../features/transactions/transactionSlice";

type Budget = {
  categoryId: number;
  category: string;
  color: string;
  budget: number;
  spent: number;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const inputClass =
  "h-[42px] w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[11px] text-xs text-[var(--text)] outline-none transition focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10";

export default function Budgets() {
  const dispatch = useAppDispatch();

  const categories = useAppSelector((s) => s.data.categories);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      const r = await api.get("/budgets", {
        params: { month },
      });

      setBudgets(r.data);
      setError("");
    } catch {
      setError("Could not load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    dispatch(loadDashboard(month));
  }, [month, dispatch]);

  const save = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      await api.put(`/budgets/${categoryId}`, {
        month,
        amount: Number(amount),
      });

      setAmount("");
      setCategoryId("");

      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Could not save budget.");
    } finally {
      setBusy(false);
    }
  };

  const monthLabel = new Date(`${month}-02`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid gap-5.75">
      <section className="flex items-center justify-between gap-4.5 max-sm:flex-wrap">
        <div>
          <h1 className="mb-1.75 text-[25px] font-bold tracking-[-0.8px] text-(--text)">
            Budgets
          </h1>

          <p className="text-xs text-(--muted)">
            Set category limits and keep spending on track.
          </p>
        </div>

        {/* Month selector */}
        <label className="flex items-center gap-2.25 rounded-[9px] border border-(--border) bg-(--surface) px-2.75 py-2.25 text-(--muted)">
          <input
            aria-label="Budget month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="min-w-0 border-0 bg-transparent text-xs text-(--text) outline-none"
          />
        </label>
      </section>

      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)] items-start gap-4.5 max-lg:grid-cols-1">
        <section className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5.5 shadow-(--shadow) max-sm:p-4.25">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="mb-1.5 text-sm font-bold tracking-[-0.2px] text-(--text)">
                Your monthly limits
              </h2>

              <p className="text-[11px] text-(--muted)">
                Track how much of each budget you've used.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-45 items-center justify-center text-xs text-(--muted)">
              Loading your budgets...
            </div>
          ) : budgets.length ? (
            <div className="grid gap-6">
              {budgets.map((b) => {
                const pct =
                  b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : 0;

                const overBudget = pct > 100;

                return (
                  <div key={b.categoryId}>
                    <div className="mb-2.75 flex items-center justify-between gap-3 max-sm:flex-wrap">
                      <span className="flex items-center gap-2.25 text-xs font-semibold text-(--text)">
                        <i
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background: b.color || "#94a3b8",
                          }}
                        />

                        {b.category}
                      </span>

                      <strong className="whitespace-nowrap text-[11px] font-semibold text-(--text)">
                        {money(b.spent)}{" "}
                        <span className="font-normal text-(--muted)">
                          / {money(b.budget)}
                        </span>
                      </strong>
                    </div>

                    <div className="h-1.75 overflow-hidden rounded-full bg-(--surface-2)">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          overBudget ? "bg-[#ef4444]" : "bg-[#10b981]"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, pct))}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 text-[10px]">
                      <span className="text-(--muted)">{pct}% used</span>

                      <span
                        className={
                          overBudget
                            ? "font-medium text-[#e35b5b]"
                            : "text-(--muted)"
                        }
                      >
                        {overBudget
                          ? `${money(b.spent - b.budget)} over budget`
                          : `${money(Math.max(0, b.budget - b.spent))} remaining`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-45 flex-col items-center justify-center gap-2.5 px-5 py-5 text-center text-[11px] text-(--muted)">
              <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-(--surface-2)">
                <Target size={20} className="text-(--muted)" />
              </div>

              <strong className="text-[13px] text-(--text)">
                No budgets for {monthLabel}
              </strong>

              <span>
                Create a category budget to start tracking your limits.
              </span>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5.5 shadow-(--shadow) max-sm:p-4.25">
          <div className="mb-5">
            <h2 className="mb-1.5 text-sm font-bold tracking-[-0.2px] text-(--text)">
              Create a budget
            </h2>

            <p className="text-[11px] text-(--muted)">
              Choose an expense category and limit.
            </p>
          </div>

          <form onSubmit={save} className="grid gap-4">
            <label className="grid gap-1.75 text-[11px] font-bold text-(--text)">
              Expense category
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a category</option>

                {categories
                  .filter((c) => c.type === "expense" || c.type === "both")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="grid gap-1.75 text-[11px] font-bold text-(--text)">
              Monthly limit (₹)
              <input
                required
                type="number"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className={inputClass}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-[#fff0f0] px-2.5 py-2.5 text-[11px] text-[#bd3030]"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy || !categoryId || !amount || Number(amount) <= 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[9px] border-0 bg-[#0c9b74] px-3.75 py-2.75 text-xs font-bold text-white shadow-[0_3px_7px_#0c9b7418] transition hover:bg-[#087f60] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />

              {busy ? "Saving..." : "Save budget"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
