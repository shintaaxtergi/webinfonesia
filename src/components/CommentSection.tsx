"use client";

import { useState } from "react";
import { addComment } from "@/app/actions/comment";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

interface User {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
  // userId prop is no longer needed but kept for backward compatibility if passed
  userId?: string; 
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const activeUserId = session?.user?.id as string | undefined;

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId) return;
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await addComment(articleId, activeUserId, content);
    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      setContent("");
      if (result.comment) {
        router.refresh(); 
      }
    }
  };

  function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
  }

  return (
    <div className="mt-12 pt-10 border-t border-gray-200">
      <h3 className="text-2xl font-display font-bold text-ink mb-6">
        {initialComments.length} Komentar
      </h3>

      {/* Input Area */}
      <div className="mb-10">
        {status !== "authenticated" ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-4">Silakan login untuk memberikan komentar</p>
            <button 
              onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
              className="inline-block px-6 py-2 bg-[#e9421e] text-white font-bold rounded-full hover:bg-red-700 transition-colors"
            >
              Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e9421e] focus:border-transparent resize-none"
              rows={4}
              placeholder="Tulis komentar Anda di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting || !content.trim()}
                className="px-6 py-2 bg-[#e9421e] text-white font-bold rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {initialComments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center font-bold text-gray-500">
              {comment.user.avatarUrl ? (
                <img src={comment.user.avatarUrl} alt={comment.user.fullName} className="w-full h-full object-cover" />
              ) : (
                comment.user.fullName.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-ink">{comment.user.fullName}</span>
                <span className="text-gray-400 text-xs">• {timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {initialComments.length === 0 && (
          <p className="text-gray-500 italic text-center py-4">Jadilah yang pertama mengomentari berita ini.</p>
        )}
      </div>
    </div>
  );
}
