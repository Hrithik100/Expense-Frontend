
export type CategoryType = "income" | "expense" | "both";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
  userId?: number | null;
  isDefault: boolean;
}

export interface CategoryPayload {
  name: string;
  type: CategoryType;
  color: string;
}

export interface CategoryState {
  items: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  saving: boolean;
}
