"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/Button";
import { TextField } from "./ui/Field";
import { ErrorNote } from "./ui/Page";

/** Экран входа по почте и паролю. Пользователей создаёт владелец в Supabase. */
export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold">Вход в админ-панель</h1>
      <p className="mt-2 text-sm text-muted">Используйте почту и пароль, которые выдал владелец.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        <TextField label="Электронная почта" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Пароль" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} className="mt-2">
          Войти
        </Button>
      </form>
    </AuthLayout>
  );
}

/** Пользователь вошёл, но владелец ещё не включил ему доступ. */
export function InactiveScreen() {
  const { profile, signOut } = useAuth();
  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold">Доступ ещё не выдан</h1>
      <p className="mt-3 text-muted">
        Вы вошли как <strong className="text-ink">{profile?.email ?? "новый пользователь"}</strong>, но владелец ещё не включил ваш доступ.
        Попросите его открыть раздел «Сотрудники» и включить вашу учётную запись.
      </p>
      <Button variant="ghost" className="mt-6" onClick={() => void signOut()}>
        Выйти
      </Button>
    </AuthLayout>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-graphite-900 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-2xl sm:p-8">
        <p className="mb-6 flex items-center gap-2 text-sm font-bold text-muted">
          <span aria-hidden="true" className="size-3 rounded-sm bg-signal" />
          Админ-панель
        </p>
        {children}
      </div>
    </main>
  );
}
