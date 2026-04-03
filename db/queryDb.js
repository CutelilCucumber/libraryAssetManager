const pool = require("./pool");
//add sql search function

async function getAllAssets() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          JSON_AGG(c.name) FILTER (WHERE c.name IS NOT NULL),
          '[]'::json
        ) AS tags
      FROM assets a
      LEFT JOIN asset_collections ac ON a.id = ac.asset_id
      LEFT JOIN collections c ON ac.collection_id = c.id
      GROUP BY a.id
      ORDER BY a.id;
    `);

    return rows;
  } catch (err) {
    if (err.code === "42P01") {
      return [];
    }
    throw err;
  }
};

async function getAllCollections() {
  try {
    const { rows } = await pool.query("SELECT * FROM collections");
    return rows;
  } catch (err) {
    if (err.code === "42P01") {
      return [];
    }
    throw err;
  }
};

async function getAllConnections() {
  try {
    const { rows } = await pool.query("SELECT * FROM asset_collections");
    return rows;
  } catch (err) {
    if (err.code === "42P01") {
      return [];
    }
    throw err;
  }
};

async function getAssetById(id) {
  const { rows } = await pool.query(`
    SELECT 
      a.*,
      COALESCE(
        json_agg(c.name) FILTER (WHERE c.name IS NOT NULL),
        '[]'::json
      ) AS tags
    FROM assets a
    LEFT JOIN asset_collections ac ON a.id = ac.asset_id
    LEFT JOIN collections c ON ac.collection_id = c.id
    WHERE a.id = $1
    GROUP BY a.id
  `, [id]);

  return rows[0] || null;
}

async function addAssetWithTags(filePath, fileName, fileType, fileSize, mimeType, tagNames) {
  
  //execute transaction with client.query, not pool.query
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const assetResult = await client.query(
      `INSERT INTO assets (name, file_path, type, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (file_path) DO UPDATE SET 
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        file_size = EXCLUDED.file_size,
        mime_type = EXCLUDED.mime_type
       RETURNING id`,
      [fileName, filePath, fileType, fileSize, mimeType]
    );

    const assetId = assetResult.rows[0].id;

    // wipe existing tags so the new selection replaces
    await client.query(
      'DELETE FROM asset_collections WHERE asset_id = $1',
      [assetId]
    );

    for (const tagName of tagNames) {
  const collectionResult = await client.query(
    `INSERT INTO collections (name, parent_collection_id)
     VALUES ($1, NULL)
     ON CONFLICT (LOWER(name))
     WHERE parent_collection_id IS NULL
     DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [tagName.toLowerCase()]
  );

  const collectionId = collectionResult.rows[0].id;

  await client.query(
    `INSERT INTO asset_collections (asset_id, collection_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [assetId, collectionId]
  );
}

  await client.query(`
    DELETE FROM collections
    WHERE id NOT IN (
      SELECT DISTINCT collection_id FROM asset_collections
    )
  `);

    await client.query('COMMIT');
    return assetId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteAssetById(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM assets WHERE id = $1', [id]);

    // remove any collections that no longer have any assets linked
    await client.query(`
      DELETE FROM collections
      WHERE id NOT IN (
        SELECT DISTINCT collection_id FROM asset_collections
      )
    `);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllAssets,
  getAllCollections,
  getAllConnections,
  getAssetById,
  addAssetWithTags,
  deleteAssetById
};