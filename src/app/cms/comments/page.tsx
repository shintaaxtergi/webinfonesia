import { prisma } from "@/lib/db";
import { deleteComment } from "@/app/actions/comment";
import { Trash2 } from "lucide-react";
// import { getServerSession } from "next-auth/next";

export const dynamic = "force-dynamic";

export default async function CommentsManagementPage() {
  // TODO: Integrasikan NextAuth untuk mengecek session dan role
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.role !== "ADMIN") {
  //   return <div className="p-8 text-red-500 font-bold">Akses Ditolak. Halaman ini hanya untuk ADMIN.</div>;
  // }

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      article: { select: { title: true, slug: true } }
    }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderasi Komentar</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola dan awasi komentar pengunjung pada seluruh artikel.</p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700">
          Total Komentar: {comments.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Isi Komentar</th>
                <th className="px-6 py-4 font-semibold">Berita</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                    Belum ada komentar
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-gray-900">{comment.user.fullName}</div>
                      <div className="text-gray-500 text-xs">{comment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <p className="text-gray-700 line-clamp-3">{comment.content}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <a 
                        href={`/read/${comment.article.slug}`} 
                        target="_blank" 
                        className="text-[#e9421e] hover:underline font-medium line-clamp-2"
                      >
                        {comment.article.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 align-top text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <form action={async () => {
                        "use server";
                        await deleteComment(comment.id);
                      }}>
                        <button 
                          type="submit"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Komentar (Hanya Admin)"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
