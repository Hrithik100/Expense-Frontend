
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types";
import { api, setAccessToken } from "../../services/api";

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    data: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const r = await api.post("/auth/login", data);
      setAccessToken(r.data.accessToken);
      return r.data.user as User;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Unable to sign in"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const r = await api.post("/auth/register", data);
      setAccessToken(r.data.accessToken);
      return r.data.user as User;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Unable to create account"
      );
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      let token: string;

      try {
        const r = await api.post("/auth/refresh");
        token = r.data.accessToken;
        setAccessToken(token);
      } catch {
        setAccessToken(null);
        throw new Error("No session");
      }

      const me = await api.get("/auth/me");

      return me.data.user as User;
    } catch {
      return rejectWithValue("No active session");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
    }
  }
);

const slice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = String(action.payload || "Login failed");
      });

    // REGISTER
    builder
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = String(
          action.payload || "Registration failed"
        );
      });

    // RESTORE SESSION
    builder
      .addCase(restoreSession.pending, (state) => {
        state.initialized = false;
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initialized = true;
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
        state.status = "unauthenticated";
        state.user = null;
      });

    // LOGOUT
    builder.addCase(logout.fulfilled, (state) => {
      state.status = "unauthenticated";
      state.user = null;
      state.error = null;
    });
  },
});

export const { clearAuthError } = slice.actions;

export default slice.reducer;
