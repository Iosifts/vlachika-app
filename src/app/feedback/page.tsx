import type { Metadata } from "next";
import FeedbackPageClient from "@/components/FeedbackPageClient";

export const metadata: Metadata = {
  title: "Σχόλια & Ιδέες — Μαθήματα Βλάχικων",
  description:
    "Άφησε μια σύντομη γνώμη ή ιδέα για την ιστοσελίδα. Τα σχόλια εμφανίζονται δημόσια μετά από έλεγχο.",
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
