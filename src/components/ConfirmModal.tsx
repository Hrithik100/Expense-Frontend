
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

type ConfirmModalProps = {
  title: string;
  message: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  title,
  message,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-90 flex items-center justify-center bg-[#0c1712a6] p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className={`relative w-full max-w-90 rounded-2xl border border-(--border) bg-(--surface) p-6 text-(--text) shadow-[0_25px_80px_#0003] transition-all duration-200 ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-(--muted) transition hover:bg-(--surface-2) disabled:opacity-50"
        >
          <X size={17} />
        </button>

        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#fff0e5] text-[#e38b3e]">
          <AlertTriangle size={28} />
        </div>

        <h3
          id="confirm-title"
          className="text-center text-base font-bold"
        >
          {title}
        </h3>

        <p
          id="confirm-message"
          className="mt-2 text-center text-xs leading-5 text-(--muted)"
        >
          {message}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 items-center justify-center rounded-[9px] border border-(--border) bg-(--surface) text-xs font-bold text-(--text) transition hover:bg-(--surface-2) disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-[9px] bg-[#e35b5b] text-xs font-bold text-white transition hover:bg-[#cf4545] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
