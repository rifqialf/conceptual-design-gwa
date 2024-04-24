import React from "react";
import { Marker } from "react-leaflet";
import PopupComponent from "./PopupInfo.jsx";

function BusStopComponent(data) {
  return (
    <Marker key={data.gid} position={data.st_asgeojson.coordinates}>
      {PopupComponent("Station Name: " + data.station_name)}
    </Marker>
  );
}

export default BusStopComponent;
