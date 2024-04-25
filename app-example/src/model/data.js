const { pool } = require("../config/db.js");

async function busStopData(query) {
  try {
    const { rows } = await pool.query(query);
    return { rows };
  } catch (err) {
    console.error("Error executing query", err);
  }
}

module.exports = { busStopData };
