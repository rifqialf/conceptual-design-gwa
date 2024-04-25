import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts";
import { makeStyles } from "@material-ui/core/styles";

import axios from "axios";
import geoJsonParser from "../controller/geoJsonParser.js";
import { Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  chartContainer: {
    width: "auto",
    height: "auto",
    position: "absolute",
    "background-color": "rgba(255,255,255,0.7)",
    bottom: "10px",
    left: "10px",
    "padding-top": "10px",
    "padding-bottom": "10px",
  },
}));

function PieChartComponent() {
  const classes = useStyles();
  const [chartData, setChartData] = useState([]);
  const [selectedCityData, setSelectedCityData] = useState([]);

  useEffect(() => {
    fetchBusStop();
  }, []);

  const fetchBusStop = async () => {
    try {
      const response = await axios.get("http://localhost:5000/busstop");
      const points = response.data.map(geoJsonParser);

      // Calculate the number of points per city
      if (points && points.length > 0) {
        const cityCounts = {};
        points.forEach((item) => {
          const cityName = item.city;
          if (cityName in cityCounts) {
            cityCounts[cityName] += 1;
          } else {
            cityCounts[cityName] = 1;
          }
        });

        // Prepare chart data with unique city names and counts
        const cityData = Object.keys(cityCounts).map((cityName, index) => ({
          id: index,
          label: cityName,
          value: cityCounts[cityName],
        }));
        setChartData(cityData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function PieOnClick() {
    
    

    setChartData()


  }

  return (
    <div className={classes.chartContainer}>
      <Typography variant="h6" align="center" gutterBottom>
        Bus Stop by City
      </Typography>
      <PieChart
        series={[
          {
            data: chartData,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
          },
        ]}
        width={400}
        height={200}
        onItemClick={(event, d) => set(d)}
      />
    </div>
  );
}
export default PieChartComponent;
