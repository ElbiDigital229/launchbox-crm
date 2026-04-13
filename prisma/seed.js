import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@launchboxpk.com' },
  });

  if (existing) {
    console.log('Admin account already exists, skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@launchboxpk.com',
      password: hashedPassword,
      is_admin: true,
    },
  });

  console.log('Default admin account created:');
  console.log('  Email: admin@launchboxpk.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
