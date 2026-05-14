import { notFound } from "next/navigation";
import { fetchModuleById, getAllModules } from "@/lib/modules";
import ModulePageClient from "@/components/ModulePageClient";
import CustomModuleLoader from "@/components/CustomModuleLoader";

// Lesson pages read latest overrides on every request so admin edits
// publish instantly. The Supabase round-trip is one small query per request.
export const dynamic = "force-dynamic";
export const dynamicParams = true;

/**
 * Types that contain PII workflows (speaker recordings, fieldwork notes,
 * archive metadata). These must NOT be accessible at the public URL.
 *
 * Admin still reaches them via the admin lesson editor / archive views.
 */
const PUBLIC_BLOCKED_TYPES: ReadonlySet<string> = new Set([
  "documentation_project",
  "fieldwork_task",
  "archive",
]);

export function generateStaticParams() {
  return getAllModules()
    .filter(
      (m) =>
        m.status !== "coming_soon" && !PUBLIC_BLOCKED_TYPES.has(m.type)
    )
    .map((m) => ({ id: m.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = await fetchModuleById(id);

  // Treat PII-bearing module types as not-found at the public URL.
  // The admin reaches them via the protected /admin/lessons editor.
  if (mod && PUBLIC_BLOCKED_TYPES.has(mod.type)) {
    notFound();
  }

  if (mod && mod.status !== "coming_soon") {
    return <ModulePageClient module={JSON.parse(JSON.stringify(mod))} />;
  }

  return <CustomModuleLoader moduleId={id} />;
}
