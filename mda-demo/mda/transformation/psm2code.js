const fs = require("fs");
const path = require("path");

const {
  Datajs,
  Dbjs,
} = require("../psm-profiles/psmModel/dataStore/postgresql_code.js");

let psm_json = require("../psm_transformation_result.json");

let PSM_keys = {};
let PSM_attribute = [];

// Extract infromation from PSM
const extractPSM = () => {
  for (const [key, value] of Object.entries(psm_json)) {
    // Get all attribute names
    const properties = value.properties ? Object.keys(value.properties) : [];
    PSM_attribute.push(properties);

    // Get association names
    let associations = [];
    for (const attribute of properties) {
      const attributeValue = value.properties[attribute];
      if (attributeValue.items && attributeValue.items.$ref) {
        if (attributeValue.items.$ref.includes("LinkObject")) {
          associations.push(attribute);
        }
      }
    }

    // Get PIM class name: stereotype name + association names
    PSM_keys[key] = [
      value.type["$ref"].split("/").pop(),
      psm_json[key].properties,
      associations,
    ];
  }

  // Remove nested arrays in PSM_attribute
  PSM_attribute = PSM_attribute.flat();
};

extractPSM();

//
// Save code to appropriate file and folder
const writeFile = (folderName, fileName, scripts) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }
  fs.writeFileSync(path.join(folderName, fileName), scripts);
  console.log(fileName + " has been created at " + folderName);
};

// PSM to code transformation
const transform = () => {
  for (const [key, [stereotype, properties, ...associations]] of Object.entries(
    PSM_keys
  )) {
    // PSM DataModel --> ___data.js
    if (stereotype.includes("DataModel")) {
      let data = new Datajs(key.toLowerCase() + ".js").mapCode_datamodel(properties);
      writeFile(data.folderName, data.fileName, data.code);
    }

    if (stereotype.includes("PostgreSQLDatabase")) {
      let pool = new Dbjs("db.js").mapCode_datastore(properties);
      writeFile(pool.folderName, pool.fileName, pool.code);
    }
  }
};

transform();
