const db = require("../db/queryDb");

async function getAllAssets(req, res) {
    const assets = await db.getAllAssets();
    const collections = await db.getAllCollections();
    const connects = await db.getAllConnections();
    res.render("index", { assets: assets, collections: collections, connects : connects });
};

module.exports = {
  getAllAssets
};