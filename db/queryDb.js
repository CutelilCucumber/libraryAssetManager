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
  const { rows } = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = {
  getAllAssets,
  getAllCollections,
  getAllConnections,
  getAssetById
};