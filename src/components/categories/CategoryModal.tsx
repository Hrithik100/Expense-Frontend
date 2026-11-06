
import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

import type {
  Category,
  CategoryPayload,
  CategoryType,
} from "../../features/categories/categoryTypes";

type Props = {
  open: boolean;
  category: Category | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryPayload) => void;
};

const colors = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#0EA5E9",
  "#64748B",
];

export default function CategoryModal({
  open,
  category,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setType(category?.type ?? "expense");
      setColor(category?.color ?? colors[0]);
    }
  }, [open, category]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      name: name.trim(),
      type,
      color,
    });
  };

  const inputClasses =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2
              id="category-modal-title"
              className="text-lg font-bold text-[var(--text)]"
            >
              {category ? "Edit category" : "Add category"}
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {category
                ? "Update your category details."
                : "Create a category to organize your finances."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Category name */}
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="block text-sm font-semibold text-[var(--text)]"
            >
              Category name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shopping"
              minLength={2}
              maxLength={50}
              required
              autoFocus
              className={inputClasses}
            />

            <p className="text-right text-xs text-[var(--muted)]">
              {name.length}/50 characters
            </p>
          </div>

          {/* Category type */}
          <div className="space-y-2">
            <label
              htmlFor="category-type"
              className="block text-sm font-semibold text-[var(--text)]"
            >
              Category type
            </label>

            <select
              id="category-type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as CategoryType)
              }
              className={inputClasses}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Color picker */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--text)]">
              Choose a color
            </label>

            <div className="flex flex-wrap gap-3">
              {colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  aria-label={`Select ${item}`}
                  aria-pressed={color === item}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-110 ${
                    color === item
                      ? "ring-2 ring-offset-2 ring-[var(--green)]"
                      : "ring-1 ring-black/10"
                  }`}
                  style={{
                    backgroundColor: item,
                    outlineColor: color === item ? "var(--green)" : undefined,
                  }}
                >
                  {color === item && (
                    <Check size={17} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Category preview
            </p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                  }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>

                <span className="truncate text-sm font-semibold text-[var(--text)]">
                  {name.trim() || "Category preview"}
                </span>
              </div>

              <span className="shrink-0 rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--muted)]">
                {type}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim() || name.trim().length < 2 || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--green-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Please wait...
                </>
              ) : category ? (
                "Save changes"
              ) : (
                "Create category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
