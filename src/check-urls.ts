import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUrls() {
  const articles = await prisma.article.findMany({
    include: { featuredImage: true }
  });
  
  console.log("Current Database State:");
  articles.forEach(a => {
    console.log(`Article: ${a.title}`);
    console.log(`- Image URL: ${a.featuredImage?.url || "NULL"}`);
  });
  process.exit(0);
}

checkUrls().catch(console.error);
