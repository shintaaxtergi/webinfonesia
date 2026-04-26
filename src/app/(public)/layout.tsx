import Link from "next/link";
import { prisma } from "@/lib/db";
import PublicNav from "@/components/PublicNav";
import TrendingBar from "@/components/TrendingBar";

async function Header() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Static trending topics
  const trendingTopics = [
    "Teknologi AI",
    "Pemilu 2026",
    "Ekonomi Digital",
    "Sepak Bola",
    "Pasar Modal",
    "Startup Indonesia",
    "Kesehatan",
    "Lingkungan",
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* ── TOP BAR: Logo + Search + Login ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="font-display font-black text-3xl tracking-tight text-ink">
                Info<span className="text-accent">Nesia</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form
              action="/search"
              method="GET"
              className="flex-1 max-w-2xl flex items-center"
            >
              <div className="flex w-full rounded-full border-2 border-gray-200 overflow-hidden focus-within:border-accent transition-colors">
                <input
                  type="text"
                  name="q"
                  placeholder="Berita apa yang ingin anda baca hari ini?"
                  className="flex-1 px-5 py-2.5 text-sm text-gray-700 outline-none bg-white placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 transition-colors text-white font-bold px-6 py-2.5 text-sm tracking-wide"
                >
                  CARI
                </button>
              </div>
            </form>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/cms/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-ink border-2 border-ink px-4 py-2 rounded-full hover:bg-ink hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Masuk
              </Link>
              <Link
                href="/cms"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-300 px-3 py-2 rounded-full hover:border-accent hover:text-accent transition-all"
              >
                CMS
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV BAR: Kategori ── */}
      <PublicNav categories={categories} />

      {/* ── TRENDING BAR ── */}
      <TrendingBar topics={trendingTopics} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white mt-20">
      {/* Top footer */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="font-display font-black text-3xl tracking-tight">
                Info<span className="text-accent">Nesia</span>
              </Link>
              <p className="text-gray-400 text-sm mt-3 max-w-sm leading-relaxed">
                Portal berita digital Indonesia yang menyajikan informasi terkini, terpercaya, dan berimbang untuk masyarakat Indonesia.
              </p>
              <div className="flex gap-3 mt-5">
                {/* Social icons */}
                {[
                  { label: "Twitter/X", icon: "𝕏" },
                  { label: "Instagram", icon: "📸" },
                  { label: "YouTube", icon: "▶" },
                  { label: "Facebook", icon: "f" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold hover:bg-accent transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Kategori</h4>
              <ul className="space-y-2">
                {["Politik", "Ekonomi", "Teknologi", "Olahraga", "Hiburan", "Kesehatan"].map((c) => (
                  <li key={c}>
                    <Link href={`/${c.toLowerCase()}`} className="text-gray-400 text-sm hover:text-white transition-colors">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">InfoNesia</h4>
              <ul className="space-y-2">
                {["Tentang Kami", "Redaksi", "Pedoman Siber", "Kebijakan Privasi", "Syarat & Ketentuan", "Kontak"].map((p) => (
                  <li key={p}>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} InfoNesia. All rights reserved.
        </p>
        <p className="text-gray-600 text-xs">
          Portal Berita Digital Indonesia
        </p>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
