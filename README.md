# Minimal reproducible example for CASL Prisma relation condition issue

This is a minimal reproducible example for the issue of defining conditions on relation.

## Setup

Install deps and generate prisma client:

```bash
npm install
```

Run the migration:

```bash
npx prisma migrate dev
```

Seed the data:

```bash
npx prisma db seed
```

## Reproduce

Run the script:

```bash
npx ts-node script.ts
```
