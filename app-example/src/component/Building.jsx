import React from "react";
import { Polygon } from "react-leaflet";
import PopupComponent from "./PopupInfo.jsx";

function BuildingComponent(data) {
  return (
    <Polygon
      key={data.gid}
      pathOptions={{ color: "purple" }}
      positions={data.geometry.coordinates}
    >
      {PopupComponent("Built Year: " + data.built_year + "\nClosest Station: ")}
    </Polygon>
  );
}

export default BuildingComponent;
