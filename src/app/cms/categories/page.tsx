"use client";

import { useEffect, useState } from "react";

export default function CmsCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#C0392B");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = () => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("infonesia_token");
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, color }),
      });

      if (res.ok) {
        setName("");
        setSlug("");
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.errors?.[0] || "Gagal membuat kategori");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Tambah Kategori */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-bold text-ink mb-6">Tambah Kategori</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Nama Kategori</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Auto-slug generator simple
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""));
                }}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent"
                placeholder="Contoh: Bisnis Digital"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Slug (URL)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent bg-gray-50"
                placeholder="bisnis-digital"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Warna Label</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg outline-none uppercase"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ink text-white py-2 rounded-lg font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Tambah Kategori"}
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Kategori */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-ink">Daftar Kategori</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Warna</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Belum ada kategori.</td></tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 rounded shadow-sm border border-border" style={{ backgroundColor: cat.color || "#000" }} />
                      </td>
                      <td className="px-6 py-4 font-bold text-ink">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        /{cat.slug}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-red-500 hover:text-red-700 text-sm font-bold">Hapus</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
