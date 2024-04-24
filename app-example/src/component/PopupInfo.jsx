import React from "react";
import { Popup } from "react-leaflet";

function PopupComponent(info) {
  return <Popup>{info}</Popup>;
}

export default PopupComponent;