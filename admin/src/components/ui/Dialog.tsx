"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
  /** Кнопки внизу окна. */
  footer?: ReactNode;
}

/** Модальное окно на нативном <dialog>: закрывается клавишей Esc, держит фокус внутри. */
export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className="m-auto max-h-[92dvh] w-[min(46rem,calc(100vw-1.5rem))] overflow-hidden rounded-card bg-white p-0 text-ink shadow-2xl backdrop:bg-graphite-950/60"
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <h2 id="dialog-title" className="text-lg font-bold">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="-mr-2 flex size-10 items-center justify-center rounded-control text-graphite-700 hover:bg-surface" aria-label="Закрыть">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-border bg-surface px-5 py-4 sm:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
