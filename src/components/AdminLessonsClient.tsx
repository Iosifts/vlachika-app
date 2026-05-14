"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Module } from "@/lib/types";
import type { CustomModuleData, CustomSectionData } from "@/lib/admin";
import { useAdmin } from "./AdminContext";
import AdminModuleCreator from "./AdminModuleCreator";
import {
  publishOverride,
  revertOverride,
} from "@/lib/services/lesson-overrides";

interface Props {
  modules: Module[];
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

// ─── Conversion helpers ────────────────────────────────────

function moduleToCustom(mod: Module): CustomModuleData {
  return {
    id: mod.id,
    type: mod.type,
    status: mod.status,
    title: mod.title,
    subtitle: mod.subtitle,
    description: mod.description,
    audience: mod.audience,
    tags: mod.tags ?? [],
    order: mod.order,
    accentColor: mod.accentColor,
    lastUpdated: mod.lastUpdated ?? new Date().toISOString().split("T")[0],
    sections: mod.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      description: s.description,
      order: s.order,
      data: (s.data ?? {}) as Record<string, unknown>,
    })),
  };
}

/**
 * Merge edits from AdminModuleCreator back into the original Module —
 * preserves `image`, `meta`, section `icon`, etc., that CustomModuleData
 * doesn't carry.
 */
function mergeBackIntoModule(
  original: Module,
  edited: CustomModuleData
): Module {
  const origById = new Map(original.sections.map((s) => [s.id, s]));

  return {
    ...original,
    type: edited.type as Module["type"],
    status: edited.status as Module["status"],
    title: edited.title,
    subtitle: edited.subtitle,
    description: edited.description,
    audience: edited.audience as Module["audience"],
    tags: edited.tags,
    order: edited.order,
    accentColor: edited.accentColor as Module["accentColor"],
    lastUpdated: new Date().toISOString().split("T")[0],
    sections: edited.sections.map((s: CustomSectionData) => {
      const orig = origById.get(s.id);
      return {
        id: s.id,
        type: s.type as Module["sections"][number]["type"],
        title: s.title,
        description: s.description,
        order: s.order,
        icon: orig?.icon,
        data: s.data,
      };
    }),
  };
}

// ─── Component ─────────────────────────────────────────────

type PublishState =
  | { kind: "idle" }
  | { kind: "publishing" }
  | { kind: "success"; at: string }
  | { kind: "error"; message: string };

export default function AdminLessonsClient({ modules }: Props) {
  const { isAdmin } = useAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Module | null>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [publish, setPublish] = useState<PublishState>({ kind: "idle" });
  const [token, setToken] = useState("");

  // Hydrate token client-side.
  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  const original = useMemo(
    () => modules.find((m) => m.id === selectedId) ?? null,
    [modules, selectedId]
  );

  // ─── Auth gate ────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="surface-card rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-warm-800">
            Επεξεργασία μαθημάτων
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

  const ensureToken = (): string | null => {
    if (token) return token;
    const input = prompt("Κωδικός για δημοσίευση μαθημάτων:");
    if (!input) return null;
    setStoredToken(input);
    setToken(input);
    return input;
  };

  const openLesson = (m: Module) => {
    setSelectedId(m.id);
    setDraft(JSON.parse(JSON.stringify(m)) as Module);
    setHasLocalChanges(false);
    setPublish({ kind: "idle" });
  };

  const handleEditorSave = (edited: CustomModuleData) => {
    if (!original) return;
    const merged = mergeBackIntoModule(original, edited);
    setDraft(merged);
    setHasLocalChanges(true);
    setPublish({ kind: "idle" });
  };

  const handleEditorCancel = () => {
    setSelectedId(null);
    setDraft(null);
    setHasLocalChanges(false);
    setPublish({ kind: "idle" });
  };

  const handlePublish = async () => {
    if (!draft) return;
    const t = ensureToken();
    if (!t) return;
    setPublish({ kind: "publishing" });
    const res = await publishOverride(draft, t);
    if (res.ok) {
      setHasLocalChanges(false);
      setPublish({
        kind: "success",
        at: new Date().toLocaleTimeString("el-GR"),
      });
    } else {
      // Bad token? Clear it so the next attempt re-prompts.
      if (res.error === "unauthorized") {
        setStoredToken("");
        setToken("");
      }
      setPublish({ kind: "error", message: res.error });
    }
  };

  const handleRevert = async () => {
    if (!original) return;
    if (
      !confirm(
        "Επαναφορά στην αρχική (στατική) έκδοση; Οι δημοσιευμένες αλλαγές για αυτό το μάθημα θα διαγραφούν."
      )
    ) {
      return;
    }
    const t = ensureToken();
    if (!t) return;
    setPublish({ kind: "publishing" });
    const res = await revertOverride(original.id, t);
    if (res.ok) {
      // Reload to show the static version.
      window.location.reload();
    } else {
      if (res.error === "unauthorized") {
        setStoredToken("");
        setToken("");
      }
      setPublish({ kind: "error", message: res.error });
    }
  };

  // ─── List view ────────────────────────────────────────────
  if (!selectedId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-warm-900">
            Επεξεργασία μαθημάτων
          </h1>
          <p className="mt-2 text-sm text-warm-500 max-w-2xl leading-6">
            Επίλεξε ένα μάθημα, επεξεργάσου το με τη φόρμα, και πάτα{" "}
            <strong>Δημοσίευση</strong>. Οι αλλαγές γίνονται αμέσως ορατές σε
            όλους τους επισκέπτες — δεν χρειάζεται deploy ούτε λήψη
            αρχείων.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => openLesson(m)}
                className="surface-card rounded-2xl w-full text-left p-5 hover:border-sky-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-warm-800">
                      {m.title}
                    </p>
                    {m.subtitle && (
                      <p className="vlach-text text-xs mt-0.5">{m.subtitle}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-warm-100 px-2 py-0.5 text-[11px] text-warm-600">
                    {m.type}
                  </span>
                </div>
                <p className="mt-2 text-xs text-warm-500 line-clamp-2">
                  {m.description}
                </p>
                <p className="mt-3 text-[11px] text-warm-400">
                  {m.sections.length} ενότητες
                  {m.lastUpdated ? ` · τελ. ενημέρωση ${m.lastUpdated}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ─── Editor view ──────────────────────────────────────────
  const isBusy = publish.kind === "publishing";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={handleEditorCancel}
            className="text-xs text-warm-500 hover:text-warm-700 underline-offset-2 hover:underline"
          >
            ← Πίσω στη λίστα
          </button>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-warm-900">
            {original?.title}
          </h1>
          <p className="text-xs text-warm-400 mt-0.5">id: {original?.id}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRevert}
              disabled={isBusy}
              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
              title="Διαγράφει την δημοσιευμένη έκδοση. Επιστρέφει στο αρχικό περιεχόμενο."
            >
              Επαναφορά αρχικού
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isBusy || !draft}
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {isBusy ? "Δημοσίευση…" : "Δημοσίευση"}
            </button>
          </div>
          <PublishStatus
            state={publish}
            dirty={hasLocalChanges}
          />
        </div>
      </header>

      {/* Workflow note */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-xs text-warm-700 leading-6">
        <strong className="font-semibold">Ροή εργασίας:</strong>{" "}
        Επεξεργάσου με τη φόρμα → πάτα <em>Αποθήκευση</em> στο κάτω μέρος
        της φόρμας → πάτα <em>Δημοσίευση</em> στο πάνω μέρος. Οι αλλαγές
        αποθηκεύονται στο cloud και εμφανίζονται αμέσως στους επισκέπτες.
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <a
          href={`/module/${original?.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-warm-100 px-3 py-1 text-warm-700 hover:bg-warm-200"
        >
          Άνοιγμα δημόσιας σελίδας ↗
        </a>
      </div>

      {original && (
        <AdminModuleCreator
          editModule={moduleToCustom(original)}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
}

// ─── Sub-component: status pill ─────────────────────────────

function PublishStatus({
  state,
  dirty,
}: {
  state: PublishState;
  dirty: boolean;
}) {
  if (state.kind === "publishing") {
    return (
      <span className="text-xs text-warm-500 animate-pulse">
        Δημοσίευση σε εξέλιξη…
      </span>
    );
  }
  if (state.kind === "success") {
    return (
      <span className="text-xs text-olive-700">
        ✓ Δημοσιεύθηκε · {state.at}
      </span>
    );
  }
  if (state.kind === "error") {
    return (
      <span className="text-xs text-rose-600">
        Σφάλμα: {state.message}
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="text-xs text-terra-600">
        Υπάρχουν μη-δημοσιευμένες αλλαγές
      </span>
    );
  }
  return null;
}
