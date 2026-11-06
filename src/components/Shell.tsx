import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Receipt,
  Wallet,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Plus,
  Tag,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggle } from "../features/theme/themeSlice";
import { logout } from "../features/auth/authSlice";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/categories", label: "Categories", icon: Tag },
];

export default function Shell() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const mode = useAppSelector((s) => s.theme.mode);

  const navigate = useNavigate();

  const signOut = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-[13px] rounded-[10px] border-0 px-3 py-3 text-left text-[13px] font-semibold transition-colors ${
      isActive
        ? "bg-[#e8f8f1] text-[#087f60] dark:bg-[#0c9b74]/15 dark:text-[#45c9a1]"
        : "bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
    }`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[30] flex w-[248px] flex-col border-r border-[var(--border)] bg-[var(--surface)] px-[17px] pt-[26px] pb-[18px] transition-transform duration-[220ms] ease-in-out max-[760px]:w-[min(290px,85vw)] max-[760px]:-translate-x-[102%] max-[760px]:shadow-none ${
          open
            ? "max-[760px]:translate-x-0 max-[760px]:shadow-[10px_0_50px_#0002]"
            : ""
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-[10px] px-[10px] pb-[42px] text-[22px] font-extrabold tracking-[-1px]">
          <span className="grid h-[35px] w-[35px] shrink-0 place-items-center rounded-[11px] bg-[#d9f7eb] text-[#087f60]">
            <ChartNoAxesCombined size={21} />
          </span>

          <span>ledgerly</span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="ml-auto hidden place-items-center border-0 bg-transparent text-[var(--muted)] hover:text-[var(--text)] max-[760px]:grid"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation heading */}
        <p className="mb-3 px-3 text-[10px] font-extrabold tracking-[1.35px] text-[var(--muted)]">
          WORKSPACE
        </p>

        {/* Navigation links */}
        <nav className="grid gap-[5px]">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              onClick={() => setOpen(false)}
              className={navLinkClass}
            >
              <n.icon size={19} className="shrink-0" />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div className="mt-auto grid gap-[5px]">
          {/* User profile */}
          <div className="mb-2 flex items-center gap-[10px] border-t border-[var(--border)] px-2 pt-[14px] pb-[14px]">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9f7eb] font-extrabold text-[#087f60]">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="grid min-w-0 flex-1 gap-1">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                {user?.name}
              </strong>

              <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--muted)]">
                {user?.email}
              </small>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggle())}
            className="flex w-full items-center gap-[13px] rounded-[10px] border-0 bg-transparent px-3 py-3 text-left text-[13px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            {mode === "light" ? <Moon size={19} /> : <Sun size={19} />}

            <span>Switch to {mode === "light" ? "dark" : "light"} mode</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-[13px] rounded-[10px] border-0 bg-transparent px-3 py-3 text-left text-[13px] font-semibold text-[#e05b5b] transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={19} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[25] hidden border-0 bg-[#10181570] min-[761px]:hidden max-[760px]:block"
        />
      )}

      {/* Main area */}
      <main className="ml-[248px] min-h-screen max-[760px]:ml-0">
        {/* Topbar */}
        <header className="flex h-[91px] items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-[38px] max-[1200px]:px-6 max-[760px]:h-[74px] max-[760px]:justify-start max-[760px]:gap-[9px] max-[760px]:px-[11px]">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] max-[760px]:grid"
          >
            <Menu size={20} />
          </button>

          {/* Greeting */}
          <div className="min-w-0 max-[760px]:flex-1">
            <div className="text-[10px] font-extrabold tracking-[1.35px] text-[var(--muted)] max-[760px]:text-[8px]">
              YOUR FINANCIAL SPACE
            </div>

            <div className="mt-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold tracking-[-0.25px] max-[760px]:text-sm">
              Good to see you, {user?.name?.split(" ")[0] || "there"} 👋
            </div>
          </div>

          {/* Topbar actions */}
          <div className="flex shrink-0 items-center gap-3 max-[760px]:gap-[7px]">
            {/* Mobile theme toggle */}
            <button
              type="button"
              onClick={() => dispatch(toggle())}
              aria-label="Toggle theme"
              className="hidden h-9 w-9 place-items-center rounded-[9px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] max-[760px]:grid"
            >
              {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Add transaction */}
            <button
              type="button"
              onClick={() => navigate("/transactions?new=1")}
              className="inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-[#0c9b74] px-[15px] py-[11px] text-xs font-bold text-white shadow-[0_3px_7px_#0c9b7418] transition-colors hover:bg-[#087f60] max-[760px]:p-[10px]"
            >
              <Plus size={18} />

              <span className="max-[760px]:hidden">Add transaction</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto w-full max-w-[1550px] px-[38px] pt-8 pb-12 max-[1500px]:px-6 max-[1200px]:pt-[26px] max-[1200px]:pb-[38px] max-[760px]:px-4 max-[760px]:pt-[23px] max-[760px]:pb-[35px] max-[380px]:px-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
