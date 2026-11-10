import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
  Layers3,
  Wallet,
  TrendingUp,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} from "../features/categories/categorySlice";

import type {
  Category,
  CategoryPayload,
  CategoryType,
} from "../features/categories/categoryTypes";

import CategoryModal from "../components/categories/CategoryModal";
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal";

type FilterType = "all" | CategoryType;

export default function Categories() {
  const dispatch = useAppDispatch();

  const { items, status, error, saving } = useAppSelector(
    (state) => state.categories,
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    return items.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesFilter = filter === "all" || category.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const defaultCategories = filteredCategories.filter(
    (category) => category.isDefault,
  );

  const customCategories = filteredCategories.filter(
    (category) => !category.isDefault,
  );

  const expenseCount = items.filter(
    (item) => item.type === "expense" || item.type === "both",
  ).length;

  const incomeCount = items.filter(
    (item) => item.type === "income" || item.type === "both",
  ).length;

  const openAddModal = () => {
    dispatch(clearCategoryError());
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (category.isDefault) return;

    dispatch(clearCategoryError());
    setEditingCategory(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
    dispatch(clearCategoryError());
  };

  const handleSubmit = async (data: CategoryPayload) => {
    const result = editingCategory
      ? await dispatch(
          updateCategory({
            id: editingCategory.id,
            data,
          }),
        )
      : await dispatch(addCategory(data));

    if (
      updateCategory.fulfilled.match(result) ||
      addCategory.fulfilled.match(result)
    ) {
      setModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    const result = await dispatch(deleteCategory(deletingCategory.id));

    if (deleteCategory.fulfilled.match(result)) {
      setDeletingCategory(null);
    }
  };

  const getTypeLabel = (type: CategoryType) => {
    if (type === "income") return "Income";
    if (type === "expense") return "Expense";
    return "Both";
  };

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--text) sm:text-3xl">
            Categories
          </h1>

          <p className="mt-2 text-sm text-(--muted)">
            Organize your income and expenses with custom categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--green) px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-(--green-dark) focus:outline-none focus:ring-2 focus:ring-(--green) focus:ring-offset-2"
        >
          <Plus size={18} />
          Add category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total categories"
          value={items.length}
          icon={<Layers3 size={21} />}
          iconClass="bg-[#eef0ff] text-[#6366f1] dark:bg-[#6366f1]/15 dark:text-[#818cf8]"
        />

        <StatCard
          title="Income categories"
          value={incomeCount}
          icon={<TrendingUp size={21} />}
          iconClass="bg-[#d9f7eb] text-[#059669] dark:bg-[#059669]/15 dark:text-[#34d399]"
        />

        <StatCard
          title="Expense categories"
          value={expenseCount}
          icon={<Wallet size={21} />}
          iconClass="bg-[#fff0df] text-[#ea580c] dark:bg-[#ea580c]/15 dark:text-[#fb923c]"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--surface) p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-(--border) bg-(--surface-2) py-2.5 pl-10 pr-4 text-sm text-(--text) outline-none transition placeholder:text-(--muted) focus:border-(--green) focus:ring-2 focus:ring-(--green)/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "income", "expense", "both"] as FilterType[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition ${
                  filter === item
                    ? "bg-(--green) text-white"
                    : "bg-(--surface-2) text-(--muted) hover:opacity-80"
                }`}
              >
                {item === "all" ? "All" : item}
              </button>
            ),
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Loading and category content */}
      {status === "loading" ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-(--border) bg-(--surface)">
          <Loader2 className="animate-spin text-(--green)" size={30} />
          <p className="text-sm text-(--muted)">Loading categories...</p>
        </div>
      ) : status === "failed" ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-(--border) bg-(--surface) px-5 text-center">
          <Tag size={32} className="mb-3 text-(--muted)" />

          <h3 className="font-semibold text-(--text)">
            Unable to load categories
          </h3>

          <p className="mt-1 text-sm text-(--muted)">
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => dispatch(fetchCategories())}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--green) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--green-dark)"
          >
            <RotateCcw size={15} />
            Try again
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-(--border) bg-[var(--surface)] px-5 text-center">
          <div className="mb-4 rounded-2xl bg-(--surface-2) p-4 text-(--green)">
            <Tag size={28} />
          </div>

          <h3 className="font-semibold text-(--text)">No categories found</h3>

          <p className="mt-1 text-sm text-(--muted)">
            {search
              ? "Try a different search term."
              : "Create your first custom category to get started."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--green) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--green-dark)"
            >
              <Plus size={16} />
              Add category
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {defaultCategories.length > 0 && (
            <CategorySection
              title="Default categories"
              description="Predefined categories available to everyone."
              categories={defaultCategories}
              getTypeLabel={getTypeLabel}
            />
          )}

          {customCategories.length > 0 && (
            <CategorySection
              title="My categories"
              description="Categories created and managed by you."
              categories={customCategories}
              getTypeLabel={getTypeLabel}
              onEdit={openEditModal}
              onDelete={setDeletingCategory}
            />
          )}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <DeleteCategoryModal
        category={deletingCategory}
        deleting={saving}
        onClose={() => {
          if (!saving) setDeletingCategory(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm text-(--muted)">{title}</p>
        <p className="mt-1 text-2xl font-bold text-(--text)">{value}</p>
      </div>
    </div>
  );
}

function CategorySection({
  title,
  description,
  categories,
  getTypeLabel,
  onEdit,
  onDelete,
}: {
  title: string;
  description: string;
  categories: Category[];
  getTypeLabel: (type: CategoryType) => string;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-(--text)">{title}</h2>

          <p className="mt-1 text-sm text-(--muted)">{description}</p>
        </div>

        <span className="rounded-lg bg-(--surface-2) px-3 py-1.5 text-sm font-semibold text-(--text)">
          {categories.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.id}
            className="group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${category.color}18`,
                  color: category.color,
                }}
              >
                <Tag size={21} />
              </div>

              {!category.isDefault && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit?.(category)}
                    aria-label={`Edit ${category.name}`}
                    title="Edit category"
                    className="rounded-lg p-2 text-(--muted) transition hover:bg-(--surface-2) hover:text-(--green)"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete?.(category)}
                    aria-label={`Delete ${category.name}`}
                    title="Delete category"
                    className="rounded-lg p-2 text-(--muted) transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-semibold text-(--text)">{category.name}</h3>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-(--surface-2) px-2.5 py-1 text-xs font-medium text-(--muted)">
                  {getTypeLabel(category.type)}
                </span>

                {category.isDefault && (
                  <span className="rounded-md bg-(--green)/10 px-2.5 py-1 text-xs font-medium text-(--green)">
                    Default
                  </span>
                )}
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 h-1 w-full"
              style={{ backgroundColor: category.color }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
