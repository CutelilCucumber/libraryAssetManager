function filterAssets(assets, req) {
  const activeTags = req.query.tags ? [].concat(req.query.tags) : [];
  const currentSearch = (req.query.search || '').toLowerCase().trim();

  let filtered = assets;

  if (activeTags.length > 0) {
    filtered = filtered.filter(asset =>
      activeTags.every(tag => asset.tags.includes(tag))
    );
  }

  if (currentSearch) {
    filtered = filtered.filter(asset =>
      asset.name.toLowerCase().includes(currentSearch)
    );
  }

  return { assets: filtered, activeTags, currentSearch };
}

module.exports = { filterAssets };