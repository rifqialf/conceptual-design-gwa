function geoJsonParserWfs(data) {
  data.geometry = JSON.parse(JSON.stringify(data.geometry));

  return data;
}

module.exports = geoJsonParserWfs;