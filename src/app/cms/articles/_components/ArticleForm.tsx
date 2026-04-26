"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId?: string;
  tags: string;
  status: string;
  featuredImageUrl: string;
  videoUrl: string;
  expiresAt: string;
}

interface ArticleFormProps {
  initialData?: ArticleFormData;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  isSubmitting: boolean;
  pageTitle: string;
  pageDescription: string;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  isSubmitting,
  pageTitle,
  pageDescription
}: ArticleFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    authorId: "",
    tags: "",
    status: "DRAFT",
    featuredImageUrl: "",
    videoUrl: "",
    expiresAt: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("infonesia_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    Promise.all([
      fetch("/api/v1/categories", { headers }).then((res) => res.json()),
      fetch("/api/v1/cms/users", { headers }).then((res) => res.json())
    ]).then(([cats, usrs]) => {
      setCategories(cats.data || []);
      setUsers(usrs.data || []);
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (initialData.featuredImageUrl) {
        setPreviewImage(initialData.featuredImageUrl);
      }
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          featuredImageUrl: reader.result as string,
        }));
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Judul dan Konten Utama wajib diisi!");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-ink">{pageTitle}</h2>
          <p className="text-gray-500">{pageDescription}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-border text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN EDITOR AREA */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border space-y-6">
            <div>
              <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2">Judul Artikel</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full text-2xl font-bold px-0 border-none focus:ring-0 placeholder:text-gray-300 outline-none"
                placeholder="Judul Berita..."
              />
              <div className="h-px bg-gray-100 w-full mt-2"></div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2">Ringkasan (Excerpt)</label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none resize-none"
                placeholder="Ringkasan singkat artikel..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2">Konten Utama</label>
              <p className="text-xs text-gray-400 mb-2">Tulis isi artikel dengan teks biasa. (Tekan Enter 2x untuk paragraf baru). Data lama dengan tag HTML tetap didukung.</p>
              <textarea
                required
                rows={18}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none font-mono text-sm leading-relaxed"
                placeholder="Tulis isi artikel Anda di sini..."
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR SETTINGS */}
        <div className="lg:col-span-1 space-y-8">
          {/* MEDIA UPLOAD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              📸 Media & Video
            </h3>
            
            <div 
              className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
                previewImage ? "border-transparent" : "border-gray-200 hover:border-accent bg-gray-50"
              }`}
            >
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData((prev) => ({ ...prev, featuredImageUrl: "" }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-gray-500 mb-2">Upload Foto</p>
                  <p className="text-xs text-gray-400">Klik untuk pilih file</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Video URL (YouTube/Vimeo)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
              />
            </div>
          </div>

          {/* PUBLISHING SETTINGS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <h3 className="text-lg font-bold text-ink">Pengaturan Lanjut</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Tags (pisahkan dengan koma)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
                placeholder="contoh: politik, nasional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Tanggal Expired (Otomatis Tak Layak)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">*Berita akan otomatis hilang dari portal setelah tanggal ini.</p>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Status Publikasi</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl font-bold outline-none border transition-all text-sm ${
                  formData.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-200" :
                  formData.status === "DRAFT" ? "bg-gray-50 text-gray-600 border-gray-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Penulis Artikel</label>
              <select
                value={formData.authorId || ""}
                onChange={(e) => setFormData({...formData, authorId: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
              >
                <option value="">-- Pilih Penulis (Default: Anda) --</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Kategori</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
              >
                <option value="">-- Tanpa Kategori --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
