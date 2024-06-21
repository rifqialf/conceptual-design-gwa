const { busstopData } = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\model\busstop_data.js");

        async function getBusStopData(req, res) {
            
        try {
            
        const { rows } = await busstopData();
        
        res.json(rows);
        
        
        } catch (err) {
            console.error("Internal Server Error", err);
        }
        
        }
        
module.exports = { getBusStopData };