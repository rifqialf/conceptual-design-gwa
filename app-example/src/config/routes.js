const express = require("express");
const router = express.Router();
const { busStopData } = require("../model/busstop");

function routers() {
  router.get("/busstop", busStopData);
}

routers();

module.exports = router;
