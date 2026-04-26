import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.article.findUnique({
  where: { slug: "pemilu-regional-2026-antusiasme-pemilih-muda" },
  select: { title: true, ogImageUrl: true, featuredImageId: true }
}).then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
});
