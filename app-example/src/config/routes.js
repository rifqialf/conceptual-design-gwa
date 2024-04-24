const express = require("express");
const router = express.Router();
const {getBusstopData} = require("../controller/dataFetcher");

function routers() {
  router.get("/busstop", getBusstopData);
}

routers()

module.exports = router;
