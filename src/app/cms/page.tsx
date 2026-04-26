"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({ articles: 0, categories: 0, views: 0, users: 0 });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("infonesia_user");
    const token = localStorage.getItem("infonesia_token");
    if (storedUser) setUser(JSON.parse(storedUser));

    if (token) {
      fetch("/api/v1/cms/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setStats(data.data);
          }
        })
        .catch((err) => console.error("Error fetching stats:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Selamat datang kembali, {user.fullName}!</h2>
          <p className="text-gray-500 mt-1">Berikut adalah ringkasan performa portal berita Anda hari ini.</p>
        </div>
        <Link 
          href="/cms/articles/new"
          className="bg-accent text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-accent-hover transition-colors"
        >
          + Tulis Artikel Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="text-gray-500 text-sm font-medium mb-2">Total Artikel</div>
          <div className="text-3xl font-bold text-ink">{loading ? "..." : stats.articles}</div>
          <div className="text-sm text-green-600 mt-2 font-medium">Aktif di database</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="text-gray-500 text-sm font-medium mb-2">Total Kategori</div>
          <div className="text-3xl font-bold text-ink">{loading ? "..." : stats.categories}</div>
          <div className="text-sm text-gray-400 mt-2">Struktur konten</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="text-gray-500 text-sm font-medium mb-2">Total Pengguna</div>
          <div className="text-3xl font-bold text-ink">{loading ? "..." : stats.users}</div>
          <div className="text-sm text-gray-400 mt-2">Tim Redaksi</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="text-gray-500 text-sm font-medium mb-2">Kunjungan (Mock)</div>
          <div className="text-3xl font-bold text-ink">12.543</div>
          <div className="text-sm text-green-600 mt-2 font-medium">↑ 15% dari bulan lalu</div>
        </div>
      </div>
    </div>
  );
}
