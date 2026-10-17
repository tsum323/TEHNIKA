"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/Button";
import { Dialog } from "./ui/Dialog";
import { ErrorNote } from "./ui/Page";

interface SimpleDialogProps {
  title: string;
  isNew: boolean;
  onClose(): void;
  onSave(): Promise<void>;
  onDelete?: () => Promise<void>;
  deleteQuestion?: string;
  children: ReactNode;
}

/** Окно редактирования с кнопками «Сохранить», «Отмена» и «Удалить» (удаляет только владелец). */
export function SimpleDialog({ title, isNew, onClose, onSave, onDelete, deleteQuestion, children }: SimpleDialogProps) {
  const { isOwner } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setSaving(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить.");
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          {!isNew && isOwner && onDelete && (
            <Button
              variant="danger"
              className="mr-auto"
              disabled={saving}
              onClick={() => {
                if (window.confirm(deleteQuestion ?? "Удалить запись?")) void run(onDelete);
              }}
            >
              Удалить
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button loading={saving} onClick={() => void run(onSave)}>
            Сохранить
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {error && <ErrorNote>{error}</ErrorNote>}
        {children}
      </div>
    </Dialog>
  );
}
