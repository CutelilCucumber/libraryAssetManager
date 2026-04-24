const fs = require('fs');
const path = require('path');
const db = require('../db');
const pop = require('../db/populateDb');
const { filterAssets } = require('../utils/filterAssets');

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

async function getLibrary(req, res) {
  const rawAssets = await db.getAllAssets();
  const collections = await db.getAllCollections();
  const { assets, activeTags, currentSearch } = filterAssets(rawAssets, req);

  const results = (req.query.inserted !== undefined) ? {
    inserted: parseInt(req.query.inserted),
    skipped: parseInt(req.query.skipped)
  } : null;

  res.render('local', { assets, collections, activeTags, currentSearch, results });
}

async function getAssetForm(req, res) {
  const collections = await db.getAllCollections();
  const asset = req.params.id ? await db.getAssetById(req.params.id) : null;
  res.render('assetForm', { asset, collections, error: null, results: null });
}

async function serveAsset(req, res) {
  const asset = await db.getAssetById(req.params.id);
  if (!asset) return res.status(404).send('Asset not found');
  if (!fs.existsSync(asset.filePath)) return res.status(404).send('File not found on disk');
  res.sendFile(asset.filePath);
}

async function addSingleAsset(req, res) {
  const filePath = path.resolve(req.body.filePath);
  const fileType = req.body.fileType;
  const newTags = req.body.newTags
    ? req.body.newTags.split(' ').map(t => t.trim().toLowerCase()).filter(Boolean)
    : [];
  const existingTags = req.body.existingTags
    ? [].concat(req.body.existingTags).map(t => t.toLowerCase())
    : [];

  if (!fs.existsSync(filePath)) {
    const collections = await db.getAllCollections();
    return res.render('assetForm', { asset: null, collections, error: `File not found: ${filePath}`, results: null });
  }

  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const allTags = [...new Set([...existingTags, ...newTags])];

    await db.addAssetWithTags(filePath, path.basename(filePath), fileType, stats.size, mime, allTags);
    res.redirect(`/local?inserted=1&skipped=0`);
  } catch (err) {
    const collections = await db.getAllCollections();
    res.render('assetForm', { asset: null, collections, error: `Failed to save asset: ${err.message}`, results: null });
  }
}

async function addDirectory(req, res) {
  const { dirPath, fileType } = req.body;

  try {
    const results = await pop.populate(dirPath, fileType);
    res.redirect(`/local?inserted=${results.inserted}&skipped=${results.skipped}`);
  } catch (err) {
    const collections = await db.getAllCollections();
    res.render('assetForm', { asset: null, collections, error: err.message, results: null });
  }
}

async function deleteAsset(req, res) {
  await db.deleteAssetById(req.params.id);
  res.redirect('/local');
}


module.exports = {
  getLibrary,
  getAssetForm,
  serveAsset,
  addSingleAsset,
  addDirectory,
  deleteAsset
};