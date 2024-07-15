const fs = require("fs");
const path = require("path");

const {
  PostgreSQLDatabase,
  DataModel,
  DataHandler,
  PostGIS,
} = require("../psm-profiles/psmModel/dataStore/postgresql.js");

// FOR USER - fill in the filepath of the PIM-JSON
const pim_json = require("../pim-user.json");

// Add PSM stereotypes from PIM classes
let PIM_keys = {};
let PIM_attributes = [];

const extractPIM = () => {
  for (const [key, value] of Object.entries(pim_json)) {
    // Get all attribute names
    const properties = value.properties ? Object.keys(value.properties) : [];
    PIM_attributes.push(properties);

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
    PIM_keys[key] = [
      value.type["$ref"].split("/").pop(),
      pim_json[key].properties,
      associations,
    ];
  }

  // Remove nested arrays in PIM_attributes
  PIM_attributes = PIM_attributes.flat();
};

extractPIM();

// Instantiate PSM blank stereotypes (using PostgreSQL PSM profile)
let PSM = [];

const addToPSM = (...psmClasses) => {
  for (const element of psmClasses) {
    let transformedObject = {
      [element.$anchor]: element,
    };
    PSM = { ...transformedObject, ...PSM };
  }
};

// PIM to PSM transformation - Create classes and add to PSM for stereotypes + associations
const transform = () => {
  for (const [key, [stereotype, properties, ...associations]] of Object.entries(
    PIM_keys
  )) {
    // PIM VectorDataset --> PSM
    if (stereotype.includes("VectorDataset")) {
      let datamodel = new DataModel(key + "Data").mapAttributes_dataset(
        properties
      );
      let datahandler = new DataHandler("Fetch" + key).mapAttributes_dataset(
        properties
      );

      if (associations.toString().includes("isOfferedBy")) {
        datamodel.addAssociation_isContainedBy();
      }
      addToPSM(datamodel.class, datahandler.class);
    }

    // PIM LocalDataStore --> PSM
    if (stereotype.includes("LocalDataStore")) {
      let postgresql = new PostgreSQLDatabase().mapAttributes_datastore(
        properties
      );

      if (associations.toString().includes("offers")) {
        postgresql.addAssociation_contains();

        let postgis = new PostGIS("PostGIS")
          .addAssociation_extends()
          .addAssociation_transforms();
        addToPSM(postgis.class);

        postgresql.addAssociation_isExtendedBy()
      }
      addToPSM(postgresql.class);
    }
  }
};

transform();

// Writing the PSM JSON file
const PSMstring = JSON.stringify(PSM);
const resultFolderName = "c:/Users/alfat/Documents/Codes/thesis/conceptual-design-gwa/mda-demo/mda/";
const resultFileName = "psm_transformation_result1.json";

fs.writeFile(path.join(resultFolderName, resultFileName), PSMstring, (err) => {
  if (err) console.log(err);
  else {
    console.log(
      `PIM has been transformed into PSM successfully: ${resultFileName}`
    );
  }
});
