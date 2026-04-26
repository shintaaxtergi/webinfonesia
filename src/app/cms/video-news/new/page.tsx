"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleForm, { ArticleFormData } from "../../articles/_components/ArticleForm";

export default function NewVideoNewsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ArticleFormData) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("infonesia_token");
    
    const tagArray = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
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
      contentType: "VIDEO"
    };

    try {
      const res = await fetch("/api/v1/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/cms/video-news");
      } else {
        const data = await res.json();
        alert("Gagal membuat berita video:\n" + (data.errors?.join("\n") || data.message));
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      pageTitle="Tambah Berita Video"
      pageDescription="Unggah konten video untuk ditampilkan di Homepage."
      contentType="VIDEO"
    />
  );
}
