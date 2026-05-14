import { fetchPublishedModules } from "@/lib/modules";
import HomePageClient from "@/components/HomePageClient";

// Homepage shows latest titles/descriptions/images, including admin edits.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const modules = await fetchPublishedModules();

  // Public homepage shows only learning content. PII-bearing module types
  // (documentation/fieldwork/archive) never leave the server — even admin
  // doesn't see them here; they manage those via /admin/lessons.
  const lessons = modules.filter(
    (m) => m.type === "lesson" || m.type === "coming_soon"
  );

  return (
    <HomePageClient
      lessons={JSON.parse(JSON.stringify(lessons))}
      documentationModules={[]}
    />
  );
}
