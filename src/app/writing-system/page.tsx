import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Σύστημα γραφής — Μαθήματα Βλάχικων",
  description:
    "Πώς γράφεται η βλάχικη σε αυτή την ιστοσελίδα και ποιες είναι οι πηγές μας.",
};

export default function WritingSystemPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <header>
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
          Πληροφορίες
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-warm-900">
          Το σύστημα γραφής που ακολουθούμε
        </h1>
        <p className="mt-3 text-warm-600 leading-7">
          Η βλάχικη / αρμάνικη δεν έχει ένα μοναδικό «επίσημο» σύστημα
          γραφής. Στην ιστοσελίδα χρησιμοποιούμε ένα συγκεκριμένο σύστημα
          με συνέπεια, για να μπορείς να μαθαίνεις χωρίς να μπερδεύεσαι από
          ορθογραφικές παραλλαγές.
        </p>
      </header>

      <section className="surface-card rounded-2xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-semibold text-warm-800">
          Βασικές αρχές
        </h2>
        <ul className="space-y-2 text-sm leading-7 text-warm-700">
          <li className="flex gap-2">
            <span aria-hidden className="text-sky-500">·</span>
            <span>
              Διατηρούμε τα γράμματα της παράδοσης χωρίς αλλαγές
              χαρακτήρων, ώστε τα κείμενα να είναι συμβατά με υπάρχουσες
              πηγές.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-sky-500">·</span>
            <span>
              Όπου χρειάζεται, δίνουμε φωνητική οδηγία στα ελληνικά για να
              βοηθήσουμε στην προφορά.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-sky-500">·</span>
            <span>
              Σε όλες τις ασκήσεις και τα quiz αναγνωρίζονται μόνο οι
              ορθογραφικές μορφές που διδάσκονται στο μάθημα.
            </span>
          </li>
        </ul>
      </section>

      <section className="surface-card rounded-2xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-semibold text-warm-800">
          Διαλεκτική ποικιλία
        </h2>
        <p className="text-sm leading-7 text-warm-700">
          Η βλάχικη ομιλείται σε πολλές περιοχές και έχει πλούσια
          διαλεκτική παραλλαγή — από τα Γρεβενά και το Μέτσοβο μέχρι την
          Πίνδο, τη Θεσσαλία και πέρα από τα σύνορα. Η μορφή που μαθαίνεις
          εδώ είναι μία επιλογή που λειτουργεί διδακτικά, όχι μία απόφαση
          για το «σωστό». Αν στο σπίτι σου ακούς διαφορετική προφορά ή
          λέξη, κράτησέ την — είναι κι αυτή σωστή.
        </p>
      </section>

      <section className="surface-card rounded-2xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-semibold text-warm-800">
          Έχεις παρατήρηση;
        </h2>
        <p className="text-sm leading-7 text-warm-700">
          Αν εντοπίσεις ορθογραφικό λάθος, ασυνέπεια ή πρόταση για άλλη
          εκδοχή, στείλε μας μια σύντομη σημείωση στη σελίδα{" "}
          <a
            href="/feedback"
            className="text-sky-600 hover:text-sky-700 underline-offset-2 hover:underline"
          >
            Σχόλια
          </a>
          . Οι παρατηρήσεις μας βοηθούν να βελτιώνουμε το υλικό.
        </p>
      </section>
    </article>
  );
}
