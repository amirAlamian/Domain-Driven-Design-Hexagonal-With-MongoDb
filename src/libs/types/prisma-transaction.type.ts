import { Prisma, PrismaClient } from '@prisma/client';

export type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
