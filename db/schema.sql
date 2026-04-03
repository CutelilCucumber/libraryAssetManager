CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  parent_collection_id INT REFERENCES collections(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS collections_name_lower_no_parent_unique
ON collections (LOWER(name))
WHERE parent_collection_id IS NULL;

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  type VARCHAR(100),
  file_size INT,
  mime_type VARCHAR(100),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE assets ADD CONSTRAINT assets_file_path_unique UNIQUE (file_path);

CREATE TABLE IF NOT EXISTS asset_collections (
  asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
  collection_id INT REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, collection_id)
);