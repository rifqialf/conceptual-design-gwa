const buildingWfs = {
  url: "https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
};


async function buildingData() {
  try {
    const { rows } = await pool.query(
      "SELECT gid, building_type, built_year, ST_AsGeoJSON(ST_FlipCoordinates(geom)) FROM enschede.building_4326 WHERE (building_type = 1 AND built_year >= 2000)"
    );
    return { rows };
  } catch (err) {
    console.error("Error executing query", err);
  }
}



export default buildingWfs;