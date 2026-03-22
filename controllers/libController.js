const db = require("../db/queryDb");

async function getAllAssets(req, res) {
    const assets = await db.getAllAssets();
    res.render("index", { table: assets });
};

async function getAllTags(req, res) {
    const tags = await db.getAllTags();
    res.render("index", { table: tags });
};

module.exports = {
  getAllAssets,
  getAllTags,
};