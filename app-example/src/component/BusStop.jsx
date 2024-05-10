import React from "react";
import { Marker } from "react-leaflet";
import PopupComponent from "./PopupInfo.jsx";

function BusStopComponent(data) {
  return (
    <Marker key={data.id} position={data.st_asgeojson.coordinates}>
      {PopupComponent("Bus Stop City: " + data.city)}
    </Marker>
  );
}

export default BusStopComponent;
