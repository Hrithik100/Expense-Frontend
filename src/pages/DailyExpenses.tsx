
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingDown,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { api } from "../services/api";

interface DailyTransaction {
  id: number;
  type: "expense";
  amount: number;
  categoryId: number | null;
  description: string;
  date: string;
  category: string | null;
  color: string | null;
}

interface DailyExpensesResponse {
  date: string;
  total: number;
  transactionCount: number;
  transactions: DailyTransaction[];
}

interface CategoryGroup {
  category: string;
  color: string;
  total: number;
  transactions: DailyTransaction[];
}

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const DailyExpenses = () => {
  const [selectedDate, setSelectedDate] = useState(() =>
    getLocalDate(new Date())
  );

  const [data, setData] = useState<DailyExpensesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = getLocalDate(new Date());
  const isToday = selectedDate === today;

  const fetchDailyExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<DailyExpensesResponse>(
        "/transactions/daily-expenses",
        {
          params: { date: selectedDate },
        }
      );

      setData(response.data);
    } catch (err: unknown) {
      setData(null);

      const errorMessage = (
        err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      setError(
        errorMessage ||
          "Unable to load daily expenses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyExpenses();
  }, [fetchDailyExpenses]);


  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const groups = new Map<string, CategoryGroup>();

    (data?.transactions ?? []).forEach((transaction) => {
      const category = transaction.category || "Uncategorized";

      if (!groups.has(category)) {
        groups.set(category, {
          category,
          color: transaction.color || "#94a3b8",
          total: 0,
          transactions: [],
        });
      }

      const group = groups.get(category)!;

      group.total += transaction.amount;
      group.transactions.push(transaction);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        total: Number(group.total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);


  const changeDate = (days: number) => {
    const [year, month, day] = selectedDate.split("-").map(Number);

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const nextDate = getLocalDate(date);

    if (nextDate <= today) {
      setSelectedDate(nextDate);
    }
  };

  const selectedDateLabel = formatDate(selectedDate);

  return (
    <div className="grid gap-5.75">
      
      <section className="flex items-center justify-between gap-4.5 max-sm:flex-wrap">
        <div>
          <h1 className="mb-1.75 text-[25px] font-bold tracking-[-0.8px] text-(--text)">
            Daily Expenses
          </h1>

          <p className="text-xs text-(--muted)">
            View and manage your expenses day by day.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDailyExpenses}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-(--border) bg-(--surface) px-3.75 py-2.75 text-xs font-bold text-(--text) transition hover:border-[#0c9b74] hover:text-[#0c9b74] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

  
      <section className="flex items-center justify-between gap-4 rounded-[14px] border border-(--border) bg-(--surface) p-4.5 shadow-(--shadow) max-sm:flex-wrap">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#def8eb] text-[#0d9b70]">
            <CalendarDays size={18} />
          </span>

          <div>
            <p className="text-[10px] text-(--muted)">
              Selected date
            </p>

            <p className="mt-0.5 text-xs font-semibold text-(--text)">
              {selectedDateLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            aria-label="Previous day"
            className="grid h-9 w-9 place-items-center rounded-lg border border-(--border) bg-(--surface) text-(--muted) transition hover:border-[#0c9b74] hover:text-[#0c9b74]"
          >
            <ChevronLeft size={17} />
          </button>

          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
              }
            }}
            className="h-9 min-w-0 rounded-lg border border-(--border) bg-(--surface) px-2.5 text-xs text-(--text) outline-none focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10"
          />

          <button
            type="button"
            onClick={() => changeDate(1)}
            disabled={isToday}
            aria-label="Next day"
            className="grid h-9 w-9 place-items-center rounded-lg border border-(--border) bg-(--surface) text-(--muted) transition hover:border-[#0c9b74] hover:text-[#0c9b74] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="rounded-lg border border-[#0c9b74]/30 bg-[#0c9b74]/10 px-3 py-2 text-[11px] font-bold text-[#0c9b74] transition hover:bg-[#0c9b74]/15"
            >
              Today
            </button>
          )}
        </div>
      </section>

 
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e35b5b]/30 bg-[#e35b5b]/5 p-3.5">
          <p className="text-xs text-[#e35b5b]">{error}</p>

          <button
            type="button"
            onClick={fetchDailyExpenses}
            className="shrink-0 text-xs font-bold text-[#e35b5b] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

   
      <section className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {/* Total Expenses */}
        <div className="rounded-[14px] border border-(--border) bg-(--surface) p-4.5 shadow-(--shadow)">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-(--muted)">
                Total expenses
              </p>

              {loading ? (
                <div className="mt-2 h-6 w-28 animate-pulse rounded bg-(--surface-2)" />
              ) : (
                <h2 className="mt-1.5 text-base font-bold text-(--text)">
                  {money(data?.total ?? 0)}
                </h2>
              )}
            </div>

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#def8eb] text-[#0d9b70]">
              <Wallet size={18} />
            </span>
          </div>
        </div>

   
        <div className="rounded-[14px] border border-(--border) bg-(--surface) p-4.5 shadow-(--shadow)">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-(--muted)">
                Transactions
              </p>

              {loading ? (
                <div className="mt-2 h-6 w-10 animate-pulse rounded bg-(--surface-2)" />
              ) : (
                <h2 className="mt-1.5 text-base font-bold text-(--text)">
                  {data?.transactionCount ?? 0}
                </h2>
              )}
            </div>

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#def8eb] text-[#0d9b70]">
              <Receipt size={18} />
            </span>
          </div>
        </div>
      </section>

     
      <section className="min-w-0 overflow-hidden rounded-[14px] border border-(--border) bg-(--surface) shadow-(--shadow)">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3.5">
          <div>
            <h2 className="text-xs font-bold text-(--text)">
              Expenses by Category
            </h2>

            <p className="mt-1 text-[10px] text-(--muted)">
              {selectedDateLabel}
            </p>
          </div>

          <TrendingDown size={17} className="text-[#0c9b74]" />
        </div>

  
        {loading ? (
          <div className="grid gap-5 p-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="grid gap-3">
                <div className="flex animate-pulse items-center justify-between">
                  <div className="h-3 w-28 rounded bg-(--surface-2)" />
                  <div className="h-3 w-16 rounded bg-(--surface-2)" />
                </div>

                <div className="ml-1 grid gap-3 border-l border-(--border) pl-4">
                  <div className="h-3 w-36 animate-pulse rounded bg-(--surface-2)" />
                  <div className="h-3 w-28 animate-pulse rounded bg-(--surface-2)" />
                </div>
              </div>
            ))}
          </div>
        ) : categoryGroups.length === 0 ? (
      
          <div className="grid justify-items-center px-5 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#def8eb] text-[#0d9b70]">
              <Receipt size={22} />
            </span>

            <h3 className="mt-3 text-sm font-bold text-(--text)">
              No expenses recorded
            </h3>

            <p className="mt-1 text-[11px] text-(--muted)">
              No expenses found for{" "}
              {isToday ? "today" : selectedDateLabel}.
            </p>
          </div>
        ) : (
          <>
      
            <div className="divide-y divide-(--border)">
              {categoryGroups.map((group) => (
                <div
                  key={group.category}
                  className="px-4 py-4"
                >
               
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: group.color }}
                      />

                      <div className="min-w-0">
                        <h3 className="truncate text-[11px] font-bold text-(--text)">
                          {group.category}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-(--muted)">
                          {group.transactions.length}{" "}
                          {group.transactions.length === 1
                            ? "transaction"
                            : "transactions"}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-[11px] font-bold text-(--text)">
                      {money(group.total)}
                    </p>
                  </div>

                
                  <div className="ml-1 mt-2.5 grid gap-3 border-l border-(--border) pl-3.5">
                    {group.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-(--text)">
                            {transaction.description || "Expense"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-(--muted)">
                            {formatShortDate(transaction.date)}
                          </p>
                        </div>

                        <p className="shrink-0 text-[11px] font-semibold text-[#0c9b74]">
                          −{money(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          
            <div className="flex items-center justify-between border-t border-(--border) bg-(--surface-2) px-4 py-3.5">
              <span className="text-[11px] font-bold text-(--text)">
                Daily total
              </span>

              <span className="text-xs font-bold text-[#0c9b74]">
                {money(data?.total ?? 0)}
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default DailyExpenses;
