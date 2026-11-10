
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type FeedbackModalProps = {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
};

export default function FeedbackModal({
  type,
  title,
  message,
  onClose,
}: FeedbackModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1800);

    const closeTimer = window.setTimeout(() => {
      onClose();
    }, 2100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-[#0c1712a6] p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className={`w-full max-w-85 rounded-2xl border border-(--border) bg-(--surface) p-6 text-center shadow-[0_25px_80px_#0003] transition-all duration-200 ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="absolute"
        >
          <X size={16} />
        </button>

        <div
          className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full ${
            isSuccess
              ? "bg-[#def8eb] text-[#0d9b70]"
              : "bg-[#fff0e5] text-[#e35b5b]"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={34} strokeWidth={1.8} />
          ) : (
            <AlertCircle size={34} strokeWidth={1.8} />
          )}
        </div>

        <h3 className="text-base font-bold text-(--text)">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-(--muted)">
          {message}
        </p>
      </div>
    </div>
  );
}
