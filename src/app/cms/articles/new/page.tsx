"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleForm, { ArticleFormData } from "../_components/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ArticleFormData) => {
    console.log("[CREATE] Starting article creation process", formData);
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
      expiresAt: formData.expiresAt || undefined
    };

    console.log("[CREATE] Prepared payload:", payload);

    try {
      const res = await fetch("/api/v1/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log("[CREATE] Response status:", res.status);

      if (res.ok) {
        console.log("[CREATE] Article successfully created! Redirecting...");
        router.push("/cms/articles");
      } else {
        const data = await res.json();
        console.error("[CREATE] API Error Response:", data);
        alert("Gagal membuat artikel:\n" + (data.errors?.join("\n") || data.message));
      }
    } catch (err) {
      console.error("[CREATE] Fetch Request Failed:", err);
      alert("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      pageTitle="Tulis Artikel Baru"
      pageDescription="Buat konten menarik untuk pembaca Anda."
    />
  );
}
