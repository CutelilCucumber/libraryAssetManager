const fs = require("fs");
const path = require("path");
const pool = require("./pool");

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function getOrCreateCollection(collectionCache, name) {
  const normalizedName = name.toLowerCase();
  const key = normalizedName;

  if (collectionCache.has(key)) {
    return collectionCache.get(key);
  }

  const result = await pool.query(
    `INSERT INTO collections (name, parent_collection_id)
     VALUES ($1, NULL)
     ON CONFLICT (LOWER(name))
     WHERE parent_collection_id IS NULL
     DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [normalizedName]
  );

  const id = result.rows[0].id;
  collectionCache.set(key, id);
  return id;
}

async function insertAsset(client, filePath, stats, fileType) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const absolutePath = path.resolve(filePath);

  const result = await client.query(
    `INSERT INTO assets (name, file_path, type, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (file_path) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [path.basename(filePath), absolutePath, fileType, stats.size, mime]
  );

  return result.rows[0].id;
}

async function linkToAllParents(client, assetId, collectionId) {
  const visited = new Set();
  let current = collectionId;

  while (current) {
    if (visited.has(current)) {
      console.error("Cycle detected in collections at id:", current);
      break;
    }

    visited.add(current);
    await client.query(
      `INSERT INTO asset_collections (asset_id, collection_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [assetId, current]
    );

    const res = await client.query(
      `SELECT parent_collection_id FROM collections WHERE id = $1`,
      [current]
    );

    current = res.rows[0]?.parent_collection_id ?? null;
  }
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const stats = fs.statSync(fullPath);
      const assetId = await insertAsset(client, fullPath, stats, fileType);

      // link to every ancestor folder as a flat tag
      for (const name of currentAncestors) {
        const collectionId = await getOrCreateCollection(collectionCache, name);
        await client.query(
          `INSERT INTO asset_collections (asset_id, collection_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [assetId, collectionId]
        );
      }

      await client.query("COMMIT");
      results.inserted++;
      console.log("Inserted:", fullPath);
    } catch (err) {
      await client.query("ROLLBACK");
      results.skipped++;
      console.error("Skipped:", fullPath, "—", err.message);
    } finally {
      client.release();
    }
  }
}

async function populate(rootDir, fileType) {
  if (!rootDir) throw new Error("No directory path provided");
  if (!fs.existsSync(rootDir)) throw new Error(`Directory not found: ${rootDir}`);

  const collectionCache = new Map();
  const results = { inserted: 0, skipped: 0 };

  await walk(rootDir, [], fileType, collectionCache, results);

  return results;
}

module.exports = { populate };