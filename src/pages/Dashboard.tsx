import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  CalendarDays,
  ArrowUpRight as External,
} from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadDashboard } from "../features/transactions/transactionSlice";
import DailySpendingAllowance from "../components/DailySpendingAllowance";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const statStyles = {
  purple: "bg-[#f0eaff] text-[#8060d8]",
  green: "bg-[#dcf8eb] text-[#12966d]",
  orange: "bg-[#fff0df] text-[#ed9436]",
  blue: "bg-[#e1f2ff] text-[#3198d4]",
};

type StatProps = {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: keyof typeof statStyles;
};

export default function Dashboard() {
  const dispatch = useAppDispatch();

  const { dashboard, loading } = useAppSelector((s) => s.data);

  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    dispatch(loadDashboard(month));
  }, [dispatch, month]);

  const label = useMemo(
    () =>
      new Date(`${month}-02T12:00:00`).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    [month],
  );

  const d = dashboard;

  const chartData = (d?.byCategory || []).map((category) => ({
    ...category,
    fill: category.color || "#10b981",
  }));

  const expensePercentage = d?.income
    ? Math.round((d.expenses / d.income) * 100)
    : 0;

  const progressWidth = Math.min(100, Math.max(0, expensePercentage));

  return (
    <div className="grid gap-6">
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-0.8px] text-(--text)">
            Overview
          </h1>

          <p className="mt-1.5 text-xs text-(--muted)">
            Here's what's happening with your money.
          </p>
        </div>

        <label className="flex items-center gap-2.5 rounded-[9px] border border-(--border) bg-(--surface) px-3 py-2.5 text-(--muted)">
          <CalendarDays size={17} />

          <input
            aria-label="Select month"
            type="month"
            value={month}
            // onChange={(e) => setMonth(e.target.value)}
            onChange={(e) => {
              if (e.target.value) {
                setMonth(e.target.value);
              }
            }}
            className="min-w-0 border-0 bg-transparent text-xs text-(--text) outline-none"
          />
        </label>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <Stat
          title="Total balance this month"
          value={money(d?.balance || 0)}
          detail="Income minus expenses"
          icon={<Wallet />}
          tone="purple"
        />

        <Stat
          title="Income"
          value={money(d?.income || 0)}
          detail={label}
          icon={<ArrowDownRight />}
          tone="green"
        />

        <Stat
          title="Expenses"
          value={money(d?.expenses || 0)}
          detail={label}
          icon={<ArrowUpRight />}
          tone="orange"
        />

        <Stat
          title="Savings rate"
          value={`${d?.savingsRate || 0}%`}
          detail="Of this month's income"
          icon={<TrendingUp />}
          tone="blue"
        />
      </section>

      <DailySpendingAllowance />

      <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-4.5">
        <div className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5 sm:p-5.5 shadow-(--shadow)">
          <div className="mb-5">
            <h2 className="text-sm font-bold tracking-tight text-(--text)">
              Spending by category
            </h2>

            <p className="mt-1.5 text-[11px] text-(--muted)">
              Where your money went in {label}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-57.5 items-center justify-center text-xs text-(--muted)">
              Loading your report...
            </div>
          ) : d?.byCategory?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(190px,1fr)_minmax(160px,0.9fr)] items-center gap-2">
              {/* Donut chart */}
              <div className="relative mx-auto w-full max-w-[320px] min-w-0">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={67}
                      outerRadius={91}
                      paddingAngle={3}
                      stroke="none"
                    />

                    <Tooltip
                      formatter={(value) => money(Number(value))}
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                      itemStyle={{
                        color: "var(--text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <strong className="text-[19px] font-bold tracking-tight text-(--text)">
                    {money(d.expenses)}
                  </strong>

                  <span className="mt-1 text-[10px] text-(--muted)">
                    Total spent
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                {d.byCategory.slice(0, 6).map((category) => (
                  <div
                    className="grid grid-cols-[9px_minmax(0,1fr)_auto] items-center gap-2 text-[11px]"
                    key={category.name}
                  >
                    <span
                      className="h-2 w-2 rounded-[3px]"
                      style={{
                        backgroundColor: category.color || "#10b981",
                      }}
                    />

                    <span className="truncate text-(--muted)">
                      {category.name}
                    </span>

                    <strong className="text-[11px] font-semibold text-(--text)">
                      {money(category.total)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-57.5 flex-col items-center justify-center gap-2.5 px-5 py-8 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-(--surface-2) text-(--muted)">
                <Wallet size={20} />
              </div>

              <strong className="text-[13px] font-bold text-(--text)">
                No expenses yet
              </strong>

              <span className="text-[11px] text-(--muted)">
                Add a transaction to see your spending breakdown.
              </span>

              <Link
                to="/transactions?new=1"
                className="mt-1 text-[11px] font-bold text-(--green-dark) hover:underline"
              >
                Add your first transaction
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5 sm:p-5.5 shadow-(--shadow)">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-(--text)">
                Quick insight
              </h2>

              <p className="mt-1.5 text-[11px] text-(--muted)">
                Your monthly snapshot
              </p>
            </div>

            <span className="grid h-9.25 w-9.25 shrink-0 place-items-center rounded-[11px] bg-[#e1f8ee] text-[#0c9b74]">
              <TrendingUp size={20} />
            </span>
          </div>

          <div className="grid gap-2.5 border-b border-(--border) py-3 pb-5">
            <span className="text-[11px] text-(--muted)">Net cash flow</span>

            <strong
              className={`text-[27px] font-bold tracking-tight ${
                (d?.balance || 0) >= 0 ? "text-[#0d9b70]" : "text-[#e35b5b]"
              }`}
            >
              {money(d?.balance || 0)}
            </strong>

            <p className="text-[11px] leading-relaxed text-(--muted)">
              {(d?.income || 0) > 0
                ? d!.balance >= 0
                  ? "You are spending less than you earn. Keep it up!"
                  : "Your expenses are higher than your income this month."
                : "Add income and expenses to see your cash flow."}
            </p>
          </div>

          <div className="mb-2.5 mt-4.75 flex items-center justify-between text-[11px]">
            <span className="text-(--text)">Expenses vs income</span>

            <strong className="font-semibold text-(--text)">
              {d?.income ? `${expensePercentage}%` : "—"}
            </strong>
          </div>

          <div className="h-1.75 overflow-hidden rounded-full bg-(--surface-2)">
            <div
              className="h-full rounded-full bg-[#10b981] transition-all duration-300"
              style={{
                width: `${progressWidth}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[10px] text-(--muted)">
            Based on transactions recorded for {label}.
          </p>
        </div>
      </section>

      <section className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5 sm:p-5.5 shadow-(--shadow)">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-(--text)">
              Recent transactions
            </h2>

            <p className="mt-1.5 text-[11px] text-(--muted)">
              Your latest money activity
            </p>
          </div>

          <Link
            to="/transactions"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-(--green-dark) hover:underline"
          >
            View all
            <External size={14} />
          </Link>
        </div>

        {d?.recent?.length ? (
          <div className="grid">
            {d.recent.map((transaction) => {
              const categoryColor = transaction.color || "#94a3b8";

              return (
                <div
                  className="flex items-center gap-3 border-b border-(--border) py-3.25 last:border-b-0"
                  key={transaction.id}
                >
                  <div
                    className="grid h-9.25 w-9.25 shrink-0 place-items-center rounded-[11px] text-sm font-bold"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {transaction.category?.slice(0, 1) || "T"}
                  </div>

                  <div className="grid min-w-0 flex-1 gap-1">
                    <strong className="truncate text-xs font-semibold text-(--text)">
                      {transaction.description ||
                        transaction.category ||
                        "Transaction"}
                    </strong>

                    <span className="text-[10px] text-(--muted)">
                      {transaction.category || "Uncategorized"} ·{" "}
                      {new Date(
                        `${transaction.date}T12:00:00`,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <strong
                    className={`shrink-0 whitespace-nowrap text-xs font-semibold ${
                      transaction.type === "income"
                        ? "text-[#0d9b70]"
                        : "text-(--text)"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "−"}
                    {money(transaction.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-45 flex-col items-center justify-center gap-2 text-center text-[11px] text-(--muted)">
            <span>No recent transactions.</span>

            <Link
              to="/transactions?new=1"
              className="font-bold text-(--green-dark) hover:underline"
            >
              Add one now
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ title, value, detail, icon, tone }: StatProps) {
  return (
    <article className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-3.75 sm:p-5 xl:p-5.75 shadow-(--shadow)">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-(--muted)">
        <span>{title}</span>

        <span
          className={`grid h-7.25 w-7.25 shrink-0 place-items-center rounded-[10px] sm:h-8.75 sm:w-8.75 ${statStyles[tone]}`}
        >
          {icon}
        </span>
      </div>

      <strong className="my-3.5 block overflow-wrap-anywhere text-[22px] font-bold tracking-[-0.8px] text-(--text) sm:my-4.25 sm:text-[28px]">
        {value}
      </strong>

      <span className="text-[9px] text-(--muted) sm:text-[10px]">{detail}</span>
    </article>
  );
}
