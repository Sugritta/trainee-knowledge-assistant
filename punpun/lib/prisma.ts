import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Use a global variable so that in development the PrismaClient is not
// re-created on every file change which can lead to exhausting database
// connections.
export const prisma: PrismaClient =
  global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;