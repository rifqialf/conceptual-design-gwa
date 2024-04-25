import React, { useState, useEffect } from "react";
import { MapContainer } from "react-leaflet";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

import CityComponent from "./City.jsx";
import BusStopComponent from "./BusStop.jsx";
import TileLayerComponent from "./Tilelayer.jsx";

import geoJsonParser from "../controller/geoJsonParser.js";
import geoJsonParserWfs from "../controller/geoJsonParserWfs.js";
import { convertCRS, flipCoordinates } from "../controller/convertCrs.js";

const useStyles = makeStyles(() => ({
  mapContainer: {
    height: "10vh",
    width: "100%",
    position: "absolute",
    "z-index": "-1"
  },
}));

function MapComponent() {
  const classes = useStyles();
  const [markers, setMarkers] = useState([]);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    fetchAllBusStop();
    fetchCity();
  }, []);

  const fetchAllBusStop = async () => {
    try {
      const response = await axios.get("http://localhost:5000/busstop");
      const points = response.data.map(geoJsonParser);
      console.log(points);
      setMarkers(points);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCity = async () => {
    try {
      const response = await axios.get(
        "https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag:woonplaats&FILTER=%3CFilter%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Ewoonplaats%3C/PropertyName%3E%3CLiteral%3EEnschede%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Filter%3E"
        // "https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=1.1.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag:woonplaats&featureID=woonplaats.e056df53-0d6b-4c6c-90ac-9c54453593aa,woonplaats.27fd8d3c-84e7-4fba-8555-75fc722c39ee,woonplaats.8261516e-b316-4b81-a6d8-6127622050e8"
      );
      const reprojected = convertCRS(response.data);
      const flipped = flipCoordinates(reprojected);
      const polygons = flipped.features.map(geoJsonParserWfs);
      // console.log(polygons);
      setPolygons(polygons);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className={classes.mapContainer}>
      <MapContainer
        center={[52.215, 6.82]}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
      >
        {markers.map(BusStopComponent)}
        {polygons.map(CityComponent)}
        {TileLayerComponent()}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
