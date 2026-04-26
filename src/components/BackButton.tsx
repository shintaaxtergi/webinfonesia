"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton({ categoryName, categorySlug }: { categoryName?: string, categorySlug?: string }) {
  const router = useRouter();

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-[108px] sm:top-[124px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#e9421e] transition-colors group flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>

          {/* Breadcrumbs Optional */}
          {categoryName && categorySlug && (
            <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="hover:text-ink cursor-pointer" onClick={() => router.push("/")}>Home</span>
              <span className="text-gray-300">/</span>
              <span className="hover:text-[#e9421e] cursor-pointer" onClick={() => router.push(`/${categorySlug}`)}>{categoryName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
