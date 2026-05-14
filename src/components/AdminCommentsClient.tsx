"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "./AdminContext";

interface AdminFeedbackRow {
  id: string;
  text: string;
  status: "pending" | "approved";
  created_at: string;
}

const ADMIN_TOKEN_KEY = "vlachika-admin-token";

function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("el-GR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function AdminCommentsClient() {
  const { isAdmin } = useAdmin();
  const [items, setItems] = useState<AdminFeedbackRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [token, setToken] = useState("");

  // Hydrate the session token client-side.
  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  const authHeaders = useCallback(
    (current: string) => ({
      Authorization: `Bearer ${current}`,
      "Content-Type": "application/json",
    }),
    []
  );

  const load = useCallback(
    async (currentToken: string) => {
      if (!currentToken) return;
      setError(null);
      const res = await fetch("/api/admin/feedback", {
        headers: authHeaders(currentToken),
        cache: "no-store",
      });
      if (res.status === 401) {
        setStoredToken("");
        setToken("");
        setError("Άκυρος κωδικός. Δοκίμασε ξανά.");
        return;
      }
      if (!res.ok) {
        setError("Σφάλμα φόρτωσης.");
        return;
      }
      const body = (await res.json()) as { items: AdminFeedbackRow[] };
      setItems(body.items);
    },
    [authHeaders]
  );

  useEffect(() => {
    if (isAdmin && token) {
      load(token);
    }
  }, [isAdmin, token, load]);

  const handleSignIn = useCallback(() => {
    const input = prompt("Κωδικός για διαχείριση σχολίων:");
    if (!input) return;
    setStoredToken(input);
    setToken(input);
  }, []);

  const handleSignOut = useCallback(() => {
    setStoredToken("");
    setToken("");
    setItems(null);
  }, []);

  const handleApprove = useCallback(
    async (id: string) => {
      if (!token) return;
      setBusyId(id);
      try {
        const res = await fetch("/api/admin/feedback", {
          method: "PATCH",
          headers: authHeaders(token),
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          setError("Αποτυχία έγκρισης.");
          return;
        }
        await load(token);
      } finally {
        setBusyId(null);
      }
    },
    [token, authHeaders, load]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      if (!confirm("Διαγραφή σχολίου;")) return;
      setBusyId(id);
      try {
        const res = await fetch(
          `/api/admin/feedback?id=${encodeURIComponent(id)}`,
          { method: "DELETE", headers: authHeaders(token) }
        );
        if (!res.ok) {
          setError("Αποτυχία διαγραφής.");
          return;
        }
        await load(token);
      } finally {
        setBusyId(null);
      }
    },
    [token, authHeaders, load]
  );

  // ─── Gate: admin mode off ────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="surface-card rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-warm-800">
            Διαχείριση σχολίων
          </h1>
          <p className="mt-2 text-sm text-warm-500">
            Ενεργοποίησε admin mode από την επάνω μπάρα για να δεις αυτή τη
            σελίδα.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-sky-600 hover:text-sky-700"
          >
            ← Επιστροφή
          </Link>
        </div>
      </div>
    );
  }

  // ─── Gate: no server token yet ───────────────────────────
  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="surface-card rounded-2xl p-8 text-center">
          <h1 className="text-xl font-semibold text-warm-800">
            Διαχείριση σχολίων
          </h1>
          <p className="mt-2 text-sm text-warm-500">
            Δώσε τον κωδικό διαχειριστή για να φορτώσεις τα σχόλια.
          </p>
          {error && (
            <p className="mt-3 text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-5 inline-flex items-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 transition-colors"
          >
            Είσοδος
          </button>
        </div>
      </div>
    );
  }

  // ─── Loaded ──────────────────────────────────────────────
  const pending = (items ?? []).filter((r) => r.status === "pending");
  const approved = (items ?? []).filter((r) => r.status === "approved");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-warm-900">
            Διαχείριση σχολίων
          </h1>
          <p className="mt-1 text-sm text-warm-500">
            Έγκρινε ή διέγραψε σχόλια. Μόνο τα εγκεκριμένα εμφανίζονται
            δημόσια.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs text-warm-500 hover:text-warm-700 underline-offset-2 hover:underline"
        >
          Αποσύνδεση
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {items === null ? (
        <p className="text-sm text-warm-400 animate-pulse">Φόρτωση…</p>
      ) : (
        <>
          <FeedbackSection
            title="Εκκρεμή"
            empty="Δεν υπάρχουν εκκρεμή σχόλια."
            count={pending.length}
            tone="amber"
          >
            {pending.map((row) => (
              <FeedbackCard
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onApprove={() => handleApprove(row.id)}
                onDelete={() => handleDelete(row.id)}
                showApprove
              />
            ))}
          </FeedbackSection>

          <FeedbackSection
            title="Εγκεκριμένα"
            empty="Κανένα εγκεκριμένο σχόλιο ακόμη."
            count={approved.length}
            tone="olive"
          >
            {approved.map((row) => (
              <FeedbackCard
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onDelete={() => handleDelete(row.id)}
              />
            ))}
          </FeedbackSection>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────

const TONE: Record<"amber" | "olive", string> = {
  amber: "bg-terra-50 text-terra-700 border-terra-200",
  olive: "bg-olive-50 text-olive-700 border-olive-200",
};

function FeedbackSection({
  title,
  count,
  empty,
  tone,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  tone: "amber" | "olive";
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-warm-800">{title}</h2>
        <span
          className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full border text-[11px] font-semibold ${TONE[tone]}`}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-warm-400">{empty}</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

function FeedbackCard({
  row,
  busy,
  showApprove,
  onApprove,
  onDelete,
}: {
  row: AdminFeedbackRow;
  busy: boolean;
  showApprove?: boolean;
  onApprove?: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="surface-card rounded-2xl p-5 space-y-3">
      <p className="text-sm leading-7 text-warm-800 whitespace-pre-wrap">
        {row.text}
      </p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-warm-400">{formatDate(row.created_at)}</p>
        <div className="flex gap-2">
          {showApprove && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="rounded-lg border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-700 hover:bg-olive-50 disabled:opacity-50 transition-colors"
            >
              Έγκριση
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
          >
            Διαγραφή
          </button>
        </div>
      </div>
    </article>
  );
}
