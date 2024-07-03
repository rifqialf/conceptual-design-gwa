const extractPIM = () => {
    for (const [key, value] of Object.entries(pim_json)) {
      // Get all attribute names
      const properties = value.properties ? Object.keys(value.properties) : [];
      PIM_attributes.push(properties);
  
      // Get association names
      let associations = [];
      for (const attribute of properties) {
        console.log(attribute);
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
  

const addToPSM = (...psmClasses) => {
  for (const element of psmClasses) {
    let transformedObject = {
      [element.$anchor]: element,
    };
    PSM = { ...transformedObject, ...PSM };
  }
};



module.exports = {extractPIM, addToPSM}