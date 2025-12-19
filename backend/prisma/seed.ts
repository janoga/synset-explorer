import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { parseImageNetXML } from '../src/scripts/parse-xml.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main(): Promise<void> {
  console.log('🌱 Starting database seed via Prisma db seed...\n');

  // Parse XML to get linear synsets
  const synsets = await parseImageNetXML();

  console.log(`\n📦 Seeding ${synsets.length} synsets into database...`);

  console.log('🗑️  Clearing existing synsets...');
  await prisma.synset.deleteMany({});

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < synsets.length; i += BATCH_SIZE) {
    const batch = synsets.slice(i, i + BATCH_SIZE);

    await prisma.synset.createMany({
      data: batch.map((s) => ({
        path: s.path,
        size: s.size,
      })),
    });

    inserted += batch.length;
    console.log(
      `  Inserted ${inserted}/${synsets.length} (${((inserted / synsets.length) * 100).toFixed(1)}%)`
    );
  }

  const count = await prisma.synset.count({ where: { deleted: false } });
  const root = await prisma.synset.findFirst({
    where: { deleted: false },
    orderBy: { path: 'asc' },
  });

  console.log('\n✅ Database seeding complete!');
  console.log(`📊 Total synsets: ${count}`);
  console.log(`📍 Root node: "${root?.path}" (size: ${root?.size})`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
