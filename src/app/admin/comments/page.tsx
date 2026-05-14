import type { Metadata } from "next";
import AdminCommentsClient from "@/components/AdminCommentsClient";

export const metadata: Metadata = {
  title: "Σχόλια — Διαχείριση",
  description: "Έλεγχος δημόσιων σχολίων.",
  robots: { index: false, follow: false },
};

export default function AdminCommentsPage() {
  return <AdminCommentsClient />;
}
