const fs = require('fs');
const path = require('path');
const db = require('../db/queryDb');

async function getAllAssets(req, res) {
  const rawAssets = await db.getAllAssets();
  const collections = await db.getAllCollections();

  const activeTags = req.query.tags
    ? [].concat(req.query.tags)
    : [];
  const currentSearch = (req.query.search || '').toLowerCase().trim();

  let assets = rawAssets;

  if (activeTags.length > 0) {
    assets = assets.filter(asset =>
      activeTags.every(tag => asset.tags.includes(tag))
    );
  }

  if (currentSearch) {
    assets = assets.filter(asset =>
      asset.name.toLowerCase().includes(currentSearch)
    );
  }

  res.render("index", { 
    assets, 
    collections,
    activeTags, 
    currentSearch });
};

async function getAllTags(req, res) {
  const collections = await db.getAllCollections();

  res.render("form", { 
    collections });
};

async function serveAsset(req, res) {
  const asset = await db.getAssetById(req.params.id);

  if (!asset) return res.status(404).send('Asset not found');
  if (!fs.existsSync(asset.file_path)) return res.status(404).send('File not found on disk');

  res.sendFile(asset.file_path);
}

module.exports = { getAllAssets, getAllTags, serveAsset };