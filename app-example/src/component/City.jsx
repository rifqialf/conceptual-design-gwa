import React from "react";
import { Polygon } from "react-leaflet";
import PopupComponent from "./PopupInfo.jsx";

function CityComponent(data) {
  return (
    <Polygon
      pathOptions={{ color: "gray" }}
      positions={data.geometry.coordinates}
    >
    {PopupComponent("City Name: " + data.properties.woonplaats)}
    </Polygon>
  );
}

export default CityComponent;
