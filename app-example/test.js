// const proj4 = require("proj4"); // Include proj4 library

// // Define your projection definitions for EPSG:28992 and EPSG:4326
// proj4.defs(
//   "EPSG:28992",
//   "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs"
// );
// proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// const firstproj = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs"
// const secondproj = "+proj=longlat +datum=WGS84 +no_defs"

// 




// // Your GeoJSON object
// const geojson = {
//   type: "FeatureCollection",
//   name: "woonplaats",
//   crs: {
//     type: "name",
//     properties: {
//       name: "urn:ogc:def:crs:EPSG::28992",
//     },
//   },
//   features: [
//     {
//       type: "Feature",
//       id: "woonplaats.b051b590-f708-432a-9c87-b6900af93b06",
//       properties: {
//         identificatie: "1145",
//         rdf_seealso:
//           "http://bag.basisregistraties.overheid.nl/bag/id/woonplaats/1145",
//         status: "Woonplaats aangewezen",
//         woonplaats: "Enschede",
//       },
//       bbox: [248530.608, 464736.151, 263910.579, 478595.775],
//       geometry: {
//         type: "MultiPolygon",
//         coordinates: [
//           [
//             [
//               [257806.527, 464736.151],
//               [257809.245, 464738.782],
//             ],
//           ],
//         ],
//       },
//     },
//   ],
// };

// console.log(geojson)


// // Transform each coordinate in the GeoJSON from EPSG:28992 to EPSG:4326
// geojson.features.forEach((feature) => {
//   const geometry = feature.geometry;
//   if (geometry && geometry.coordinates) {
//     if (geometry.type === "MultiPolygon") {
//       geometry.coordinates = geometry.coordinates.map((polygon) =>
//         polygon.map((ring) =>
//           ring.map((point) =>
//             proj4(firstproj, secondproj, point) // Convert coordinate
//           )
//         )
//       );
//     }
//   }
// });

// console.log(JSON.stringify(geojson)); // Output the modified GeoJSON

////////////////////////////////////////////////////////////////
