import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const john = await prisma.users.upsert({
    where: { email: 'john@gmail.com' },
    update: {},
    create: {
      email: 'john@gmail.com',
      country: 'England',
      postalCode: '24312',
      street: 'Road Avenue',
      role: 'guest',
    },
  });

  await prisma.wallets.create({
    data: {
      balance: 0,
      userId: john.id,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
