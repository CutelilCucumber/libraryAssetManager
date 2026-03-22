const { Pool } = require("pg");
//add this in prod
// require('dotenv').config();

module.exports = new Pool({
  connectionString: "postgresql://gldneye:5367@localhost:5432/asset_manager",
  ssl: {
    rejectUnauthorized: false
  }
});