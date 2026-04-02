import LessonCard from "@/components/LessonCard";
import { getAllLessons, MISSING_LESSONS } from "@/lib/lessons";

export default function HomePage() {
  const lessons = getAllLessons();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
            Armâneashce — 2026
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-warm-900">
            Μαθήματα Βλάχικης Γλώσσας
          </h2>

          <p className="mt-5 text-warm-600 max-w-2xl mx-auto text-lg leading-8">
            Μάθε βλάχικα βήμα-βήμα μέσα από οργανωμένες ενότητες με θεωρία,
            λεξιλόγιο, ασκήσεις, κάρτες επανάληψης και quiz.
          </p>

          <p className="mt-3 text-sm sm:text-base text-warm-500 max-w-xl mx-auto leading-7">
            Η γραφή ακολουθεί ακριβώς το προτεινόμενο σύστημα εγγραφισμού.
          </p>
        </div>
      </section>

      <section id="lessons" className="pb-20">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.meta.number} meta={lesson.meta} />
          ))}

          {MISSING_LESSONS.map((num) => (
            <div
              key={num}
              className="surface-card rounded-2xl p-7 flex min-h-[320px] flex-col items-center justify-center text-center opacity-75"
            >
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-warm-100 text-warm-500 mb-4">
                Ενότητα {num}
              </span>

              <h3 className="text-2xl font-semibold text-warm-700 mb-2">
                Προσεχώς
              </h3>

              <p className="text-sm text-warm-500 max-w-xs leading-6">
                Το υλικό αυτής της ενότητας ετοιμάζεται και θα προστεθεί σύντομα.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}