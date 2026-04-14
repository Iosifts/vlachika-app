import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { AdminProvider } from "@/components/AdminContext";
import AdminToggle from "@/components/AdminToggle";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Μαθήματα Βλάχικης Γλώσσας",
  description:
    "Διαδραστική πλατφόρμα εκμάθησης βλάχικης γλώσσας για ελληνόφωνους.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist)]">
        <AdminProvider>
          {/* ─── Header ─── */}
          <header className="bg-white/80 backdrop-blur border-b border-warm-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="text-2xl">🏔</span>
                <div>
                  <h1 className="text-lg font-semibold text-warm-800 group-hover:text-sky-600 transition-colors">
                    Μαθήματα Βλάχικων
                  </h1>
                  <p className="text-xs text-warm-500">
                    Armâneashce — 2026
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <nav className="hidden sm:flex items-center gap-6 text-sm text-warm-600">
                  <Link
                    href="/"
                    className="hover:text-warm-800 transition-colors"
                  >
                    Αρχική
                  </Link>
                  <Link
                    href="/#lessons"
                    className="hover:text-warm-800 transition-colors"
                  >
                    Μαθήματα
                  </Link>
                  <Link
                    href="/#documentation"
                    className="hover:text-warm-800 transition-colors"
                  >
                    Τεκμηρίωση
                  </Link>
                </nav>
                <AdminToggle />
              </div>
            </div>
          </header>

          {/* ─── Main ─── */}
          <main className="flex-1">{children}</main>

          {/* ─── Footer ─── */}
          <footer className="border-t border-warm-200 bg-white/60 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-warm-500">
              <p>
                Η γραφή ακολουθεί ακριβώς το σύστημα εγγραφισμού της βλάχικης
                γλώσσας, χωρίς αλλαγές χαρακτήρων.
              </p>
              <p className="mt-3 text-warm-600 font-medium">
                Δημιουργήθηκε από τον Ιωσήφ Τσάνγκο για τον Σύλλογο Βλάχων Αθήνας
              </p>
              <p className="mt-2 text-warm-400">
                Μαθήματα Βλάχικων &copy; 2026
              </p>
            </div>
          </footer>
        </AdminProvider>
      </body>
    </html>
  );
}
