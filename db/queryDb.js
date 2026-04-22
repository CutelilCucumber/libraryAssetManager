const { promoteAsset } = require('../controllers/postLibController');
const prisma = require('./prismaClient');

async function getAllAssets() {
  const assets = await prisma.asset.findMany({
    orderBy: { id: 'asc' },
    include: {
      collections: {
        include: {
          collection: true
        }
      }
    }
  });

  return assets.map(asset => ({
    ...asset,
    tags: asset.collections.map(ac => ac.collection.name)
  }));
}

async function getPublicAssets() {
  const assets = await prisma.asset.findMany({
    where: { isPublic: true },
    orderBy: { id: 'asc' },
    include: {
      collections: {
        include: { collection: true }
      }
    }
  });

  return assets.map(asset => ({
    ...asset,
    tags: asset.collections.map(ac => ac.collection.name)
  }));
}

async function getAllCollections() {
  return prisma.collection.findMany();
}

async function getAllConnections() {
  return prisma.assetCollection.findMany();
}

async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id: parseInt(id) },
    include: {
      collections: {
        include: {
          collection: true
        }
      }
    }
  });

  if (!asset) return null;

  return {
    ...asset,
    tags: asset.collections.map(ac => ac.collection.name)
  };
}

async function addAssetWithTags(filePath, fileName, fileType, fileSize, mimeType, tagNames) {
  return prisma.$transaction(async (tx) => {

    const asset = await tx.asset.upsert({
      where: { filePath },
      update: { name: fileName, type: fileType, fileSize, mimeType },
      create: { name: fileName, filePath, type: fileType, fileSize, mimeType }
    });

    // wipe existing tags so new selection replaces entirely
    await tx.assetCollection.deleteMany({
      where: { assetId: asset.id }
    });

    for (const tagName of tagNames) {
      const collection = await tx.collection.upsert({
        where: { name_ownerId: { name: tagName.toLowerCase(), ownerId: null } },
        update: {},
        create: { name: tagName.toLowerCase() }
      });

      await tx.assetCollection.create({
        data: { assetId: asset.id, collectionId: collection.id }
      });
    }

    // remove orphaned collections
    await tx.collection.deleteMany({
      where: { assets: { none: {} } }
    });

    return asset.id;
  });
}

async function deleteAssetById(id) {
  return prisma.$transaction(async (tx) => {
    await tx.asset.delete({
      where: { id: parseInt(id) }
    });

    // remove orphaned collections
    await tx.collection.deleteMany({
      where: { assets: { none: {} } }
    });
  });
}

async function promoteAssetById(id) {
  await prisma.asset.update({
    where: { id: id },
    data: { isPublic: true }
  });
}

module.exports = {
  getAllAssets,
  getPublicAssets,
  getAllCollections,
  getAllConnections,
  getAssetById,
  addAssetWithTags,
  deleteAssetById,
  promoteAssetById
};