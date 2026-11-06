
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";

import type {
  Category,
  CategoryPayload,
  CategoryState,
} from "./categoryTypes";

const initialState: CategoryState = {
  items: [],
  status: "idle",
  error: null,
  saving: false,
};

// GET categories
export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch categories"
      );
    }
  }
);

// ADD category
export const addCategory = createAsyncThunk(
  "categories/add",
  async (data: CategoryPayload, { rejectWithValue }) => {
    try {
      const response = await api.post<Category>("/categories", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add category"
      );
    }
  }
);

// UPDATE category
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: number; data: CategoryPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put<Category>(
        `/categories/${id}`,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update category"
      );
    }
  }
);

// DELETE category
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to delete category"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,

  reducers: {
    clearCategoryError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = String(
          action.payload || "Unable to fetch categories"
        );
      })

      // ADD
      .addCase(addCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.saving = false;
        state.error = String(
          action.payload || "Unable to add category"
        );
      })

      // UPDATE
      .addCase(updateCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.saving = false;
        state.error = String(
          action.payload || "Unable to update category"
        );
      })

      // DELETE
      .addCase(deleteCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.saving = false;
        state.error = String(
          action.payload || "Unable to delete category"
        );
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;
