const {
    express
} = require("express");
const {
    getBusStopData
} = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\controller\busstopDataFetcher.js");

const busstop_router = express.Router();


function routers() {
    busstop_router.get("/building", getBusStopData);
}

routers();


module.exports = {
    busstop_router
};