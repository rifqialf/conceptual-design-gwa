const { default: json2json } = require("awesome-json2json");
let fs = require("fs");

// Define PIM (LATER - Transform to get stereotype attribute)
let PIM = [
  {
    $anchor: "BusStopDataStore",
    type: {
      $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/Pim-to-psm/Pim-profile-diagram/profile-Pim-model#/$defs/LocalDataStore",
    },
    properties: {
      datastorename: {
        type: {
          $ref: "#/$defs/Database",
        },
        default: "postgresql",
      },
      location: {
        type: "string",
        default: "localhost",
      },
      contains: {
        type: "array",
        items: {
          $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
        },
        uniqueItems: true,
      },
    },
    required: ["properties"],
  },
  {
    $anchor: "BusStop",
    type: {
      $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/pim-to-psm/pim-profile-diagram/profile-pim-model#/$defs/Dataset/VectorDataset",
    },
    stereotype: "VectorDataset",
    properties: {
      geometry: {
        type: {
          $ref: "#/$defs/GeometryType",
        },
        default: "GM_Point",
      },
      sourceCRS: {
        type: {
          $ref: "#/$defs/CoordinateReferenceSystem",
        },
        default: "EPSG:4326",
      },
      relevantAttributes: {
        type: "array",
        items: {
          type: "string",
        },
        default: ["id", "city"],
      },
      attributeFilter: {
        type: {
          $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
        },
        default: {
          type: {
            $ref: "#/$defs/CityName",
          },
        },
      },
      isContainedBy: {
        type: "array",
        items: {
          $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
        },
        uniqueItems: true,
      },
      isDisplayedBy: {
        type: "array",
        items: {
          $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
        },
        uniqueItems: true,
      },
      isBoundBy: {
        type: "array",
        items: {
          $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
        },
        uniqueItems: true,
      },
    },
    required: ["properties"],
  },
];

// Extract classnames and stereotypes (temporary)
let PIMkeys = {};
for (const [key, value] of Object.entries(PIM)) {
  PIMkeys[key] = [
    value.type["$ref"].split("/").pop(),
    Object.keys(value.properties),
  ];
}

let PSM = {};

// MAPPING //////////////////////////////////////////////////////////////////////////////////////////////////

class PostGIS {
  constructor() {
    this.template = {
      $anchor: "PostGIS",
      type: "object",
      properties: {
        st_asGeoJSON: {
          type: {
            $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
        extends: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
        },
      },
      required: ["properties"],
    };
  }

  mod_epsg4326() {
    this.template.properties["st_flipCoordinates"] = {
      type: {
        $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
      },
    };
    return this;
  }

  mod_rolename_transform = () => {
    this.template.properties["transform"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
class PostgreSQL {
  constructor() {
    this.template = {
      $anchor: "PostgreSQL",
      type: "object",
      properties: {
        user: {
          type: "string",
        },
        host: {
          type: "string",
        },
        database: {
          type: "string",
        },
        password: {
          type: "string",
        },
        port: {
          type: "integer",
        },
        query: {
          type: {
            $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
      },
      required: ["properties"],
    };
  }

  mod_addHost(sourceClassName) {
    let pim_hostname = sourceClassName.properties.location;

    this.template.properties.host["default"] = pim_hostname["default"];
    return this;
  }

  mod_addRoleName_isExtendedBy() {
    this.template.properties["isExtendedBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  }

  mod_addRoleName_contains() {
    this.template.properties["contains"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
class DataModel {
  constructor() {
    this.template = {
      $anchor: "",
      type: "object",
      properties: {
        schemaName: {
          type: "string",
          default: "",
        },
        tableName: {
          type: "string",
          default: "",
        },
      },
      required: ["properties"],
    };
  }

  // add anchor; from PIM anchor
  mod_anchorname = (sourceClassName) => {
    this.template.$anchor = sourceClassName.$anchor + "Data";
    return this;
  };

  // add isContainedBy rolename; from ...
  mod_rolename_iscontained = () => {
    this.template.properties["isContainedBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };

  // add istransformedBy rolename; from ...
  mod_rolename_istransformedby = () => {
    this.template.properties["istransformedBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };

  // add isRetrievedBy rolename; from PIM thedataset with display
  mod_rolename_isretrievedby = () => {
    this.template.properties["isRetrievedBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };

  // add data attributes; from PIM relevantAttributes
  mod_relevantAttributes = (sourceClassName) => {
    const attributeNames =
      sourceClassName.properties.relevantAttributes.default;

    for (const attributeName of attributeNames) {
      this.template.properties[attributeName] = {
        type: "", // blank for now; the user will be prompted to specify
      };
    }
    return this;
  };

  // add geometry; from PIM geom; if its <<vectorDataset>>
  mod_geometryAttribute = (sourceClassName) => {
    const properties = sourceClassName.properties;

    let geometryAttribute = {};
    let propName = "";
    for (const prop in properties) {
      if (
        sourceClassName.properties[prop].type?.$ref?.includes("GeometryType")
      ) {
        geometryAttribute = properties[prop];
        propName = prop;
      }
    }

    this.template.properties[propName] = geometryAttribute;
    return this;
  };

  // add filter; from PIM attributeFilter
  mod_operator_attributefilter = (sourceClassName) => {
    const filterParameter = sourceClassName.properties.attributeFilter.default;

    this.template.properties["attributeFilter"] = {
      type: {
        $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
      },
      default: filterParameter,
    };
    return this;
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
class HttpProtocol {
  constructor() {
    this.template = {
      $anchor: "",
      type: "object",
      properties: {
        request: {
          type: "object",
        },
        response: {
          type: "object",
        },
        async: {
          type: {
            $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
        catchError: {
          type: {
            $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
      },
      required: ["properties"],
    };
  }

  // Change the request with filter
  mod_request = (psm_datamodelclass) => {
    const associatedClassWithFilter = psm_datamodelclass;

    const associatedFilteredAttribute =
      associatedClassWithFilter.template.properties.attributeFilter.default;

    this.template.properties.request = associatedFilteredAttribute;
    return this;
  };

  // change the request
  mod_response = (modification) => {
    this.template.properties.response = modification;
    return this;
  };

  mod_addRolename_Retrieves = () => {
    this.template.properties["retrieves"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    this.template.properties["isRetrievedBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };

  mod_addRolename_Handles = () => {
    this.template.properties["handles"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    this.template.properties["isHandledBy"] = {
      type: "array",
      items: {
        $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
      },
      uniqueItems: true,
    };
    return this;
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
class Route {
  constructor() {
    this.template = {
      $anchor: "",
      type: "object",
      properties: {
        path: {
          type: "string",
        },
        method: {
          type: "string",
          default: "get",
        },
        setRouter: {
          type: {
            $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
        retrieves: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
          uniqueItems: true,
        },
        isHandledBy: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
          uniqueItems: true,
        },
      },
      required: ["properties"],
    };
  }

  // give anchor
  mod_anchorname = (sourceClassName) => {
    this.template.$anchor = sourceClassName.$anchor + "Data";
    return this;
  };

  // add path default
  mod_addPath() {
    let dataName = this.template.$anchor.replace("DataRetrieval", "");

    this.template.properties.path["default"] =
      "/" + dataName.replace("Route", "").toLowerCase();
    return this;
  }

  // add method default (LATER: this is connected to FetchBusStopData from View)
  //   mod_addMethod(psm_dataretrieval) {
  //     let associatedHttpDataRetrieval = psm_dataretrieval
  //     let dataName = associatedHttpDataRetrieval.template.$anchor.replace("DataRetrieval", "")

  //     this.template.properties.path["default"] = "/" + dataName
  //   }
}

////////////////////////////////////////////////////////////////////////////////////////////////
class FunctionType {
  constructor() {
    this.template = {
      $anchor: "Function",
      type: "object",
      properties: {
        parameter: {
          type: "array",
          minItems: 0,
          items: {
            type: "string",
          },
        },
      },
      required: ["properties"],
    };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
class Server {
  constructor() {
    this.template = {
      $anchor: "Server",
      type: "object",
      properties: {
        port: {
          type: "int",
          default: 5000,
        },
        listenServer: {
          type: {
            $def: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
        handles: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
          uniqueItems: true,
        },
        uses: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
          uniqueItems: true,
        },
      },
      required: ["properties"],
    };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
class CorsMiddleware {
  constructor() {
    this.template = {
      $anchor: "Cors",
      type: "object",
      properties: {
        listenServer: {
          useCors: {
            $def: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/uml_classoperation_schema_definition.json#function",
          },
        },
        isUsedBy: {
          type: "array",
          items: {
            $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
          },
          uniqueItems: true,
        },
      },
      required: ["properties"],
    };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
class RouteHandler {
  constructor() {
    this.template = {
      $anchor: "",
      type: "object",
      properties: {
        endpointUrl: {
          type: "string",
          default: "",
        },
        tableName: {
          type: "string",
          default: "",
        },
      },
      required: ["properties"],
    };
  }

  // add anchor; from PIM anchor
  mod_anchorname = (sourceClassName) => {
    this.template.$anchor = sourceClassName.$anchor + "Data";
    return this;
  };

  // Add endpointURL default value; from PostgreSQL host attribute
  // Add route default value; from route class

}




////////////////////////////////////////////////////////////////////////////////////////////////
// Create the PSM
const addToPSM = (...psmClasses) => {
  for (let i = 0; i < psmClasses.length; i++) {
    let transformedObject = {
      [psmClasses[i].$anchor]: psmClasses[i],
    };
    PSM = { ...transformedObject, ...PSM };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PREPARATION
const ViewStereotypes = [
  "UiComponent",
  "SearchBar",
  "DataVisualization",
  "LayerSelection",
  "MapDisplay",
  "ChartDisplay",
];

let classObjects = [];
let enumObjects = [];
let datasetClasses = []; // they have the same index as dataModelClasses
let vectorDatasetClasses = [];
let uiComponentClasses = [];

let vectorDatasetClassesWithContainsRolename = [];

// Get all Class & Enum objects
for (const object of PIM) {
  if (object.properties) {
    classObjects.push(object);
  } else if (object.enum) {
    enumObjects.push(object);
  }
}

// Get all <<Dataset>> classes
for (const object of classObjects) {
  if (object.stereotype.includes("Dataset")) {
    datasetClasses.push(object);
  }
}

// Get all <<UI Component>> classes
for (const object of classObjects) {
  for (const view of ViewStereotypes) {
    if (object.stereotype.includes(view)) {
      uiComponentClasses.push(object);
    }
  }
}

// EXECUTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CLASS: PostGIS /////////////////////////////////////////////////////////////////////////////
// VALIDATION ////////////////////////////////////////
// Get All VectorDatasets
vectorDatasetClasses = [];
for (const object of classObjects) {
  if (object.stereotype.includes("VectorDataset")) {
    vectorDatasetClasses.push(object);
  }
}

// METHOD EXECUTION //////////////////////////////////
let vectorDatasetClassWithSourceCRSEPSG4326 = [];
if (vectorDatasetClasses.length > 0) {
  // Initialize PostGIS class
  let postgisClass = new PostGIS();
  postgisClass = postgisClass.mod_rolename_transform();

  // Check for EPSG:4326; then add st_flipcoordinates
  for (const vectorDataset of vectorDatasetClasses) {
    if (vectorDataset.properties.sourceCRS.default == "EPSG:4326") {
      vectorDatasetClassWithSourceCRSEPSG4326.push(vectorDataset);
    }
  }

  if (vectorDatasetClassWithSourceCRSEPSG4326.length > 0) {
    postgisClass = postgisClass.mod_epsg4326();
  }

  addToPSM(postgisClass.template);
}

// CLASS: PostGreSQL //////////////////////////////////////////////////////////////////////////
// VALIDATTION //////////////////////////////////////////
// Get All DataStore with PostgreSQL
let dataStoreClassesWithPostgreSQL = [];
for (const object of classObjects) {
  if (object.properties.datastorename?.default.includes("postgresql")) {
    dataStoreClassesWithPostgreSQL.push(object);
  }
}

// Get All VectorDatasets
vectorDatasetClasses = [];
for (const object of classObjects) {
  if (object.stereotype.includes("VectorDataset")) {
    vectorDatasetClasses.push(object);
  }
}

// Get All VectorDatasets with Contain rolename
vectorDatasetClassesWithContainsRolename = [];
for (const vectorDataset of vectorDatasetClasses) {
  if (vectorDataset.properties.isContainedBy) {
    vectorDatasetClassesWithContainsRolename.push(vectorDataset);
  }
}

// METHOD EXECUTION //////////////////////////////////
// Reading DataStore with PostgreSQL
if (dataStoreClassesWithPostgreSQL.length > 0) {
  // Initialize PostgreSQL class
  let postgresqlClass = new PostgreSQL();

  // Add the host to PostgreSQL class without condition
  postgresqlClass = postgresqlClass.mod_addHost(
    dataStoreClassesWithPostgreSQL[0]
  );

  // Reading VectorDataset; Add isExtendedBy without other condition
  if (vectorDatasetClasses.length > 0) {
    postgresqlClass = postgresqlClass.mod_addRoleName_isExtendedBy();
  }

  // Reading VectorDataset with Contain association; Add Contains without other condition
  if (vectorDatasetClassesWithContainsRolename.length > 0) {
    postgresqlClass = postgresqlClass.mod_addRoleName_contains();
  }

  addToPSM(postgresqlClass.template);
}

// CLASS: Data Model //////////////////////////////////////////////////////////////////////////////
// VALIDATTION //////////////////////////////////////////
// Get All VectorDatasets
vectorDatasetClasses = [];
for (const object of classObjects) {
  if (object.stereotype.includes("VectorDataset")) {
    vectorDatasetClasses.push(object);
  }
}

// Get All VectorDatasets with Contain rolename
vectorDatasetClassesWithContainsRolename = [];
for (const vectorDataset of vectorDatasetClasses) {
  if (vectorDataset.properties.isContainedBy) {
    vectorDatasetClassesWithContainsRolename.push(vectorDataset);
  }
}

// Get All Datasets with Display rolename
datasetClassesWithDisplayRolename = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.isDisplayedBy) {
    datasetClassesWithDisplayRolename.push(dataset);
  }
}

// Get All Datasets with Filter attribute
datasetClassesWithFilter = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.attributeFilter) {
    datasetClassesWithFilter.push(dataset);
  }
}

// Get All Datasets with RelevantAttributes
datasetClassesWithRelevantAttributes = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.relevantAttributes) {
    datasetClassesWithRelevantAttributes.push(dataset);
  }
}

// Create multiple DataModel for each VectorDataset
let dataModelClasses = {}; // they have the same index as datasetClasses
for (const vectorDataset of vectorDatasetClasses) {
  dataModelClasses[vectorDataset.$anchor] = new DataModel();
}

// METHOD EXECUTION //////////////////////////////////
for (const datamodel in dataModelClasses) {
  // Get the related thedataset by equivalent index
  let theDataModel = dataModelClasses[datamodel];
  const thedataset = datasetClasses.at(datasetClasses.indexOf(datamodel));

  // Add anchor from PIM anchor; without condition
  theDataModel = theDataModel.mod_anchorname(thedataset);

  if (vectorDatasetClasses.includes(thedataset)) {
    // Add isTransformedBy if the related dataset is VectorDataset
    theDataModel = theDataModel.mod_rolename_istransformedby();
    // Add geometry attribute if the related dataset is VectorDataset
    theDataModel = theDataModel.mod_geometryAttribute(thedataset);
  }

  // Add isContained if the related dataset is vectorDataset with Contain rolename
  if (vectorDatasetClassesWithContainsRolename.includes(thedataset)) {
    theDataModel = theDataModel.mod_rolename_iscontained();
  }

  // Add isRetrievedBy if the related dataset with isDisplayed rolename
  if (datasetClassesWithDisplayRolename.includes(thedataset)) {
    theDataModel = theDataModel.mod_rolename_isretrievedby();
  }

  // Add attributeFilter if the dataset has attributeFilter
  if (datasetClassesWithFilter.includes(thedataset)) {
    theDataModel = theDataModel.mod_operator_attributefilter(thedataset);
  }

  // Add RelevantAttributes if the related dataset has relevantAttributes
  if (datasetClassesWithRelevantAttributes.includes(thedataset)) {
    theDataModel = theDataModel.mod_relevantAttributes(thedataset);
  }

  addToPSM(theDataModel.template);
}

// CLASS: BusStopDataRetrieval + BusStopRouteHandler ///////////////////////////////////////
// VALIDATION //////////////////////////////////////////

// Get All Datasets with Display rolename
datasetClassesWithDisplayRolename = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.isDisplayedBy) {
    datasetClassesWithDisplayRolename.push(dataset);
  }
}

// Get All DataModel with isRetrievedBy rolename
dataModelClassesWithRetrieveRolename = [];
for (const datamodel in dataModelClasses) {
  let thedatamodel = dataModelClasses[datamodel];
  if (thedatamodel.template.properties.isRetrievedBy) {
    dataModelClassesWithRetrieveRolename.push(thedatamodel);
  }
}

// Get All DataModel with isRetrievedBy rolename + Filter attribute
dataModelClassesWithRetrieveRolename_WithFilter = [];
for (const datamodel of dataModelClassesWithRetrieveRolename) {
  if (datamodel.template.properties.attributeFilter) {
    dataModelClassesWithRetrieveRolename_WithFilter.push(datamodel);
  }
}

// Create multiple DataRetrieval + Route Handler for each DataModel with isRetrieved rolename
let httpDataRetrievalClasses = {};
let httpRouteHandlerClasses = {};

for (const datamodel of dataModelClassesWithRetrieveRolename) {
  httpDataRetrievalClasses["Retrieve" + datamodel.template.$anchor] =
    new HttpProtocol();
  httpRouteHandlerClasses[
    datamodel.template.$anchor.replace("Data", "") + "RouteHandler"
  ] = new HttpProtocol();
}

// METHOD EXECUTION //////////////////////////////////
// For Data Retrieval
for (const dataRetrieval in httpDataRetrievalClasses) {
  // Get the related thedataset by equivalent index
  let theDataRetrieval = httpDataRetrievalClasses[dataRetrieval];
  const theDataModel = dataModelClassesWithRetrieveRolename.at(
    dataModelClassesWithRetrieveRolename.indexOf(dataRetrieval)
  );

  // Add anchor from classname; without condition
  theDataRetrieval.template["$anchor"] = dataRetrieval;

  // Add retrieves rolename without condition
  theDataRetrieval.mod_addRolename_Retrieves();

  // Change request if datamodel has filter
  if (dataModelClassesWithRetrieveRolename_WithFilter.includes(theDataModel))
    theDataRetrieval = theDataRetrieval.mod_request(theDataModel);

  addToPSM(theDataRetrieval.template);
}

// For Route Handler
for (const routeHandler in httpRouteHandlerClasses) {
  // Get the related thedataset by equivalent index
  let theRouteHandler = httpRouteHandlerClasses[routeHandler];
  const theDataModel = dataModelClassesWithRetrieveRolename.at(
    dataModelClassesWithRetrieveRolename.indexOf(theRouteHandler)
  );

  // Add anchor from classname; without condition
  theRouteHandler.template["$anchor"] = routeHandler;

  // Add retrieves rolename without condition
  theRouteHandler.mod_addRolename_Handles();

  // Change request if datamodel has filter
  if (dataModelClassesWithRetrieveRolename_WithFilter.includes(theDataModel))
    theRouteHandler = theRouteHandler.mod_request(theDataModel);

  addToPSM(theRouteHandler.template);
}

// Change response if datamodel has filter? Not for now

// CLASS: BusStopRoute ////////////////////////////////////////////////////////////////////////////
// VALIDATION //////////////////////////////////////////

// Get All Datasets with Display rolename
datasetClassesWithDisplayRolename = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.isDisplayedBy) {
    datasetClassesWithDisplayRolename.push(dataset);
  }
}

// Get All DataModel with isRetrievedBy rolename
dataModelClassesWithRetrieveRolename = [];
for (const datamodel in dataModelClasses) {
  let thedatamodel = dataModelClasses[datamodel];
  if (thedatamodel.template.properties.isRetrievedBy) {
    dataModelClassesWithRetrieveRolename.push(thedatamodel);
  }
}

// Create multiple DataRetrieval for each DataModel with isRetrieved rolename
let routeClasses = {};
for (const datamodel of dataModelClassesWithRetrieveRolename) {
  routeClasses[
    datamodel.template.$anchor.replace("Retrieve", "").replace("Data", "Route")
  ] = new Route();
}

// METHOD EXECUTION //////////////////////////////////
for (const route in routeClasses) {
  // Get the related objects by equivalent index
  let theRoute = routeClasses[route];

  // Add anchor from classname; without condition
  theRoute.template["$anchor"] = route.replace("Data", "Route");

  // Add path default
  theRoute = theRoute.mod_addPath();

  addToPSM(theRoute.template);
}

// CLASS: Function Type ////////////////////////////////////////////////////////////////////////////
// Add to PSM without condition
let functionClass = new FunctionType();
addToPSM(functionClass.template);

// CLASS: Server ////////////////////////////////////////////////////////////////////////////
// VALIDATION //////////////////////////////////////////
// Get All Datasets with Display rolename
datasetClassesWithDisplayRolename = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.isDisplayedBy) {
    datasetClassesWithDisplayRolename.push(dataset);
  }
}

if (datasetClassesWithDisplayRolename.length > 0) {
  // Initialize Server class
  let serverClass = new Server();

  // Add to PSM without conditions
  addToPSM(serverClass.template);
}

// CLASS: CorsMiddleware ////////////////////////////////////////////////////////////////////////////
// VALIDATION //////////////////////////////////////////
// Get All Datasets with Display rolename
datasetClassesWithDisplayRolename = [];
for (const dataset of datasetClasses) {
  if (dataset.properties.isDisplayedBy) {
    datasetClassesWithDisplayRolename.push(dataset);
  }
}

if (datasetClassesWithDisplayRolename.length > 0) {
  // Initialize CORS class
  let corsMiddlewareClass = new CorsMiddleware();

  // Add to PSM without conditions
  addToPSM(corsMiddlewareClass.template);
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Print PSM
console.log(PSM);

let PSMstring = JSON.stringify(PSM);
fs.writeFile("pim2psm_result.json", PSMstring, (err) => {
  if (err) console.log(err);
  else {
    console.log("File written successfully");
  }
});
