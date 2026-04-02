"use client";

import { useState } from "react";
import type { VocabularySection } from "@/lib/types";

export default function VocabularyGrid({
  sections,
}: {
  sections: VocabularySection[];
}) {
  const [activeSection, setActiveSection] = useState(0);
  const [search, setSearch] = useState("");

  if (sections.length === 0) {
    return (
      <div className="text-warm-500 text-center py-12">
        Δεν υπάρχει διαθέσιμο λεξιλόγιο για αυτή την ενότητα.
      </div>
    );
  }

  const currentItems = sections[activeSection]?.items || [];
  const filtered = search
    ? currentItems.filter(
        (item) =>
          item.vlach?.toLowerCase().includes(search.toLowerCase()) ||
          item.greek?.toLowerCase().includes(search.toLowerCase())
      )
    : currentItems;

  return (
    <div>
      {/* Section tabs */}
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((sec, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveSection(i);
                setSearch("");
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeSection === i
                  ? "bg-warm-800 text-white"
                  : "bg-warm-100 text-warm-600 hover:bg-warm-200"
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Αναζήτηση λέξης..."
          className="w-full sm:w-80 px-4 py-2.5 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-300"
        />
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <p className="vlach-text text-base font-medium">{item.vlach}</p>
            {item.greek && (
              <p className="greek-text text-sm mt-1">{item.greek}</p>
            )}
            {item.definite && (
              <p className="text-xs text-warm-400 mt-1">
                + άρθρο: <span className="vlach-text">{item.definite}</span>
              </p>
            )}
            {item.indefinite && (
              <p className="text-xs text-warm-400">
                αόριστο: <span className="vlach-text">{item.indefinite}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-warm-400 text-center py-8 text-sm">
          Δεν βρέθηκαν αποτελέσματα.
        </p>
      )}

      <p className="text-xs text-warm-400 mt-6 text-center">
        {filtered.length} λέξεις
      </p>
    </div>
  );
}
