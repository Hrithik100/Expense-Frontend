
import { useEffect, useState } from "react";
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import { useAppSelector } from "../app/hooks";

interface DashboardSummary {
  income: number;
  expenses: number;
  balance: number;
}

interface DailyExpensesResponse {
  total: number;
  transactionCount: number;
}

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
};

export default function DailySpendingAllowance() {
  const revision = useAppSelector((state) => state.data.revision);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchAllowanceData = async () => {
      try {
        setLoading(true);
        setError("");

        const today = getLocalDate(new Date());
        const month = getCurrentMonth();

        const [dashboardResponse, dailyResponse] = await Promise.all([
          api.get<DashboardSummary>("/dashboard", {
            params: { month },
          }),
          api.get<DailyExpensesResponse>(
            "/transactions/daily-expenses",
            { params: { date: today } },
          ),
        ]);

        if (!active) return;

        setSummary(dashboardResponse.data);
        setTodayExpenses(Number(dailyResponse.data.total) || 0);
      } catch {
        if (active) {
          setError("Unable to calculate your spending allowance.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAllowanceData();

    return () => {
      active = false;
    };
  }, [revision]);

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const remainingDays = daysInMonth - now.getDate() + 1;

  const income = Number(summary?.income) || 0;
  const expenses = Number(summary?.expenses) || 0;
  const monthlyBalance = Number(summary?.balance) || income - expenses;

  // Balance before today's expenses, so today's spending
  // is compared fairly against today's allowance.
  const balanceAtStartOfToday = monthlyBalance + todayExpenses;

  const dailyAllowance =
    remainingDays > 0
      ? Math.max(0, balanceAtStartOfToday) / remainingDays
      : 0;

  const difference = dailyAllowance - todayExpenses;

  const spendingPercentage =
    dailyAllowance > 0
      ? Math.min(100, (todayExpenses / dailyAllowance) * 100)
      : todayExpenses > 0
        ? 100
        : 0;

  const isOverLimit = difference < 0;

  return (
    <section className="min-w-0 rounded-[14px] border border-(--border) bg-(--surface) p-5 shadow-(--shadow) sm:p-5.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-(--text)">
            Daily Spending Allowance
          </h2>
          <p className="mt-1.5 text-[11px] text-(--muted)">
            Based on your current month's income and expenses
          </p>
        </div>

        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#def8eb] text-[#0d9b70]">
          <Wallet size={19} />
        </span>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3">
          <div className="h-8 w-36 animate-pulse rounded bg-(--surface-2)" />
          <div className="h-3 w-full animate-pulse rounded bg-(--surface-2)" />
          <div className="h-12 w-full animate-pulse rounded bg-(--surface-2)" />
        </div>
      ) : error ? (
        <div className="mt-5 flex items-center gap-2 text-xs text-[#e35b5b]">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[11px] text-(--muted)">
                Recommended spending today
              </p>

              <strong className="mt-1 block text-[27px] font-bold tracking-[-0.8px] text-(--text)">
                {money(dailyAllowance)}
              </strong>

              <p className="mt-1 text-[10px] text-(--muted)">
                {remainingDays} {remainingDays === 1 ? "day" : "days"} remaining
                in this month, including today
              </p>
            </div>

            <div className="rounded-[10px] bg-(--surface-2) px-3.5 py-3">
              <p className="text-[10px] text-(--muted)">
                Monthly balance
              </p>
              <strong
                className={`mt-1 block text-sm font-bold ${
                  monthlyBalance >= 0
                    ? "text-[#0d9b70]"
                    : "text-[#e35b5b]"
                }`}
              >
                {money(monthlyBalance)}
              </strong>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-(--muted)">Today's spending</span>
              <strong className="text-(--text)">
                {money(todayExpenses)} / {money(dailyAllowance)}
              </strong>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-(--surface-2)">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit ? "bg-[#e35b5b]" : "bg-[#0c9b74]"
                }`}
                style={{ width: `${spendingPercentage}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
              {isOverLimit ? (
                <>
                  <AlertCircle size={14} className="text-[#e35b5b]" />
                  <span className="font-semibold text-[#e35b5b]">
                    Over today's allowance by {money(Math.abs(difference))}
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={14} className="text-[#0d9b70]" />
                  <span className="font-semibold text-[#0d9b70]">
                    {money(difference)} remaining in today's allowance
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-(--border) pt-4">
            <div>
              <p className="text-[10px] text-(--muted)">
                Monthly income
              </p>
              <strong className="mt-1 block text-xs font-bold text-[#0d9b70]">
                {money(income)}
              </strong>
            </div>

            <div>
              <p className="text-[10px] text-(--muted)">
                Monthly expenses
              </p>
              <strong className="mt-1 block text-xs font-bold text-(--text)">
                {money(expenses)}
              </strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
