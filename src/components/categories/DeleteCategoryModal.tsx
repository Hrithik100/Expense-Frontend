
import { AlertTriangle, X, Loader2 } from "lucide-react";

import type { Category } from "../../features/categories/categoryTypes";

type Props = {
  category: Category | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteCategoryModal({
  category,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        className="relative my-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-7"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={19} />
        </button>

        {/* Warning icon */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
          <AlertTriangle size={26} />
        </div>

        {/* Content */}
        <h2
          id="delete-category-title"
          className="text-xl font-bold text-[var(--text)]"
        >
          Delete category?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Are you sure you want to delete{" "}
          <strong className="font-semibold text-[var(--text)]">
            {category.name}
          </strong>
          ?
        </p>

        {/* Warning information */}
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm leading-6 text-red-600">
            Existing transactions will be kept, but their category
            association will be removed. Its budget will also be deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
