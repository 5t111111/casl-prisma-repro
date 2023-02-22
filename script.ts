import { PrismaClient } from "@prisma/client";
import { User, Post } from "@prisma/client";
import { PureAbility, AbilityBuilder, subject } from "@casl/ability";
import { createPrismaAbility, PrismaQuery, Subjects } from "@casl/prisma";

const prisma = new PrismaClient();

async function main() {
  // user alice
  const alice = await prisma.user.findUniqueOrThrow({
    where: { email: "alice@prisma.io" },
  });

  // user bob
  const bob = await prisma.user.findUniqueOrThrow({
    where: { email: "bob@prisma.io" },
  });

  const post1 = await prisma.post.findUniqueOrThrow({
    where: {
      title: "Check out Prisma with Next.js",
    },
  });

  const post2 = await prisma.post.findUniqueOrThrow({
    where: {
      title: "Check out Prisma with Next.js part 2",
    },
  });

  const post3 = await prisma.post.findUniqueOrThrow({
    where: {
      title: "Follow Prisma on Twitter",
    },
  });

  const post4 = await prisma.post.findUniqueOrThrow({
    where: {
      title: "Follow Nexus on Twitter",
    },
  });

  const ability = await buildRules(alice);

  console.log("post1", ability.can("read", subject("Post", post1))); // => `true` as expected
  console.log("post2", ability.can("read", subject("Post", post2))); // => `true` as expected
  console.log("post3", ability.can("read", subject("Post", post3))); // => `true` as expected
  console.log("post4", ability.can("read", subject("Post", post4))); // => `false` as expected

  console.log("alice", ability.can("read", subject("User", alice))); // => `true` as expected
  console.log("bob", ability.can("read", subject("User", bob))); // => `false` as NOT expected

  //----------------------------------------
  // Debugging
  //----------------------------------------
  // Check query result for the same where clause as the rule
  const queryCheck = await prisma.user.findMany({
    where: {
      posts: { some: { published: true } },
    },
  });

  console.log(queryCheck);
  // The above query return the following result (as expected):
  // [
  //   { id: 1, email: 'alice@prisma.io', name: 'Alice' },
  //   { id: 2, email: 'bob@prisma.io', name: 'Bob' }
  // ]

  const post1Rule = ability.relevantRuleFor("read", subject("Post", post1));
  console.log("post1Rule conditions", post1Rule?.conditions);

  const post2Rule = ability.relevantRuleFor("read", subject("Post", post2));
  console.log("post2Rule conditions", post2Rule?.conditions);

  const post3Rule = ability.relevantRuleFor("read", subject("Post", post3));
  console.log("post3Rule conditions", post3Rule?.conditions);

  const post4Rule = ability.relevantRuleFor("read", subject("Post", post4));
  console.log("post4Rule conditions", post4Rule?.conditions);

  const aliceRule = ability.relevantRuleFor("read", subject("User", alice));
  console.log("aliceRule conditions", aliceRule?.conditions);

  const bobRule = ability.relevantRuleFor("read", subject("User", bob));
  console.log("bobRule conditions", bobRule?.conditions);
}

async function buildRules(user: User) {
  type AppAbility = PureAbility<
    [
      string,
      Subjects<{
        User: User;
        Post: Post;
      }>
    ],
    PrismaQuery
  >;
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createPrismaAbility
  );

  // Define rules
  // A user can read their own posts
  can("read", "Post", { authorId: user.id });
  // A user can read all published posts
  can("read", "Post", { published: true });
  // A user cannot read posts that are not published yet
  cannot("read", "Post", {
    AND: [{ NOT: { authorId: user.id } }, { published: false }],
  });

  // A user can read their own profile
  can("read", "User", { id: user.id });
  // A user can read profiles of other users who has at least one published post
  // THIS RULE DOES NOT WORK AS EXPECTED
  can("read", "User", { posts: { some: { published: true } } });

  // // Workaround: THE FOLLOWING RULE WORK
  // const users = await prisma.user.findMany({
  //   where: {
  //     posts: { some: { published: true } },
  //   },
  // });
  // can("read", "User", { id: { in: users.map((u) => u.id) } });

  return build();
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
