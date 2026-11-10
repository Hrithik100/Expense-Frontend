
import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { restoreSession } from "./features/auth/authSlice";
import { Shell } from "./components/index";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Categories = lazy(() => import("./pages/Categories"));
const DailyExpenses = lazy(() => import("./pages/DailyExpenses"));

function PageLoader() {
  return (
    <div className="app-loading">
      <div className="loading-mark" />
      Loading your workspace…
    </div>
  );
}

function AppRoutes() {
  const dispatch = useAppDispatch();

  const { status, initialized } = useAppSelector(
    (state) => state.auth
  );

  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Only wait for initial session restoration
  if (!initialized) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            status === "authenticated" ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage mode="login" />
            )
          }
        />

        <Route
          path="/register"
          element={
            status === "authenticated" ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage mode="register" />
            )
          }
        />

        <Route
          element={
            status === "authenticated" ? (
              <Shell />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="categories" element={<Categories />} />
          <Route path="daily-expenses" element={<DailyExpenses />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
