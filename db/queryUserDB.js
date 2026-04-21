const pool = require('./pool');

async function getUserByUsername(username) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createUser(username, firstname, lastname, member, admin, hash, salt) {
  const { rows } = await pool.query(
    `INSERT INTO users 
    (username, firstname, lastname, member, admin, hash, salt) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id`,
    [username, firstname, lastname, member, admin, hash, salt]
  );
  return rows[0].id;
}

async function addMembership(id) {
  await pool.query(
    'UPDATE users SET member = $1 WHERE id = $2',
    [true, id]
  );
}

async function addAdmin(id) {
  await pool.query(
    'UPDATE users SET admin = $1 WHERE id = $2',
    [true, id]
  );
}

module.exports = {
    getUserByUsername,
    getUserById,
    createUser,
    addMembership,
    addAdmin
}