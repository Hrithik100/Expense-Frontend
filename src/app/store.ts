import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import theme from "../features/theme/themeSlice";
import data from "../features/transactions/transactionSlice";
import categories from "../features/categories/categorySlice";
export const store = configureStore({
  reducer: { auth, theme, data, categories },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
