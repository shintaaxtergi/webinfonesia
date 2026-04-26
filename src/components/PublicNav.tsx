"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PublicNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-[3px] ${
              isActive("/") 
                ? "text-accent border-accent font-black" 
                : "text-gray-700 border-transparent hover:text-accent hover:border-accent"
            }`}
          >
            Home
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-[3px] ${
                isActive(`/${cat.slug}`)
                  ? "text-accent border-accent font-black"
                  : "text-gray-700 border-transparent hover:text-accent hover:border-accent"
              }`}
            >
              {cat.name}
            </Link>
          ))}

          {/* Extra static links */}
          <Link
            href="/video"
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-[3px] ${
              isActive("/video")
                ? "text-accent border-accent font-black"
                : "text-gray-700 border-transparent hover:text-accent hover:border-accent"
            }`}
          >
            Video
          </Link>
          <Link
            href="/foto"
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-[3px] ${
              isActive("/foto")
                ? "text-accent border-accent font-black"
                : "text-gray-700 border-transparent hover:text-accent hover:border-accent"
            }`}
          >
            Foto
          </Link>
          <Link
            href="/cek-fakta"
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-[3px] ${
              isActive("/cek-fakta")
                ? "text-accent border-accent font-black"
                : "text-gray-700 border-transparent hover:text-accent hover:border-accent"
            }`}
          >
            Cek Fakta
          </Link>
        </nav>
      </div>
    </div>
  );
}
