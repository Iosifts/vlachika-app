"use client";

import { useState, useEffect } from "react";
import { loadCustomModules } from "@/lib/admin";
import type { Module } from "@/lib/types";
import ModulePageClient from "./ModulePageClient";
import Link from "next/link";

interface Props {
  moduleId: string;
}

export default function CustomModuleLoader({ moduleId }: Props) {
  const [mod, setMod] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customs = loadCustomModules();
    const found = customs.find((m) => m.id === moduleId);
    if (found) {
      // Convert to Module shape
      setMod({
        ...found,
        sections: found.sections.map((s) => ({
          ...s,
          data: s.data || {},
        })),
      } as unknown as Module);
    }
    setLoading(false);
  }, [moduleId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-warm-400 animate-pulse">Φόρτωση...</div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-warm-700 mb-4">
          Η ενότητα δεν βρέθηκε
        </h2>
        <p className="text-warm-500 mb-6">
          Αυτή η ενότητα δεν υπάρχει ή έχει διαγραφεί.
        </p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          Πίσω στην αρχική
        </Link>
      </div>
    );
  }

  return <ModulePageClient module={mod} />;
}
