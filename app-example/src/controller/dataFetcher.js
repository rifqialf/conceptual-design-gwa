const { busStopData } = require("../model/data");

async function getBusstopData(req, res) {
  const city = req.query;
  try {
    let query = `SELECT id, city, ST_AsGeoJSON(ST_FlipCoordinates(geom)) FROM enschede.bus_stop`;

    if (Object.keys(city).length !== 0) {
      query += ` WHERE city = '${city.city}'`;
    } else {
      query += ` WHERE city = 'Enschede' OR city = 'Haaksbergen' OR city = 'Hengelo'`;
    }

    const { rows } = await busStopData(query);
    res.json(rows);

  } catch (err) {
    console.error("Internal Server Error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getBusstopData };
