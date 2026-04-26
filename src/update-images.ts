import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateImages() {
  console.log("Updating article images...");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("Admin user not found!");
    process.exit(1);
  }

  const images = [
    { 
      slug: "ai", 
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
      alt: "Artificial Intelligence" 
    },
    { 
      slug: "pemilu", 
      url: "https://images.unsplash.com/photo-1540910419892-f0c732c32de6?auto=format&fit=crop&q=80&w=1000",
      alt: "Politics" 
    },
    { 
      slug: "ihsg", 
      url: "https://images.unsplash.com/photo-1611974714024-46379fce4620?auto=format&fit=crop&q=80&w=1000",
      alt: "Stock Market" 
    },
  ];

  for (const img of images) {
    const article = await prisma.article.findFirst({ 
      where: { 
        OR: [
          { slug: img.slug },
          { title: { contains: img.slug.split("-")[0], mode: "insensitive" } }
        ]
      } 
    });

    if (article) {
      const media = await prisma.media.create({
        data: {
          uploaderId: admin.id,
          filename: `featured-${article.slug}.jpg`,
          url: img.url,
          fileType: "image/jpeg",
          size: 1024,
          altText: img.alt
        }
      });

      await prisma.article.update({
        where: { id: article.id },
        data: { featuredImageId: media.id }
      });
      console.log(`Updated image for: ${article.title}`);
    } else {
      console.warn(`Could not find article for: ${img.slug}`);
    }
  }

  console.log("Done!");
  process.exit(0);
}

updateImages().catch(e => {
  console.error(e);
  process.exit(1);
});
