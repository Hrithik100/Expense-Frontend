import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChartNoAxesCombined, Eye, EyeOff } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login, register } from "../features/auth/authSlice";

type Props = {
  mode: "login" | "register";
};

export default function AuthPage({ mode }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { status, error } = useAppSelector((s) => s.auth);

  const isLogin = mode === "login";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = isLogin
      ? await dispatch(login({ email, password }))
      : await dispatch(register({ name, email, password }));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-7"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #d9f7eb80, transparent 55%), var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="mb-7 flex items-center gap-2.5 text-[23px] font-extrabold tracking-[-1px]">
        <span className="grid h-8.75 w-8.75 place-items-center rounded-[11px] bg-[#d9f7eb] text-[#087f60]">
          <ChartNoAxesCombined size={21} />
        </span>
        <span>ledgerly</span>
      </div>

      <div
        className="w-full max-w-107.5 rounded-[17px] border p-8.5 shadow-[0_15px_60px_#173f2c0c] max-[760px]:px-5.5 max-[760px]:py-6.75 max-[380px]:px-4.25 max-[380px]:py-5.75"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-6.5 text-center">
          <div className="text-[10px] font-extrabold tracking-[1.35px] text-[#0c9b74]">
            YOUR MONEY, MORE MINDFUL
          </div>

          <h1 className="mt-3 mb-2.25 text-[25px] font-bold tracking-[-0.8px] max-[760px]:text-[23px]">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>

          <p
            className="m-0 text-xs leading-[1.6]"
            style={{ color: "var(--muted)" }}
          >
            {isLogin
              ? "Sign in to see where your money goes."
              : "A clearer picture of your finances starts here."}
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4.25">
          {mode === "register" && (
            <label className="grid gap-1.75 text-[11px] font-bold">
              Full name
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="h-10.75 w-full rounded-lg border px-3 text-xs outline-none transition focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
            </label>
          )}

          <label className="grid gap-1.75 text-[11px] font-bold">
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10.75 w-full rounded-lg border px-3 text-xs outline-none transition focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </label>

          <label className="grid gap-1.75 text-[11px] font-bold">
            Password
            <div className="relative">
              <input
                required
                minLength={isLogin ? 1 : 8}
                maxLength={72}
                type={show ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isLogin ? "Enter your password" : "At least 8 characters"
                }
                className="h-10.75 w-full rounded-lg border py-0 pr-10.5 pl-3 text-xs outline-none transition focus:border-[#0c9b74] focus:ring-[3px] focus:ring-[#0c9b74]/10"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute top-1.25 right-1.75 grid h-8.25 w-8.25 place-items-center border-0 bg-transparent transition hover:opacity-70"
                style={{ color: "var(--muted)" }}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-[#fff0f0] p-2.5 text-[11px] text-[#bd3030] dark:bg-red-950/30 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              !email.trim() ||
              !password.trim() ||
              (!isLogin && !name.trim()) ||
              status === "loading"
            }
            className="mt-0.75 inline-flex h-10.75 w-full items-center justify-center gap-2 rounded-[9px] border-0 bg-[#0c9b74] px-[15px] text-xs font-bold text-white shadow-[0_3px_7px_#0c9b7418] transition-colors hover:bg-[#087f60] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait…"
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p
          className="mt-5.5 mb-0 text-center text-[11px]"
          style={{ color: "var(--muted)" }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}

          <Link
            to={isLogin ? "/register" : "/login"}
            className="font-extrabold text-[#087f60] hover:underline"
          >
            {isLogin ? "Create one" : "Sign in"}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-[10px]" style={{ color: "var(--muted)" }}>
        Your financial data is private and protected.
      </p>
    </div>
  );
}
