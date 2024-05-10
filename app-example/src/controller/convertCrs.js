const reproject = require("reproject");
const proj4 = require("proj4").default;
const { EPSG28992, EPSG4326 } = require("../config/crs.js");

function convertCRS(geojson) {
  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (geometry && geometry.coordinates) {
      geometry.coordinates = geometry.coordinates.map((polygon) =>
        polygon.map((ring) =>
          ring.map((vertex) => proj4(EPSG28992, EPSG4326, vertex))
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
