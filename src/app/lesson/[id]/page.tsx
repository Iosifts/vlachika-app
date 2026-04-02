import { notFound } from "next/navigation";
import { getLessonByNumber, getAvailableLessonNumbers } from "@/lib/lessons";
import LessonPageClient from "@/components/LessonPageClient";

export function generateStaticParams() {
  return getAvailableLessonNumbers().map((num) => ({
    id: String(num),
  }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonNum = parseInt(id, 10);
  const lesson = getLessonByNumber(lessonNum);

  if (!lesson) return notFound();

  return <LessonPageClient lesson={JSON.parse(JSON.stringify(lesson))} />;
}
