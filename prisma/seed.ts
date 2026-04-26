import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Seed Admin User ---
  const adminHash = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@infonesia.id" },
    update: {},
    create: {
      username: "admin",
      email: "admin@infonesia.id",
      passwordHash: adminHash,
      fullName: "Admin InfoNesia",
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // --- Seed Editor ---
  const editorHash = await bcrypt.hash("Editor@1234", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@infonesia.id" },
    update: {},
    create: {
      username: "sari_dewi",
      email: "editor@infonesia.id",
      passwordHash: editorHash,
      fullName: "Sari Dewi",
      role: "EDITOR",
      isVerified: true,
      bio: "Jurnalis senior dengan 10 tahun pengalaman di industri media.",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    },
  });
  console.log("✅ Editor user created:", editor.email);

  // --- Seed Writer ---
  const writerHash = await bcrypt.hash("Writer@1234", 12);
  const writer = await prisma.user.upsert({
    where: { email: "writer@infonesia.id" },
    update: {},
    create: {
      username: "rizky_pratama",
      email: "writer@infonesia.id",
      passwordHash: writerHash,
      fullName: "Rizky Pratama",
      role: "WRITER",
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
    },
  });
  console.log("✅ Writer user created:", writer.email);

  // --- Seed Categories ---
  const categories = [
    { name: "Politik", slug: "politik", color: "#C0392B", sortOrder: 1 },
    { name: "Ekonomi", slug: "ekonomi", color: "#1a3a5c", sortOrder: 2 },
    { name: "Teknologi", slug: "teknologi", color: "#1e6b3e", sortOrder: 3 },
    { name: "Olahraga", slug: "olahraga", color: "#c9a84c", sortOrder: 4 },
    { name: "Hiburan", slug: "hiburan", color: "#4a1f7c", sortOrder: 5 },
    { name: "Kesehatan", slug: "kesehatan", color: "#c45c00", sortOrder: 6 },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = c.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // --- Seed Tags ---
  const tags = ["Pemerintahan", "Ekonomi Digital", "AI", "Sepak Bola", "Pasar Modal", "Startup"];
  const createdTags: Record<string, string> = {};
  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, "-");
    const t = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    });
    createdTags[tagName] = t.id;
  }
  console.log("✅ Tags seeded");

  // --- Seed Articles ---
  const articlesData = [
    {
      authorId: editor.id,
      categoryId: createdCategories["teknologi"],
      title: "Inovasi Teknologi AI Mengubah Lanskap Bisnis di Indonesia",
      slug: "inovasi-teknologi-ai-mengubah-lanskap-bisnis-di-indonesia",
      excerpt: "Adopsi kecerdasan buatan di perusahaan-perusahaan Indonesia meningkat tajam. Efisiensi operasional dan inovasi produk menjadi pendorong utama transformasi ini.",
      content: "<p>Jakarta, InfoNesia - Perkembangan teknologi kecerdasan buatan (AI) kini semakin tidak terbendung. Di Indonesia, berbagai perusahaan mulai dari startup hingga korporasi besar mulai mengadopsi AI untuk meningkatkan efisiensi dan daya saing mereka.</p><br><p>Menurut laporan terbaru dari Asosiasi Tech Indonesia, tingkat adopsi AI di sektor bisnis meningkat hingga 45% dalam setahun terakhir.</p><br><h3>Tantangan dan Peluang</h3><br><p>Meski potensinya besar, masih ada tantangan seperti minimnya talenta digital yang mumpuni di bidang AI dan kekhawatiran terkait privasi data.</p>",
      status: "PUBLISHED" as const,
      isFeatured: true,
      readTime: 4,
      publishedAt: new Date("2026-04-19T08:30:00Z"),
      tagIds: [createdTags["AI"]],
    },
    {
      authorId: editor.id,
      categoryId: createdCategories["politik"],
      title: "Pemilu Regional 2026: Antusiasme Pemilih Muda Meningkat Signifikan",
      slug: "pemilu-regional-2026-antusiasme-pemilih-muda",
      excerpt: "Generasi Z mendominasi demografi pemilih pada pemilu serentak tahun ini. Kampanye digital menjadi kunci para kandidat.",
      content: "<p>Surabaya, InfoNesia - Pemilihan kepala daerah serentak 2026 menunjukkan tren baru yang menarik: tingginya tingkat partisipasi pemilih pemula dan pemuda.</p><br><p>Para pengamat politik menilai bahwa isu-isu seperti lapangan kerja, pendidikan, dan lingkungan hidup menjadi perhatian utama para pemilih muda ini.</p>",
      status: "PUBLISHED" as const,
      isFeatured: false,
      readTime: 3,
      publishedAt: new Date("2026-04-18T14:15:00Z"),
      tagIds: [createdTags["Pemerintahan"]],
    },
    {
      authorId: writer.id,
      categoryId: createdCategories["olahraga"],
      title: "Timnas Garuda Bersiap Menghadapi Kualifikasi Piala Dunia",
      slug: "timnas-garuda-persiapan-kualifikasi-piala-dunia",
      excerpt: "Pelatih kepala optimis dengan kondisi fisik para pemain setelah pemusatan latihan intensif di Eropa.",
      content: "<p>Jakarta, InfoNesia - Skuad Tim Nasional Indonesia telah kembali ke tanah air setelah menjalani pemusatan latihan selama tiga minggu di Eropa.</p><br><p>Pertandingan kualifikasi terdekat akan dilangsungkan di Stadion Utama Gelora Bung Karno.</p>",
      status: "PUBLISHED" as const,
      isFeatured: false,
      readTime: 2,
      publishedAt: new Date("2026-04-20T09:00:00Z"),
      tagIds: [createdTags["Sepak Bola"]],
    },
    {
      authorId: editor.id,
      categoryId: createdCategories["ekonomi"],
      title: "IHSG Ditutup Menguat Seiring Masuknya Aliran Modal Asing",
      slug: "ihsg-ditutup-menguat-aliran-modal-asing",
      excerpt: "Sektor perbankan dan infrastruktur memimpin penguatan indeks harga saham gabungan pada penutupan sesi perdagangan.",
      content: "<p>Jakarta, InfoNesia - Indeks Harga Saham Gabungan (IHSG) Bursa Efek Indonesia (BEI) ditutup menguat signifikan menyusul rilis data pertumbuhan ekonomi kuartal pertama yang melebihi ekspektasi pasar.</p><br><p>Investor asing mencatatkan pembelian bersih yang cukup besar, menunjukkan kepercayaan yang tinggi terhadap stabilitas ekonomi makro Indonesia.</p>",
      status: "PUBLISHED" as const,
      isFeatured: false,
      readTime: 3,
      publishedAt: new Date("2026-04-17T16:45:00Z"),
      tagIds: [createdTags["Pasar Modal"]],
    },
  ];

  for (const articleData of articlesData) {
    const { tagIds, ...data } = articleData;
    await prisma.article.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        tags: {
          create: tagIds.filter(Boolean).map((tagId) => ({ tagId })),
        },
      },
    });
    console.log(`✅ Article: ${data.title.substring(0, 50)}...`);
  }

  // --- Seed Site Settings ---
  await prisma.siteSetting.upsert({
    where: { key: "site_name" },
    update: {},
    create: { key: "site_name", value: "InfoNesia", description: "Nama website" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "site_description" },
    update: {},
    create: { key: "site_description", value: "Portal Berita Digital Indonesia", description: "Deskripsi website" },
  });

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun untuk testing:");
  console.log("  Admin  : admin@infonesia.id   | Admin@1234");
  console.log("  Editor : editor@infonesia.id  | Editor@1234");
  console.log("  Writer : writer@infonesia.id  | Writer@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
