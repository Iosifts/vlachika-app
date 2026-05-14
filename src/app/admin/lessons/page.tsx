import type { Metadata } from "next";
import AdminLessonsClient from "@/components/AdminLessonsClient";
import { fetchPublishedModules } from "@/lib/modules";

export const metadata: Metadata = {
  title: "Επεξεργασία μαθημάτων — Admin",
  description: "Επεξεργασία περιεχομένου μαθημάτων.",
  robots: { index: false, follow: false },
};

// Always show the live (override-aware) state so admin edits what's
// actually rendered to visitors.
export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const modules = await fetchPublishedModules();
  return (
    <AdminLessonsClient modules={JSON.parse(JSON.stringify(modules))} />
  );
}
