import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
const initialState = {
  mode: (localStorage.getItem("theme") as "light" | "dark" | null) || "light",
};
const slice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMode(s, a: PayloadAction<"light" | "dark">) {
      s.mode = a.payload;
      localStorage.setItem("theme", a.payload);
    },
    toggle(s) {
      s.mode = s.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", s.mode);
    },
  },
});
export const { setMode, toggle } = slice.actions;
export default slice.reducer;
