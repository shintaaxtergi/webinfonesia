const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus kategori Foto dan Cek Fakta dari database...");
  
  const result = await prisma.category.deleteMany({
    where: {
      name: {
        in: ["Foto", "Cek Fakta"]
      }
    }
  });
  
  console.log(`Berhasil menghapus ${result.count} kategori.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
