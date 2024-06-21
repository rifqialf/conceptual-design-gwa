const { buildingData } = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\model\buildingdata.js");

        async function getBuildingData(req, res) {
            
        try {
            
        const { rows } = await buildingData();
        
        res.json(rows);
        
        
        } catch (err) {
            console.error("Internal Server Error", err);
        }
        
        }
        
module.exports = { getBuildingData };