const defineCrs = require("../config/crs");
const reproject = require("reproject");
const proj4 = require("proj4").default;

function convertCRS(geojson) {
  defineCrs()
  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (geometry && geometry.coordinates) {
      geometry.coordinates = geometry.coordinates.map((polygon) =>
        polygon.map((ring) =>
          ring.map((vertex) => proj4("EPSG:28992", "EPSG:4326", vertex))
        )
      );
    }
  });

  return geojson;
}

function flipCoordinates(geojson) {
  geojson.features.forEach((feature) => {
    feature.geometry = reproject.reverse(feature.geometry);
  });

  return geojson;
}

module.exports = { convertCRS, flipCoordinates };
