# Asset Library Manager

A local asset management tool for organising image files with a tag-based 
collection system. Built as a portfolio project using Node.js, Express, 
PostgreSQL, and EJS.

## Features

- Browse and search a local image asset library
- Tag-based filtering with additive AND logic
- Recursive directory import — folder names become tags automatically
- Add single assets with manually assigned tags
- Edit existing assets and their tags
- Delete assets with automatic orphan collection cleanup

## Tech Stack

- **Backend** — Node.js, Express
- **Database** — PostgreSQL (via node-postgres)
- **Templating** — EJS
- **Styling** — CSS with custom UI components

## Prerequisites

- Node.js v18+
- PostgreSQL v14+

## Setup

1. Clone the repository
```bash
   git clone https://github.com/cutelilcucumber/libraryAssetManager.git
   cd libraryAssetManager
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file in the project root
DATABASE_URL=postgresql://user:password@localhost:5432/asset_library
PORT=8000

4. Set up the database
```bash
   psql -U youruser -d asset_library -f db/schema.sql
```

5. Start the server
```bash
   npm start
```

   The app will be available at `http://localhost:8000`.

## Database Schema

Three tables drive the data model:

- `assets` — stores file metadata and the absolute path to each file on disk
- `collections` — stores tag names as a flat namespace
- `asset_collections` — join table linking assets to their tags

## Importing Assets

Navigate to `/form` and use the directory import form. The populate script 
recursively walks the provided directory, registers each folder name as a 
tag, and links every image found to all ancestor folder tags. Re-running 
against the same directory is safe — existing assets are updated rather 
than duplicated.

Supported file types: `.png`, `.jpg`, `.jpeg`, `.webp`

## Usage Notes

This tool is designed to run locally and manages files by their absolute 
path on disk. Assets are served through an Express route rather than the 
static middleware, meaning files can live anywhere on your machine outside 
the project folder.

There is no authentication layer — this is intentional for a local 
single-user tool and should be addressed before any public deployment.

## Project Structure
├── db/
│   ├── pool.js          — database connection pool
│   ├── queryDb.js       — all database query functions
│   ├── populate.js      — recursive directory import script
│   └── schema.sql       — table definitions and indexes
├── controllers/
│   ├── getLibController.js
│   └── postLibController.js
├── routes/
├── views/
│   ├── partials/
│   │   ├── asset.ejs
│   │   ├── error.ejs
│   │   ├── navbar.ejs
│   │   ├── results.ejs
│   │   ├── search.ejs
│   │   └── tag.ejs
│   ├── index.ejs
│   └── form.ejs
├── public/
│   └── styles.css
└── app.js

## License

MIT