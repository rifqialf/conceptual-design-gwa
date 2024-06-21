const {
    express
} = require("express");
const {
    getBuildingData
} = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\controller\buildingDataFetcher.js");

const building_router = express.Router();


function routers() {
    building_router.get("/building", getBuildingData);
}

routers();


module.exports = {
    building_router
};