import React from "react";
import { PieChart } from '@mui/x-charts/PieChart';

function PieChartComponent(data) {
  return <PieChart series={data} width={400} height={200} />;
}

export default PieChartComponent;
