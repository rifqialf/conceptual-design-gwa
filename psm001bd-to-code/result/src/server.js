const { express } = require("express");
const { cors } = require("cors");
const { building_router } = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\config\building_route.js");
const { busstop_router } = require("C:\Users\alfat\Documents\Codes\thesis\conceptual-design-gwa\psm001bd-to-code\result\src\config\busstop_route.js");

const app = express()


const port = 

app.use(cors())
app.use('/', building_router)
app.use('/', busstop_router)
app.listen(port, () => console.log('Server is running on port '))