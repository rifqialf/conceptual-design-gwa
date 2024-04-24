const reproject = require("reproject");
const proj4 = require("proj4").default;
const { EPSG28992, EPSG4326 } = require("../config/crs.js");

function convertCRS(geojson) {
  // const EPSG28992 = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs"
  // const EPSG4326 = "+proj=longlat +datum=WGS84 +no_defs"

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
