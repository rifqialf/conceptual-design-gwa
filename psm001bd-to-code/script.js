const fs = require('fs');
const path = require('path');

// Specify JSON, then copy the contents
const projectPath = "C:/Users/alfat/Documents/Codes/thesis/conceptual-design-gwa/psm001bd-to-code/";
const projectResultPath = path.join(projectPath, "result/");
const jsonFile = "psm001bd.json";

let d;
try {
    const jsonData = fs.readFileSync(path.join(projectPath, jsonFile));
    d = JSON.parse(jsonData);
} catch (err) {
    console.error("Error reading JSON file:", err);
}

// Navigate the JSON file and save several checkpoints
const classes = d["$defs"];
const classNames = Object.keys(classes);

// Collection of functions for writing the JS file
function requireModule(modules, moduleName) {
    return `const { ${modules.join(", ")} } = require("${moduleName}");`;
}

function exportModule(modules) {
    return `module.exports = { ${modules.join(", ")} };`;
}

function writeJsScripts(...scripts) {
    const scriptList = [];

    scripts.forEach(script => {
        if (Array.isArray(script)) {
            script.forEach(scr => {
                if (Array.isArray(scr)) {
                    scr.forEach(s => scriptList.push(s));
                } else {
                    scriptList.push(scr);
                }
            });
        } else {
            scriptList.push(script);
        }
    });

    return scriptList.join("\n");
}

function writeFile(folderName, fileName, scripts) {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName, { recursive: true });
    }

    fs.writeFileSync(path.join(folderName, fileName), scripts);
}

function generateFile(scriptList, folderName, fileName) {
    const scripts = writeJsScripts(scriptList);
    writeFile(folderName, fileName, scripts);
}

function listToStr(theList) {
    return theList.join(", ");
}

function readHref(href) {
    if (href[0] === "#") {
        href = href.replace("#", jsonFile);
        const hrefList = href.split("/");
        const classNameAnchor = hrefList[hrefList.length - 1];

        return global[classNameAnchor];
    }
}

function setDtype(property) {
    const datatypes = {
        "string": String,
        "integer": Number,
        "object": Object,
        "array": Array,
        "number": Number,
        "void": null,
    };

    const geometryTypes = [
        "https://geojson.org/schema/Point.json",
        "https://geojson.org/schema/LineString.json",
        "https://geojson.org/schema/Polygon.json",
        "https://geojson.org/schema/MultiPoint.json",
        "https://geojson.org/schema/MultiLineString.json",
        "https://geojson.org/schema/MultiPolygon.json",
        "https://geojson.org/schema/GeometryCollection.json",
        "https://geojson.org/schema/Geometry.json",
    ];

    Object.keys(datatypes).forEach(datatype => {
        if (datatype === property["type"]) {
            try {
                datatypes[datatype](property["default"]);
                console.log(datatypes[datatype]);
            } catch (err) {
                console.error("Error setting data type:", err);
            }
        }
    });
}

function moduleProps(className) {
    return {
        "module": path.join(
            className.targetFolderName,
            className.targetFileName
        ),
        "props": className.consistingObjectsNames
    };
}

// Class: Pool | File: pool.js
class Pool {
    constructor() {
        this.className = classes["Pool"]["$anchor"];
        this.properties = classes[this.className]["properties"];
        this.consistingObjectsNames = [];

        // Try to automate variables below as much as possible
        this.targetPath = "src/config/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "pool.js";
        this.modules = { "pg": ["Pool"] };

        // Attributes
        this.user = this.properties["user"]["default"];
        this.host = this.properties["host"]["default"];
        this.database = this.properties["database"]["default"];
        this.password = this.properties["password"]["default"];
        this.port = this.properties["port"]["default"];
    }

    pool() {
        return `{
            user: '${this.user}',
            host: '${this.host}',
            database: '${this.database}',
            password: '${this.password}',
            port: ${this.port}
        }`;
    }

    createPool() {
        return `
            const ${this.modules["pg"][0]} = new ${this.modules["pg"][0]}(
                ${this.pool()}
            );
        `;
    }

    static async query(query) {
        return `
            await pool.query(
                "${query}"
            );
        `;
    }

    // Function to create the result
    generateJsFile() {
        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }

        const exportModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            exportModules.push(exportModule(properties));
        }

        const scripts = writeJsScripts(
            requiredModules,
            this.createPool(),
            exportModules
        );

        if (!fs.existsSync(this.targetFolderName)) {
            fs.mkdirSync(this.targetFolderName, { recursive: true });
        }

        fs.writeFileSync(
            path.join(this.targetFolderName, this.targetFileName),
            scripts
        );
    }
}

const pool = new Pool();

class BuildingData {
    constructor() {
        this.className = classes["BuildingData"]["$anchor"];
        this.properties = classes[this.className]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/model/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "buildingdata.js";
        this.modules = {
            [path.join(pool.targetFolderName, pool.targetFileName)]: pool.modules["pg"]
        };

        this.query = this.properties["query"];
    }

    runQuery() {
        return `
        const { rows } = ${Pool.query(this.query["default"])}
        return { rows }
        `;
    }

    tryCatchErrors() {
        return `
        try {
            ${this.runQuery()}
        } catch (err) {
            console.error("Error executing query", err)
        }
        `;
    }

    defineFunction(functionName, functionParams = {}) {
        this.consistingObjectsNames.push(functionName);
        const params = Object.keys(functionParams).join(", ");
        return `
        async function ${functionName}(${params}) {
            ${this.tryCatchErrors()}
        }
        `;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join("\n"));

        const content = this.defineFunction("buildingData");
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join("\n"));

        return scripts;
    }

    generateJsFile() {
        generateFile(
            this.prepareScripts(),
            this.targetFolderName,
            this.targetFileName
        );
    }
}

const buildingdata = new BuildingData();

class BusStopData {
    constructor() {
        this.className = classes["BusStopData"]["$anchor"];
        this.properties = classes[this.className]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/model/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "busstop_data.js";

        this.modules = {
            [path.join(pool.targetFolderName, pool.targetFileName)]: pool.modules["pg"]
        };

        this.query = this.properties["query"];
    }

    runQuery() {
        return `
        const { rows } = ${Pool.query(this.query["default"])}
        return { rows }
        `;
    }

    tryCatchErrors() {
        return `
        try {
            ${this.runQuery()}
        } catch (err) {
            console.error("Error executing query", err)
        }
        `;
    }

    defineFunction(functionName, functionParams = {}) {
        this.consistingObjectsNames.push(functionName);
        const params = Object.keys(functionParams).join(", ");
        return `
        async function ${functionName}(${params}) {
            ${this.tryCatchErrors()}
        }
        `;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join("\n"));

        const content = this.defineFunction("busstopData");
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join("\n"));

        return scripts;
    }

    generateJsFile() {
        generateFile(
            this.prepareScripts(),
            this.targetFolderName,
            this.targetFileName
        );
    }
}

const busstopdata = new BusStopData();

class FetchBuildingData {
    constructor() {
        this.className = classes["FetchBuildingData"]["$anchor"];
        this.properties = classes[this.className]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/controller/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "buildingDataFetcher.js";
        
        console.log(moduleProps(buildingdata))

        this.modules = {
            [moduleProps(buildingdata).module]: moduleProps(buildingdata).props
        };

        this.request = {};
        this.response = {};
        this.data = readHref(this.properties["data"]["type"]["href"]);
    }

    createJson() {
        return `
        res.json(rows);
        `;
    }

    fetchData() {
        return `
        const { rows } = await ${this.modules[moduleProps(buildingdata).module][0]}();
        ${this.createJson()}
        `;
    }

    tryCatchErrors() {
        return `
        try {
            ${this.fetchData()}
        } catch (err) {
            console.error("Internal Server Error", err);
        }
        `;
    }

    defineFunction(functionName, functionParams) {
        this.consistingObjectsNames.push(functionName);
        const functionScript = `
        async function ${functionName}(${listToStr(Object.keys(functionParams))}) {
            ${this.tryCatchErrors()}
        }
        `;
        return functionScript;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join('\n'));

        const content = this.defineFunction("getBuildingData", { req: "req", res: "res" });
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join('\n'));

        return scripts;
    }

    generateJsFile() {
        generateFile(this.prepareScripts(), this.targetFolderName, this.targetFileName);
    }
}

const fetchbuildingdata = new FetchBuildingData();


class FetchBusStopData {
    constructor() {
        this.className = classes["FetchBusStopData"]["$anchor"];
        this.properties = classes[this.className]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/controller/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "busstopDataFetcher.js";

        this.modules = {
            [moduleProps(busstopdata).module]: moduleProps(busstopdata).props
        };

        this.request = {};
        this.response = {};
        this.data = readHref(this.properties["data"]["type"]["href"]);
    }

    createJson() {
        return `
        res.json(rows);
        `;
    }

    fetchData() {
        return `
        const { rows } = await ${this.modules[moduleProps(busstopdata).module][0]}();
        ${this.createJson()}
        `;
    }

    tryCatchErrors() {
        return `
        try {
            ${this.fetchData()}
        } catch (err) {
            console.error("Internal Server Error", err);
        }
        `;
    }

    defineFunction(functionName, functionParams) {
        this.consistingObjectsNames.push(functionName);
        const functionScript = `
        async function ${functionName}(${listToStr(Object.keys(functionParams))}) {
            ${this.tryCatchErrors()}
        }
        `;
        return functionScript;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join('\n'));

        const content = this.defineFunction("getBusStopData", { req: "req", res: "res" });
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join('\n'));

        return scripts;
    }

    generateJsFile() {
        generateFile(this.prepareScripts(), this.targetFolderName, this.targetFileName);
    }
}

const fetchbusstopdata = new FetchBusStopData();


class BuildingRoute {
    constructor() {
        this.properties = classes["BuildingRoute"]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/config/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "building_route.js";

        this.modules = {
            "express": ["express"],
            [moduleProps(fetchbuildingdata).module]: moduleProps(fetchbuildingdata).props
        };

        this.method = "get";
        this.path = "/building";
    }

    startExpressRouter(routerName) {
        this.consistingObjectsNames.push(routerName);
        const script = `
        const ${routerName} = ${this.modules["express"][0]}.Router();
        `;
        return script;
    }

    callRouters(functionName) {
        return `
        ${functionName}();
        `;
    }

    defineRouterFunction(functionName) {
        const functionScript = `
        function ${functionName}() {
            ${this.consistingObjectsNames[0]}.${this.method}("${this.path}", ${this.modules[moduleProps(fetchbuildingdata).module][0]});
        }
        ${this.callRouters(functionName)}
        `;
        return functionScript;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join('\n'));

        const startExpress = this.startExpressRouter("building_router");
        scripts.push(startExpress);

        const content = this.defineRouterFunction("routers");
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join('\n'));

        return scripts;
    }

    generateJsFile() {
        generateFile(this.prepareScripts(), this.targetFolderName, this.targetFileName);
    }
}

const buildingroute = new BuildingRoute();


class BusStopRoute {
    constructor() {
        this.properties = classes["BusStopRoute"]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/config/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "busstop_route.js";

        this.modules = {
            "express": ["express"],
            [moduleProps(fetchbusstopdata).module]: moduleProps(fetchbusstopdata).props
        };

        this.method = "get";
        this.path = "/building";
    }

    startExpressRouter(routerName) {
        this.consistingObjectsNames.push(routerName);
        const script = `
        const ${routerName} = ${this.modules["express"][0]}.Router();
        `;
        return script;
    }

    callRouters(functionName) {
        return `
        ${functionName}();
        `;
    }

    defineRouterFunction(functionName) {
        const functionScript = `
        function ${functionName}() {
            ${this.consistingObjectsNames[0]}.${this.method}("${this.path}", ${this.modules[moduleProps(fetchbusstopdata).module][0]});
        }
        ${this.callRouters(functionName)}
        `;
        return functionScript;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(requiredModules.join('\n'));

        const startExpress = this.startExpressRouter("busstop_router");
        scripts.push(startExpress);

        const content = this.defineRouterFunction("routers");
        scripts.push(content);

        const exportModules = [];
        exportModules.push(exportModule(this.consistingObjectsNames));
        scripts.push(exportModules.join('\n'));

        return scripts;
    }

    generateJsFile() {
        generateFile(this.prepareScripts(), this.targetFolderName, this.targetFileName);
    }
}

const busstoproute = new BusStopRoute();


// Constants and function formats
const constFormat = (varName, value) => `
const ${varName} = ${value}
`;

const funcFormat = (funcName, body) => `
function ${funcName}() {
    ${body}
}
`;

function beFunction(string, ...params) {
    if (params.length) {
        return `${string}(${params.join(', ')})`;
    } else {
        return `${string}()`;
    }
}

class BackendServer {
    constructor() {
        this.properties = classes["BackendServer"]["properties"];
        this.consistingObjectsNames = [];

        this.targetPath = "src/";
        this.targetFolderName = path.join(projectResultPath, this.targetPath);
        this.targetFileName = "server.js";

        this.modules = {
            "express": ["express"],
            "cors": ["cors"],
            [moduleProps(buildingroute).module]: moduleProps(buildingroute).props,
            [moduleProps(busstoproute).module]: moduleProps(busstoproute).props,
        };

        // Attributes
        this.port = this.properties["port"]["default"];
    }

    startExpressApp(functionName) {
        const functionScript = constFormat(functionName, beFunction(this.modules["express"][0]));
        return functionScript;
    }

    definePort(functionName) {
        this.consistingObjectsNames.push(functionName);
        const functionScript = constFormat(functionName, this.properties["port"]["default"]);
        return functionScript;
    }

    useMiddleware(middleware) {
        const functionScript = `app.use(${middleware})`;
        return functionScript;
    }

    useRoute(path, route) {
        const functionScript = `app.use('${path}', ${route})`;
        return functionScript;
    }

    startServer() {
        const functionScript = `app.listen(port, () => console.log('Server is running on port ${this.port}'))`;
        return functionScript;
    }

    prepareScripts() {
        const scripts = [];

        const requiredModules = [];
        for (const [moduleName, properties] of Object.entries(this.modules)) {
            requiredModules.push(requireModule(properties, moduleName));
        }
        scripts.push(...requiredModules);

        const startExpressApp = this.startExpressApp("app");
        scripts.push(startExpressApp);

        const definePort = this.definePort("port");
        scripts.push(definePort);

        const useCors = this.useMiddleware(beFunction(this.modules["cors"][0]));
        scripts.push(useCors);

        const useBuildingRoutes = this.useRoute('/', this.modules[moduleProps(new BuildingRoute()).module][0]);
        scripts.push(useBuildingRoutes);

        const useBusStopRoutes = this.useRoute('/', this.modules[moduleProps(new BusStopRoute()).module][0]);
        scripts.push(useBusStopRoutes);

        const startServer = this.startServer();
        scripts.push(startServer);

        return scripts;
    }

    generateJsFile() {
        generateFile(this.prepareScripts(), this.targetFolderName, this.targetFileName);
    }
}

const backendserver = new BackendServer();

// Main entry point
(async () => {
    // Class: Pool
    pool.generateJsFile();
    buildingdata.generateJsFile();
    busstopdata.generateJsFile();
    fetchbuildingdata.generateJsFile();
    fetchbusstopdata.generateJsFile();
    buildingroute.generateJsFile();
    busstoproute.generateJsFile();
    backendserver.generateJsFile();

    // Beautify all generated JS files (optional)
    const beautify = require('js-beautify').js;
    const files = fs.readdirSync(path.join(projectResultPath, 'src/config'));

    files.forEach(file => {
        const filePath = path.join(projectResultPath, 'src/config', file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const beautifiedContent = beautify(fileContent);
        fs.writeFileSync(filePath, beautifiedContent);
    });

    console.log("Done!");
})();

