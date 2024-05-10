import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts";
import { makeStyles } from "@material-ui/core/styles";

import axios from "axios";
import geoJsonParser from "../controller/geoJsonParser.js";

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

const useStyles = makeStyles(() => ({
  chartContainer: {
    width: "auto",
    height: "auto",
    position: "absolute",
    "background-color": "rgba(255,255,255,0.7)",
    bottom: "10px",
    left: "10px",
    "padding-top": "10px",
    "padding-bottom": "10px",
    "border-radius": "25px",
  },
}));

function PieChartComponent({ onCityClick }) {
  const classes = useStyles();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    generateBusStopChartData();
  });

  const generateBusStopChartData = async () => {
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
  
  const handleItemClick = (event, data) => {
    const selectedCity = chartData[data.dataIndex].label;
    onCityClick(selectedCity);
  };

  const resetClick = (event, data) => {
    onCityClick(null);
  };

  return (
    <div className={classes.chartContainer}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Bus Stop by City
        </Typography>
        <IconButton aria-label="reset" size="small" onClick={resetClick}>
          <UndoOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      <PieChart
        series={[
          {
            data: chartData,
            highlightScope: { faded: "global", highlighted: "item" },
          },
        ]}
        width={400}
        height={200}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
export default PieChartComponent;
