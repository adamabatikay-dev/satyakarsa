const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.adminAccessLog.findMany();
  console.log(logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
