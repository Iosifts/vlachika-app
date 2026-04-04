import { redirect } from "next/navigation";

/**
 * Legacy route — redirects /lesson/1 → /module/lesson-1
 */
export default async function LessonRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/module/lesson-${id}`);
}
