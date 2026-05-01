import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('DATABASE_URL=', process.env.DATABASE_URL);
    const users = await prisma.user.findMany({ take: 1 });
    console.log('OK - users:', users);
  } catch (err) {
    console.error('Prisma test error:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
