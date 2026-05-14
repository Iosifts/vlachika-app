"use client";

import Link from "next/link";
import { useAdmin } from "./AdminContext";

/**
 * Site navigation.
 *
 * Public visitors see: Αρχική, Μαθήματα, Σχόλια.
 * Admin mode adds: Τεκμηρίωση + Διαχείριση σχολίων.
 */
export default function MainNav() {
  const { isAdmin } = useAdmin();

  return (
    <nav className="hidden sm:flex items-center gap-6 text-sm text-warm-600">
      <Link href="/" className="hover:text-warm-800 transition-colors">
        Αρχική
      </Link>
      <Link href="/#lessons" className="hover:text-warm-800 transition-colors">
        Μαθήματα
      </Link>
      <Link
        href="/feedback"
        className="hover:text-warm-800 transition-colors"
      >
        Σχόλια
      </Link>
      {isAdmin && (
        <>
          <Link
            href="/admin/lessons"
            className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100 transition-colors"
          >
            Μαθήματα (admin)
          </Link>
          <Link
            href="/admin/comments"
            className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100 transition-colors"
          >
            Σχόλια (admin)
          </Link>
        </>
      )}
    </nav>
  );
}
