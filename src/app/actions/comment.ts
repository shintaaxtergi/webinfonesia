"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addComment(articleId: string, userId: string, content: string) {
  if (!content.trim()) return { error: "Komentar tidak boleh kosong" };

  try {
    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId,
        content,
        status: "APPROVED", // Auto-approve for now
      },
    });

    revalidatePath(`/`); // Revalidate all to be safe, ideally we revalidate the specific article path
    return { success: true, comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "Gagal menambahkan komentar" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    await prisma.comment.delete({
      where: { id: commentId }
    });
    revalidatePath('/cms/comments');
    revalidatePath('/'); // Revalidate public pages
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "Gagal menghapus komentar" };
  }
}
