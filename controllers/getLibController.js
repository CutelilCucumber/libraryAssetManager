const fs = require('fs');
const path = require('path');
const db = require('../db/queryDb');
const { error } = require('console');

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

  const results = (req.query.inserted !== undefined) ? {
  inserted: parseInt(req.query.inserted),
  skipped: parseInt(req.query.skipped)
} : null;

  res.render("index", { 
    assets, 
    collections,
    activeTags, 
    currentSearch,
    results});
};

async function newAssetForm(req, res) {
  const collections = await db.getAllCollections();

  res.render("assetForm", { asset: null, collections, error: null, results: null });
};

async function serveAsset(req, res) {
  const asset = await db.getAssetById(req.params.id);

  if (!asset) return res.status(404).send('Asset not found');
  if (!fs.existsSync(asset.file_path)) return res.status(404).send('File not found on disk');

  res.sendFile(asset.file_path);
}

async function editAssetForm(req, res) {
  const asset = await db.getAssetById(req.params.id);
  const collections = await db.getAllCollections();
  
  res.render('form', { asset, collections, error: null, results: null });
}

async function removeAsset(req, res) {
  await db.deleteAssetById(req.params.id);

  res.redirect('/');
}

module.exports = { 
  getAllAssets, 
  newAssetForm, 
  serveAsset,
  editAssetForm,
  removeAsset
};