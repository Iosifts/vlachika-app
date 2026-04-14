import { getPublishedModules, getModulesByType } from "@/lib/modules";
import HomePageClient from "@/components/HomePageClient";

export default function HomePage() {
  const modules = getPublishedModules();
  const lessons = modules.filter(
    (m) => m.type === "lesson" || m.type === "coming_soon"
  );
  const documentationModules = getModulesByType("documentation_project");

  return (
    <HomePageClient
      lessons={JSON.parse(JSON.stringify(lessons))}
      documentationModules={JSON.parse(JSON.stringify(documentationModules))}
    />
  );
}
