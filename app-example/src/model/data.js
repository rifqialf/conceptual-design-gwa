const { pool } = require("../config/db.js");

async function busstopData() {
  try {
    const { rows } = await pool.query(
      "SELECT id, city, ST_AsGeoJSON(ST_FlipCoordinates(geom)) FROM enschede.bus_stop WHERE city = 'Enschede' OR city = 'Hengelo' OR city = 'Haaksbergen'"
    );
    return { rows }; 
  } catch (err) {
    console.error("Error executing query", err);
  }
}

module.exports = { busstopData };
