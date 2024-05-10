const { pool } = require("../config/db.js");

const busStopData = async (req, res) => {
  const cityName = req.query;
  try {
    let query = `SELECT id, city, ST_AsGeoJSON(ST_FlipCoordinates(geom)) FROM enschede.bus_stop`;
    if (Object.keys(cityName).length !== 0) {
      query += ` WHERE city = '${cityName.city}'`;
    } else {
      query += ` WHERE city = 'Enschede' OR city = 'Haaksbergen' OR city = 'Hengelo'`;
    }
    const { rows } = await pool.query(query);
    res.json(rows);

  } catch (err) {
    console.error("Internal Server Error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { busStopData };
