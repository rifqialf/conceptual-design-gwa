const { pool } = require("../config/db.js");

async function busstopData() {
  try {
    const { rows } = await pool.query(
      "SELECT gid, station_name, ST_AsGeoJSON(ST_FlipCoordinates(geom)) FROM enschede.busstop"
    );
    return { rows }; 
  } catch (err) {
    console.error("Error executing query", err);
  }
}

module.exports = { busstopData };
