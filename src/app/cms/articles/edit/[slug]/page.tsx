"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ArticleForm, { ArticleFormData } from "../../_components/ArticleForm";

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ArticleFormData | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("infonesia_token");
        const authHeaders: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const artRes = await fetch(`/api/v1/articles/${slug}`, { headers: authHeaders });
        const artData = await artRes.json();
        
        if (artData.data) {
          const article = artData.data;
          setInitialData({
            title: article.title,
            excerpt: article.excerpt || "",
            content: article.content,
            categoryId: article.categoryId || "",
            authorId: article.authorId || "",
            tags: article.tags?.map((t: any) => t.tag.name).join(", ") || "",
            status: article.status,
            featuredImageUrl: article.featuredImage?.url || article.ogImageUrl || "",
            videoUrl: article.videoUrl || "",
            expiresAt: article.expiresAt ? new Date(article.expiresAt).toISOString().split('T')[0] : ""
          });
        }
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data artikel");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleSubmit = async (formData: ArticleFormData) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("infonesia_token");

    // Process tags
    const tagArray = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      const res = await fetch(`/api/v1/articles/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          categoryId: formData.categoryId || undefined,
          authorId: formData.authorId || undefined,
          tags: tagArray,
          status: formData.status,
          videoUrl: formData.videoUrl || undefined,
          featuredImageUrl: formData.featuredImageUrl || undefined,
          expiresAt: formData.expiresAt || undefined
        })
      });

      console.log("[UPDATE] Response status:", res.status);

      if (res.ok) {
        router.push("/cms/articles");
      } else {
        const data = await res.json();
        console.error("[UPDATE] API Error:", data);
        alert("Gagal memperbarui artikel:\n" + (data.errors?.join("\n") || data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <ArticleForm 
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      pageTitle="Edit Artikel"
      pageDescription="Sesuaikan konten, durasi, dan media berita Anda."
    />
  );
}
