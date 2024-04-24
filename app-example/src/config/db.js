const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDB_NAME,
  password: process.env.PGPASSWD,
  port: process.env.PGPORT,
});

module.exports = { pool };
