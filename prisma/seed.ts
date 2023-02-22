import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      email: "alice@prisma.io",
      name: "Alice",
      posts: {
        create: [
          {
            title: "Check out Prisma with Next.js",
            content: "https://www.prisma.io/nextjs",
            published: true,
          },
          {
            title: "Check out Prisma with Next.js part 2",
            content: "https://www.prisma.io/nextjs2",
            published: false,
          },
        ],
      },
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      email: "bob@prisma.io",
      name: "Bob",
      posts: {
        create: [
          {
            title: "Follow Prisma on Twitter",
            content: "https://twitter.com/prisma",
            published: true,
          },
          {
            title: "Follow Nexus on Twitter",
            content: "https://twitter.com/nexusgql",
            published: false,
          },
        ],
      },
    },
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
