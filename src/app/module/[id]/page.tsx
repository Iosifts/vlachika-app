import { getModuleById, getAllModules } from "@/lib/modules";
import ModulePageClient from "@/components/ModulePageClient";
import CustomModuleLoader from "@/components/CustomModuleLoader";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllModules()
    .filter((m) => m.status !== "coming_soon")
    .map((m) => ({ id: m.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = getModuleById(id);

  // If it's a known static module, render directly
  if (mod && mod.status !== "coming_soon") {
    return <ModulePageClient module={JSON.parse(JSON.stringify(mod))} />;
  }

  // Otherwise, try loading from custom modules (client-side localStorage)
  return <CustomModuleLoader moduleId={id} />;
}
