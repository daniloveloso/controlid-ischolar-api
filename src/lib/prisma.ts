import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
  log: ["error", "warn"],
});

export { prismaClient as prisma };



