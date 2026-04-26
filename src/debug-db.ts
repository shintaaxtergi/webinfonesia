import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debug() {
  console.log("Checking DB...");
  const articles = await prisma.article.findMany({
    include: {
      author: true,
      category: true
    }
  });
  console.log(`Found ${articles.length} articles`);
  articles.forEach(a => {
    console.log(`- ${a.title} (Status: ${a.status}, Author: ${a.author?.fullName}, Category: ${a.category?.name})`);
  });
  process.exit(0);
}

debug().catch(e => {
  console.error(e);
  process.exit(1);
});
