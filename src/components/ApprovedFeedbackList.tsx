"use client";

import { useEffect, useState } from "react";
import {
  fetchApprovedFeedback,
  type FeedbackItem,
} from "@/lib/services/feedback";

interface Props {
  /** Bumped by the parent after a successful submission to trigger a refresh. */
  refreshKey?: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("el-GR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ApprovedFeedbackList({ refreshKey = 0 }: Props) {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchApprovedFeedback();
      if (alive) setItems(data);
    })();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (items === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-warm-400 animate-pulse">Φόρτωση…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="surface-card rounded-2xl px-6 py-10 text-center">
        <p className="text-sm text-warm-500">
          Δεν υπάρχουν ακόμη δημόσια σχόλια. Γίνε ο πρώτος που θα στείλει
          μια ιδέα.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="surface-card rounded-2xl px-5 py-4 sm:px-6 sm:py-5"
        >
          <p className="text-sm leading-7 text-warm-800 whitespace-pre-wrap">
            {item.text}
          </p>
          <p className="mt-2 text-xs text-warm-400">
            {formatDate(item.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
