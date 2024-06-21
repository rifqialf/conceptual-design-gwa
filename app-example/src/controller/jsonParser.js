function geoJsonParser(data) {
  data.st_asgeojson = JSON.parse(data.st_asgeojson);

  return data;
}

module.exports = geoJsonParser;