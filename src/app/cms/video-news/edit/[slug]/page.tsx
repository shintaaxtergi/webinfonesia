"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ArticleForm, { ArticleFormData } from "../../../articles/_components/ArticleForm";

export default function EditVideoNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ArticleFormData | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("infonesia_token");
        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

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
            expiresAt: article.expiresAt ? new Date(article.expiresAt).toISOString().split('T')[0] : "",
            contentType: article.contentType || "VIDEO"
          });
        }
      } catch (err) {
        alert("Gagal mengambil data video");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleSubmit = async (formData: ArticleFormData) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("infonesia_token");

    const tagArray = formData.tags.split(",").map(t => t.trim()).filter(t => t.length > 0);

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
          expiresAt: formData.expiresAt || undefined,
          contentType: formData.contentType || "VIDEO"
        })
      });

      if (res.ok) {
        router.push("/cms/video-news");
      } else {
        const data = await res.json();
        alert("Gagal memperbarui video:\n" + (data.errors?.join("\n") || data.message || "Unknown error"));
      }
    } catch (err) {
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
      pageTitle="Edit Berita Video"
      pageDescription="Sesuaikan konten, durasi, dan media berita video Anda."
      contentType="VIDEO"
    />
  );
}
