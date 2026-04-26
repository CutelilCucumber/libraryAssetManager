# Asset Library Manager

A local asset management tool for organising, tagging, and browsing image
files on disk. Built as a portfolio project using Node.js, Express,
PostgreSQL via Prisma ORM, and EJS templating with Passport.js
authentication.

## Features

- User authentication with register, login, and session persistence
- Role-based access control — Guest, Member, and Admin tiers
- Browse and search a local image asset library
- Tag-based filtering with additive AND logic
- Recursive directory import — folder names become flat tags automatically
- Add and edit single assets with manually assigned tags
- Delete assets with automatic orphan collection cleanup
- Promote local assets to a shared public library
- Assets served directly from disk via Express — files can live anywhere
  on your machine

## Tech Stack

- **Backend** — Node.js, Express
- **Database** — PostgreSQL via Prisma ORM
- **Auth** — Passport.js with passport-local strategy
- **Sessions** — express-session with prisma-session-store
- **Templating** — EJS
- **Validation** — express-validator
- **Styling** — CSS with custom tag UI components

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
SECRET=your_session_secret
PORT=8000

4. Run Prisma migrations

```bash
   npx prisma migrate dev
```

5. Start the server

```bash
   npm start
```

   The app will be available at `http://localhost:8000`.

## Access Tiers

| Feature | Guest | Member | Admin |
|---|---|---|---|
| Browse local library | ✓ | ✓ | ✓ |
| Directory import | ✓ | ✓ | ✓ |
| Browse public library | ✗ | ✓ | ✓ |
| Promote to public | ✗ | ✓ | ✓ |
| Delete any asset | ✗ | ✗ | ✓ |

## Importing Assets

Navigate to `/local/import` and use the directory import form.
The populate script recursively walks the provided directory, registers
each folder name as a flat tag, and links every image to all ancestor
folder tags. Re-running against the same directory is safe — existing
assets are updated rather than duplicated.

Supported file types: `.png`, `.jpg`, `.jpeg`, `.webp`

## Project Structure

```
├── controllers/
│   ├── localController.js   — local library CRUD and import
│   └── publicController.js  — public library and promotion
├── db/
│   ├── index.js             — barrel file
│   ├── populateDb.js        — recursive directory import
│   ├── prismaClient.js      — Prisma client instance
│   ├── queryDb.js           — asset and collection queries
│   └── queryUserDb.js       — user queries
├── lib/
│   └── passwordUtils.js     — PBKDF2 hash and verify
├── middleware/
│   ├── authMiddleware.js    — isAuth, isMember, isAdmin
│   ├── index.js             — barrel file
│   └── registerValidation.js
├── prisma/
│   └── schema.prisma
├── public/
│   └── styles.css
├── routes/
│   ├── localRouter.js
│   ├── publicRouter.js
│   └── userRouter.js
├── utils/
│   └── filterAssets.js      — shared tag and search filtering
├── views/
│   ├── partials/
│   │   ├── asset.ejs
│   │   ├── error.ejs
│   │   ├── navbar.ejs
│   │   ├── results.ejs
│   │   ├── search.ejs
│   │   └── tag.ejs
│   ├── assetForm.ejs
│   ├── local.ejs
│   ├── public.ejs
│   └── welcome.ejs
└── app.js
```

## Security Notes

- Passwords hashed with PBKDF2 and a random salt via Node's built-in
  `crypto` module
- Sessions stored in PostgreSQL via prisma-session-store
- All registration input validated and sanitized with express-validator
- Directory import and filepath access gated behind admin role

## License

MIT