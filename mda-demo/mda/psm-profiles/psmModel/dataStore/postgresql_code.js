class Datajs {
  constructor(filename) {
    this.folderName = "gwa/model/";
    this.fileName = filename;
    this.code = "";
  }
  mapCode_datamodel = (class_datamodel) => {
    let sourceToCode = "";
    let attributesToCode = "";
    let attributeFilterToCode = "";

    const add_schemaName_tableName = (class_datamodel) => {
      let schema_table =
        class_datamodel.schemaName.default +
        "." +
        class_datamodel.tableName.default;
      sourceToCode = schema_table;
      return this;
    };

    const add_propertyNames = (class_datamodel) => {
      let attributes = [];
      let nonAttributes = [
        "schemaName",
        "tableName",
        "attributeFilter",
        "isTransformedBy",
        "isContainedBy",
        "isQueriedBy",
      ];

      for (let attribute in class_datamodel) {
        if (nonAttributes.toString().includes(attribute)) {
          continue;
        }

        if (
          class_datamodel[attribute].type &&
          class_datamodel[attribute].type.$ref
        ) {
          if (class_datamodel[attribute].type.$ref.includes("GeometryType")) {
            let geometry = `ST_AsGeoJSON(ST_FlipCoordinates(${attribute}))`;
            attributes.push(geometry);
            continue;
          }
        }
        attributes.push(attribute);
      }
      attributesToCode = attributes;
      return this;
    };

    const add_attributeFilter = (class_datamodel) => {
      let attributeFilter =
        class_datamodel.attributeFilter.default.attribute.type.$ref;

      if (attributeFilter.includes("#")) {
        attributeFilter = attributeFilter.split("/")[2];
      }
      attributeFilterToCode = attributeFilter;
    };

    const create_script = (class_datamodel) => {
      let code_import = `const { pool } = require("../config/db.js");`;
      let code_query = `let query = "SELECT ${attributesToCode.join(
        ","
      )} FROM ${sourceToCode}";`;
      let code_queryParameter = `
      if (${""}) {
        query += \` WHERE ${attributeFilterToCode} = '\${${""}}'\`;
      }`;
      let code_poolQuery = `const { rows } = await pool.query(query);`;

      let code = [code_query];

      if ("attributeFilter" in class_datamodel) {
        code.push(code_queryParameter);
      }

      if ("isContainedBy" in class_datamodel) {
        code.splice(0, 0, code_import);
        code.push(code_poolQuery);
      }

      code = code.join("\n");
      this.code = code;
    };

    // Execution
    add_schemaName_tableName(class_datamodel);
    add_propertyNames(class_datamodel);
    add_attributeFilter(class_datamodel);
    create_script(class_datamodel);

    return this;
  };
}

class Dbjs {
  constructor(filename) {
    this.folderName = "gwa/config/";
    this.fileName = filename;
    this.code = "";
  }

  mapCode_datastore = (class_datastore) => {
    let user = class_datastore.user.default;
    let host = class_datastore.host.default;
    let database = class_datastore.database.default;
    let password = class_datastore.password.default;
    let port = class_datastore.port.default;

    const create_script = () => {
      let code_requirePool = `const { Pool } = require("pg");`;
      let code_userConfiguration = `
      const pool = new Pool({
            user: "${user}",
            host: "${host}",
            database: "${database}",
            password: "${password}",
            port: ${port},
            });`;
      let code_exportModule = `module.exports = { pool };`;

      let code = [code_requirePool, code_userConfiguration, code_exportModule];

      code = code.join("\n");
      this.code = code;
    };

    // Execution
    create_script();
    return this;
  };
}

module.exports = { Datajs, Dbjs };
