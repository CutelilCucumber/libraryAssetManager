const fs = require('fs');
const db = require('../db');
const { filterAssets } = require('../utils/filterAssets');

async function getLibrary(req, res) {
  const collections = await db.getAllCollections();
  const rawAssets = await db.getPublicAssets();
  const { assets, activeTags, currentSearch } = filterAssets(rawAssets, req);

  const results = (req.query.inserted !== undefined) ? {
    inserted: parseInt(req.query.inserted),
    skipped: parseInt(req.query.skipped)
  } : null;

  res.render('public', { assets, collections, activeTags, currentSearch, results });
}

async function serveAsset(req, res) {
  const asset = await db.getAssetById(req.params.id);
  if (!asset) return res.status(404).send('Asset not found');
  if (!fs.existsSync(asset.filePath)) return res.status(404).send('File not found on disk');
  res.sendFile(asset.filePath);
}

async function promoteAsset(req, res) {
  try {
    await db.promoteAssetById(parseInt(req.params.id));
    res.redirect('/public?inserted=1&skipped=0');
  } catch (err) {
    res.redirect(`/local?error=${encodeURIComponent(err.message)}`);
  }
}

async function removeFromPublic(req, res) {
  try {
    await db.unpromoteAssetById(parseInt(req.params.id));
    res.redirect('/public');
  } catch (err) {
    res.redirect(`/public?error=${encodeURIComponent(err.message)}`);
  }
}

async function deleteAsset(req, res) {
  await db.deleteAssetById(req.params.id);
  res.redirect('/public');
}

module.exports = {
  getLibrary,
  serveAsset,
  promoteAsset,
  removeFromPublic,
  deleteAsset
};