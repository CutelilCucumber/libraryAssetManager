const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

async function getOrCreateCollection(collectionCache, name) {
  const normalizedName = name.toLowerCase();

  if (collectionCache.has(normalizedName)) {
    return collectionCache.get(normalizedName);
  }

  const collection = await prisma.collection.upsert({
  where: { name: normalizedName },
  update: {},
  create: { name: normalizedName }
});

  collectionCache.set(normalizedName, collection.id);
  return collection.id;
}

async function walk(dir, ancestorNames = [], fileType, collectionCache, results) {
  const folderName = path.basename(dir);
  const currentAncestors = [...ancestorNames, folderName];

  await getOrCreateCollection(collectionCache, folderName);

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, currentAncestors, fileType, collectionCache, results);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!MIME_TYPES[ext]) continue;

    try {
      const stats = fs.statSync(fullPath);
      const absolutePath = path.resolve(fullPath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';

      await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.upsert({
          where: { filePath: absolutePath },
          update: { name: path.basename(fullPath) },
          create: {
            name: path.basename(fullPath),
            filePath: absolutePath,
            type: fileType,
            fileSize: stats.size,
            mimeType: mime
          }
        });

        for (const name of currentAncestors) {
          const collectionId = await getOrCreateCollection(collectionCache, name);
          await tx.assetCollection.upsert({
            where: {
              assetId_collectionId: {
                assetId: asset.id,
                collectionId
              }
            },
            update: {},
            create: { assetId: asset.id, collectionId }
          });
        }
      });

      results.inserted++;
      console.log('Inserted:', fullPath);
    } catch (err) {
      results.skipped++;
      console.error('Skipped:', fullPath, '—', err.message);
    }
  }
}

async function populate(rootDir, fileType) {
  if (!rootDir) throw new Error('No directory path provided');
  if (!fs.existsSync(rootDir)) throw new Error(`Directory not found: ${rootDir}`);

  const collectionCache = new Map();
  const results = { inserted: 0, skipped: 0 };

  await walk(rootDir, [], fileType, collectionCache, results);

  return results;
}

module.exports = { populate };