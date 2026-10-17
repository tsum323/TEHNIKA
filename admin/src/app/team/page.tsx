"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, ErrorNote, PageHeader } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/lib/labels";
import type { Profile, StaffRole } from "@/types/db";

/** Сотрудники: владелец включает доступ, назначает роли и имена. */
export default function TeamPage() {
  const { isOwner, profile: me } = useAuth();
  const { data, refresh } = useData();
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) {
    return <PageHeader title="Сотрудники" description="Раздел доступен только владельцу." />;
  }

  async function change(profile: Profile, patch: Partial<Profile>) {
    setError(null);
    try {
      await db.update("profiles", { id: profile.id }, patch);
      await refresh(["profiles"]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить.");
    }
  }

  const list = [...data.profiles].sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.email.localeCompare(b.email));

  return (
    <>
      <PageHeader title="Сотрудники" description="Кто имеет доступ к админ-панели и что видит." />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <EmployeeCard key={p.id} profile={p} isMe={p.id === me?.id} onChange={(patch) => void change(p, patch)} />
        ))}
      </div>

      <Card title="Как добавить сотрудника" className="mt-6">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Откройте Supabase → ваш проект → Authentication → Users → Add user → Create new user.</li>
          <li>Введите почту и пароль сотрудника, включите «Auto Confirm User», нажмите Create user.</li>
          <li>Сотрудник появится здесь неактивным. Нажмите «Включить доступ» и при необходимости смените роль.</li>
          <li>Передайте сотруднику адрес админ-панели, почту и пароль.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          <strong>Менеджер</strong> работает с заявками, клиентами, техникой и поставщиками, но не видит закупочные цены, расходы и прибыль.{" "}
          <strong>Владелец</strong> видит всё и управляет сотрудниками.
        </p>
      </Card>
    </>
  );
}

function EmployeeCard({ profile, isMe, onChange }: { profile: Profile; isMe: boolean; onChange(patch: Partial<Profile>): void }) {
  const [name, setName] = useState(profile.full_name);
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate font-bold">{profile.email}</p>
        {isMe && <Badge tone="dark">Это вы</Badge>}
        <Badge tone={profile.is_active ? "success" : "neutral"}>{profile.is_active ? "Доступ есть" : "Нет доступа"}</Badge>
      </div>
      <p className="mt-1 text-xs text-muted">Добавлен {formatDate(profile.created_at)}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Имя
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== profile.full_name && onChange({ full_name: name.trim() })}
            className="h-10 rounded-control border border-border-strong px-3 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Роль
          <select
            value={profile.role}
            disabled={isMe}
            onChange={(e) => onChange({ role: e.target.value as StaffRole })}
            className="h-10 rounded-control border border-border-strong bg-white px-2 font-normal disabled:bg-surface"
          >
            {(Object.keys(roleLabels) as StaffRole[]).map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!isMe && (
        <Button variant={profile.is_active ? "danger" : "secondary"} size="sm" className="mt-4" onClick={() => onChange({ is_active: !profile.is_active })}>
          {profile.is_active ? "Отключить доступ" : "Включить доступ"}
        </Button>
      )}
      {isMe && <p className="mt-4 text-xs text-muted">Свою роль и доступ изменить нельзя — чтобы случайно не потерять доступ к панели.</p>}
    </Card>
  );
}
