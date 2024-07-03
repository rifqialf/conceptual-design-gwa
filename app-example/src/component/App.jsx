import React, { useState } from "react";
import MapComponent from "./Map";
import PieChartComponent from "./PieChart";

function App() {
  const [selectedCity, setSelectedCity] = useState(null);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
  };

  return (
    <div className="App">
      <MapComponent selectedCity={selectedCity} />
      <PieChartComponent onCityClick={handleCitySelect} />
    </div>
  );
}

export default App;
