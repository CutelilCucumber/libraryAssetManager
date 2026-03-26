const { Pool } = require("pg");

module.exports = new Pool({
  connectionString: "postgresql://gldneye:5367@localhost:5432/asset_manager",
  ssl: {
    rejectUnauthorized: false
  }
});