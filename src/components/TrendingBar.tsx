"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TrendingBar({ topics }: { topics: string[] }) {
  const pathname = usePathname();

  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2.5 overflow-x-auto scrollbar-none">
          {/* Trending label */}
          <div className="flex-shrink-0 flex items-center gap-1.5 text-accent font-bold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Trending</span>
          </div>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-5 bg-gray-300" />

          {/* Trending topics */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {topics.map((topic, i) => {
              const slug = topic.toLowerCase().replace(/\s+/g, '-');
              const href = `/topic/${slug}`;
              // Determine if this topic is the currently active one
              const isActive = pathname === href;

              return (
                <Link
                  key={i}
                  href={href}
                  className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-white border border-[#e9421e] text-[#e9421e]"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-accent hover:text-accent"
                  }`}
                >
                  {topic}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
