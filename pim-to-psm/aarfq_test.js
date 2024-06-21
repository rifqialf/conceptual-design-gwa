// const { default: json2json } = require("awesome-json2json");

// let Pim = {
//   BusStopDataStore: {
//     $anchor: "BusStopDataStore",
//     type: {
//       $ref: "https://raw.githubusercontent.com/rifqialf/conceptual-design-gwa/main/Pim-to-psm/Pim-profile-diagram/profile-Pim-model#/$defs/LocalDataStore",
//     },
//     properties: {
//       datastorename: {
//         type: {
//           $ref: "#/$defs/Database",
//         },
//         default: "postgresql",
//       },
//       location: {
//         type: "string",
//         default: "localhost",
//       },
//       contains: {
//         type: "array",
//         minItems: 0,
//         items: {
//           $ref: "https://register.geostandaarden.nl/jsonschema/uml2json/0.1/schema_definitions.json#/$defs/LinkObject",
//         },
//         uniqueItems: true,
//       },
//     },
//     required: ["properties"],
//   },
// };

// console.log(Pim.BusStopDataStore.type.$ref.includes("DataStore"))

////////////////////////////////

// import json2json from 'awesome-json2json';
// const { default: json2json } = require('awesome-json2json');

// let sourceJson = { foo: { bar: { baz: 1 } } };

// let template = {
//   new_foo: 'foo.bar.baz',
// };

// console.log(json2json(sourceJson, template));
// { new_foo: 1 }

////////////////////////////////

// Current PSM
{
    BusStop: {
      '$anchor': 'BusStop',
      type: 'object',
      properties: {
        schemaName: [Object],
        tableName: [Object],
        isContainedBy: [Object],
        istransformedBy: [Object],
        isRetrievedBy: [Object],
        attributeFilter: [Object],
        geom: [Object]
      },
      required: [ 'properties' ]
    },
    PostgreSQL: {
      '$anchor': 'PostgreSQL',
      type: 'object',
      properties: {
        user: [Object],
        host: [Object],
        database: [Object],
        password: [Object],
        port: [Object],
        query: [Object],
        isExtendedBy: [Object],
        contains: [Object]
      },
      required: [ 'properties' ]
    },
    PostGIS: {
      '$anchor': 'PostGIS',
      type: 'object',
      properties: {
        st_asGeoJSON: [Object],
        extends: [Object],
        st_flipCoordinates: [Object]
      },
      required: [ 'properties' ]
    }
  }