import React, { useState, useEffect } from "react";
import { MapContainer } from "react-leaflet";
import axios from "axios";

import BuildingComponent from "./Building.jsx";
import BusStopComponent from "./BusStop.jsx";
import TileLayerComponent from "./Tilelayer.jsx";

import geoJsonParser from "../controller/geoJsonParser.js";
import geoJsonParserWfs from "../controller/geoJsonParserWfs.js";
import { convertCRS, flipCoordinates } from "../controller/convertCrs.js";

function MapComponent() {
  const [markers, setMarkers] = useState([]);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    fetchBusStop();
    fetchBuilding();
  }, []);

  const fetchBusStop = async () => {
    try {
      const response = await axios.get("http://localhost:5000/busstop");
      const points = response.data.map(geoJsonParser);
      console.log(points);
      setMarkers(points);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBuilding = async () => {
    try {
      const response = await axios.get(
        "https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=1.1.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag:woonplaats&featureID=woonplaats.e056df53-0d6b-4c6c-90ac-9c54453593aa"
      );
      const reprojected = convertCRS(response.data);
      const flipped = flipCoordinates(reprojected);
      const polygons = flipped.features.map(geoJsonParserWfs);
      console.log(polygons);
      setPolygons(polygons);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <MapContainer
      center={[52.206749, 6.89682]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      {markers.map(BusStopComponent)}
      {polygons.map(BuildingComponent)}
      {TileLayerComponent()}
    </MapContainer>
  );
}

export default MapComponent;
