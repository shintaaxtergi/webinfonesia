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
  const articlesData: any[] = [];
  
  // Base content for procedural generation
  const baseContent = [
    "<p>Perkembangan terbaru menunjukkan tren positif yang patut diapresiasi oleh berbagai pihak terkait.</p><br><p>Dalam konferensi pers hari ini, perwakilan resmi menyatakan bahwa langkah-langkah strategis telah disiapkan untuk menghadapi kuartal mendatang.</p><br><h3>Tantangan dan Peluang</h3><br><p>Meski potensinya besar, masih ada tantangan seperti penyesuaian regulasi dan adaptasi pasar.</p>",
    "<p>Sebuah studi komprehensif baru saja dirilis, menyoroti perubahan signifikan dalam pola perilaku masyarakat.</p><br><p>Data menunjukkan lonjakan partisipasi hingga 30% dibanding periode yang sama tahun lalu.</p>",
    "<p>Kolaborasi antar lembaga diharapkan mampu mempercepat proses pemulihan dan inovasi di sektor ini.</p><br><p>Berbagai program inisiatif akan mulai digulirkan pada bulan depan dengan target pencapaian yang optimis.</p>",
    "<p>Para ahli memberikan tanggapan beragam terkait fenomena terbaru ini. Sebagian optimis, namun ada pula yang menyarankan kehati-hatian.</p><br><p>Pemerintah berjanji akan terus memantau situasi dan memberikan dukungan regulasi yang diperlukan.</p>",
    "<p>Inovasi tiada henti terus ditunjukkan oleh para pelaku industri, memberikan angin segar bagi pertumbuhan ke depan.</p><br><p>Hal ini juga didukung oleh masuknya investasi baru yang memperkuat fundamental sektor terkait.</p>"
  ];

  const baseExcerpts = [
    "Perkembangan terbaru menunjukkan tren positif yang patut diapresiasi oleh berbagai pihak terkait dan menjadi sorotan utama.",
    "Sebuah studi komprehensif baru saja dirilis, menyoroti perubahan signifikan dalam pola perilaku masyarakat modern.",
    "Kolaborasi antar lembaga diharapkan mampu mempercepat proses pemulihan dan inovasi yang berkelanjutan.",
    "Para ahli memberikan tanggapan beragam terkait fenomena terbaru ini, menyarankan langkah-langkah strategis.",
    "Inovasi tiada henti terus ditunjukkan oleh para pelaku industri, memberikan angin segar bagi pertumbuhan ekonomi."
  ];

  const fallBackImages = [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557425955-df376b5903c8?q=80&w=1200&auto=format&fit=crop"
  ];

  // Procedurally generate 5 articles for each category
  for (const cat of categories) {
    const categoryId = createdCategories[cat.slug];
    const tagId = createdTags[tags[Math.floor(Math.random() * tags.length)]];

    for (let i = 1; i <= 5; i++) {
      const isFeatured = i === 1; // Make the first one featured
      
      articlesData.push({
        authorId: Math.random() > 0.5 ? editor.id : writer.id,
        categoryId: categoryId,
        title: `Berita Terkini Seputar ${cat.name} - Bagian ${i}`,
        slug: `berita-terkini-seputar-${cat.slug}-bagian-${i}`,
        excerpt: baseExcerpts[i % 5],
        content: baseContent[i % 5],
        status: "PUBLISHED" as const,
        isFeatured: isFeatured,
        readTime: Math.floor(Math.random() * 5) + 2, // 2 to 6 mins
        publishedAt: new Date(Date.now() - Math.random() * 10000000000), // Random past date
        ogImageUrl: fallBackImages[i % 5],
        tagIds: [tagId],
      });
    }
  }

  for (const articleData of articlesData) {
    const { tagIds, ...data } = articleData;
    await prisma.article.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        tags: {
          create: tagIds.filter(Boolean).map((tagId: string) => ({ tagId })),
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
