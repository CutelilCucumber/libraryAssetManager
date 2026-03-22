const pool = require("./pool");
//add sql search function

async function getAllAssets() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          array_agg(c.name) FILTER (WHERE c.name IS NOT NULL),
          '{}'
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
}

async function getAllTags() {
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

//user will be required to upload a file or point to existing url
//later make size input
// async function insertAsset(username, message) { 
//   await pool.query("INSERT INTO logs (username, message) VALUES ($1, $2)",
//   [username, message]);
// };

module.exports = {
  getAllAssets,
  getAllTags
};