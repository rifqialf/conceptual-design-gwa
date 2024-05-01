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
    "z-index": "-1",
  },
}));

function MapComponent({ selectedCity }) {
  const classes = useStyles();
  const [markers, setMarkers] = useState([]);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    fetchBusStop(selectedCity);
    fetchCity(selectedCity);
  }, [selectedCity]);

  const fetchBusStop = async (cityName) => {
    try {
      let url = "http://localhost:5000/busstop";
      if (cityName) {
        url += `?city=${cityName}`;
      }
      const response = await axios.get(url);
      const points = response.data.map(geoJsonParser);
      console.log(points);
      setMarkers(points);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const fetchCity = async (cityName) => {
    try {
      let url =
        "https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag:woonplaats";
      if (cityName) {
        url += `&FILTER=%3CFilter%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Ewoonplaats%3C/PropertyName%3E%3CLiteral%3E${cityName}%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Filter%3E`;
      } else {
        url += "&FILTER=%3CFilter%3E%3COR%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Ewoonplaats%3C/PropertyName%3E%3CLiteral%3EEnschede%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Ewoonplaats%3C/PropertyName%3E%3CLiteral%3EHengelo%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Ewoonplaats%3C/PropertyName%3E%3CLiteral%3EHaaksbergen%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/OR%3E%3C/Filter%3E";
      }
      const response = await axios.get(url);
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
