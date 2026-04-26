"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CmsArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("infonesia_token");
    fetch("/api/v1/articles?status=ALL", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          console.error("API Error:", data.errors);
          alert("Gagal mengambil artikel: " + (data.errors?.[0] || "Unknown error"));
          return;
        }
        // Tampilkan semua data dari fetch (tidak ada lagi deletedAt)
        setArticles(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Apakah yakin mau menghapus artikel? Data tidak dapat dikembalikan.")) return;

    const token = localStorage.getItem("infonesia_token");
    try {
      console.log(`[DELETE] Request delete artikel: ${slug}`);
      const res = await fetch(`/api/v1/articles/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[DELETE] Response status:", res.status);

      if (res.ok) {
        setArticles((prev) => prev.filter((a: any) => a.slug !== slug));
        console.log("[DELETE] Artikel berhasil dihapus permanen");
      } else {
        const data = await res.json();
        console.error("[DELETE] API Error Response:", data);
        window.alert("Gagal menghapus: " + (data.errors?.join("\n") || data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("[DELETE] Fetch Error:", err);
      window.alert("Terjadi kesalahan sistem saat menghubungi server.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-ink">Manajemen Artikel</h2>
        <div className="flex items-center gap-3">
          <Link 
            href="/cms/articles/new"
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
          >
            + Tulis Artikel
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Penulis</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Memuat data artikel...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Belum ada artikel yang dibuat.</td></tr>
            ) : (
              articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink line-clamp-1 group-hover:text-accent transition-colors">{article.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                      {article.category?.name || "Tanpa Kategori"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      article.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                      article.status === "DRAFT" ? "bg-gray-100 text-gray-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {article.author.fullName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        href={`/${article.category?.slug || 'uncategorized'}/${article.slug}`} 
                        target="_blank" 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/link"
                        title="Lihat Portal"
                      >
                        <span className="text-sm font-bold">Lihat</span>
                      </Link>
                      <Link 
                        href={`/cms/articles/edit/${article.slug}`} 
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Artikel"
                      >
                        <span className="text-sm font-bold">Edit</span>
                      </Link>
                      <button 
                        type="button"
                        onClick={() => handleDelete(article.slug)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer relative z-10"
                        title="Hapus Artikel"
                      >
                        <span className="text-sm font-bold">Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
