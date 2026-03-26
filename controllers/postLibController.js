const fs = require('fs');
const path = require('path');
const db = require('../db/queryDb');
const pop = require('../db/populateDb.js')
const getController = require('./getLibController.js')

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

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
    return res.render('form', { collections, error: `File not found: ${filePath}` });
  }

  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const allTags = [...new Set([...existingTags, ...newTags])];

    await db.addAssetWithTags(
      filePath,
      path.basename(filePath),
      fileType,
      stats.size,
      mime,
      allTags
    );

    res.redirect(`/?inserted=1&skipped=0`);
  } catch (err) {
    const collections = await db.getAllCollections();
    res.render('form', { collections, error: `Failed to save asset: ${err.message}` });
  }
}

async function addDirectory(req, res) {
    const dirPath = req.body.dirPath;
    const fileType = req.body.fileType;

  try {
    const results = await pop.populate(dirPath, fileType);
    res.redirect(`/?inserted=${results.inserted}&skipped=${results.skipped}`);
  } catch (err) {
    const collections = await db.getAllCollections();
    res.render('form', { collections, error: err.message });
  }
}

module.exports = { 
  addSingleAsset,
  addDirectory
};