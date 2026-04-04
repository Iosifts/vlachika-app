"use client";

import { useAdmin } from "./AdminContext";

export default function AdminToggle() {
  const { isAdmin, toggle } = useAdmin();

  return (
    <button
      onClick={toggle}
      title={isAdmin ? "Απενεργοποίηση admin" : "Ενεργοποίηση admin"}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
        isAdmin
          ? "bg-sky-100 text-sky-700 ring-2 ring-sky-300"
          : "bg-warm-100 text-warm-500 hover:bg-warm-200"
      }`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isAdmin ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        )}
      </svg>
      {isAdmin ? "Admin" : "Admin"}
      {isAdmin && (
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
      )}
    </button>
  );
}
