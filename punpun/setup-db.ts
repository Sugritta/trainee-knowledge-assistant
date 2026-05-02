import { execSync } from 'child_process';
import path from 'path';

const cwd = path.resolve(__dirname);
const prismaCli = path.join(
  cwd,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

function run(cmd: string) {
  execSync(cmd, { cwd, stdio: 'inherit', shell: '/bin/sh' });
}

try {
  console.log('🔄 Generating Prisma Client...');
  run(`"${prismaCli}" generate`);
  console.log('✅ Prisma Client generated successfully');

  console.log('\n🔄 Syncing database schema...');
  run(`"${prismaCli}" db push --force-reset`);
  console.log('✅ Database schema synced successfully');
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('❌ Error:', msg);
  process.exit(1);
}
