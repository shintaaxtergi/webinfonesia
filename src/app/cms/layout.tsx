"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Simple client-side auth check
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("infonesia_token");
    if (!token && !pathname.includes("/cms/login")) {
      router.push("/cms/login");
    }
  }, [pathname, router]);

  if (!isMounted) return null;

  // Don't show sidebar on login page
  if (pathname === "/cms/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("infonesia_token");
    localStorage.removeItem("infonesia_user");
    router.push("/cms/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/cms" },
    { name: "Artikel", href: "/cms/articles" },
    { name: "Berita Video", href: "/cms/video-news" },
    { name: "Kategori", href: "/cms/categories" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col">
        <div className="p-6">
          <Link href="/cms" className="font-display font-bold text-2xl tracking-tight">
            Info<span className="text-accent">Nesia</span> CMS
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = link.href === "/cms"
              ? pathname === "/cms"
              : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-accent text-white" : "text-gray-300 hover:bg-ink-soft hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-ink-soft space-y-3">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center px-4 py-2 bg-transparent border-2 border-ink-soft text-gray-300 rounded-lg hover:text-white hover:border-gray-400 transition-colors"
          >
            Lihat Portal
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-ink-soft text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-border px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink capitalize">
            {pathname === "/cms" ? "Dashboard" : pathname.split("/").pop()}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
              Admin Mode
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
