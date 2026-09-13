const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.adminUser.count();
  
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    
    console.log('Seeded default admin user (admin / admin123)');
  } else {
    console.log('Admin user already exists, skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
