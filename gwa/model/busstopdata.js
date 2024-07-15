const { pool } = require("../config/db.js");
let query = "SELECT ST_AsGeoJSON(ST_FlipCoordinates(geometry)),id,city FROM enschede.bus_stop";

      if () {
        query += ` WHERE CityName = '${}'`;
      }
const { rows } = await pool.query(query);