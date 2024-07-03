let psm_profile = require("./postgresql.json");

// PSM-OO
class PostgreSQLDatabase {
  constructor() {
    this.class = psm_profile["PostgreSQLDatabase"];
    this.class.$anchor = "Pool";
    this.associations = {
      isExtendedBy: psm_profile["isExtendedBy"].properties["isExtendedBy"],
      contains: psm_profile["contains"].properties["contains"],
    };
  }

  addAssociation_isExtendedBy = () => {
    this.class.properties.isExtendedBy = this.associations["isExtendedBy"];
    return this;
  };

  addAssociation_contains = () => {
    this.class.properties.contains = this.associations["contains"];
    return this;
  };

  mapAttributes_datastore = (class_datastore) => {
    this.class.properties.host.default = class_datastore.ipAddress.default;
    this.class.properties.host.type = class_datastore.ipAddress.type;

    return this;
  };
}

class DataModel {
  constructor(className) {
    this.class = psm_profile["DataModel"];
    this.class.$anchor = className;
    this.associations = {
      isTransformedBy:
        psm_profile["isTransformedBy"].properties["isTransformedBy"],
      isContainedBy: psm_profile["isContainedBy"].properties["isContainedBy"],
      isQueriedBy: psm_profile["isQueriedBy"].properties["isQueriedBy"],
    };
  }

  addAssociation_isTransformedBy = () => {
    this.class.properties.isTransformedBy =
      this.associations["isTransformedBy"];
    return this;
  };

  addAssociation_isContainedBy = () => {
    this.class.properties.isContainedBy = this.associations["isContainedBy"];
    return this;
  };

  addAssociation_isQueriedBy = () => {
    this.class.properties.isQueriedBy = this.associations["isQueriedBy"];
    return this;
  };

  mapAttributes_dataset = (class_dataset) => {
    this.class.properties.geometry = class_dataset.geometry;

    this.class.properties.attributeFilter.default =
      class_dataset.attributeFilter.default;

    let attributesToMake = class_dataset.relevantAttributes.default;
    for (let attribute of attributesToMake) {
      this.class.properties[attribute] = {
        default: "",
        type: "",
      };
    }
    return this;
  };
}

class DataHandler {
  constructor(className) {
    this.class = psm_profile["DataHandler"];
    this.class.$anchor = className;
    this.associations = {
      uses: psm_profile["uses"].properties["uses"],
      isUsed: psm_profile["isUsed"].properties["isUsed"],
      updates: psm_profile["updates"].properties["updates"],
      handle: psm_profile["handle"].properties["handle"],
      isTriggered: psm_profile["isTriggered"].properties["isTriggered"],
    };
  }

  addAssociation_uses = () => {
    this.class.properties.uses = this.associations["uses"];
    return this;
  };

  addAssociation_isUsed = () => {
    this.class.properties.isUsed = this.associations["isUsed"];
    return this;
  };

  addAssociation_updates = () => {
    this.class.properties.updates = this.associations["updates"];
    return this;
  };

  addAssociation_handle = () => {
    this.class.properties.handle = this.associations["handle"];
    return this;
  };

  addAssociation_isTriggered = () => {
    this.class.properties.isTriggered = this.associations["isTriggered"];
    return this;
  };

  mapAttributes_dataset = (class_dataset) => {
    this.class.properties.transformCRS = {
      type: {
        $ref: "#/$defs/Function",
      },
      default: {
        targetCRS: {
          type: "string",
          default: class_dataset.sourceCRS,
        },
      },
    };
    return this;
  };
}

class PostGIS {
  constructor(className) {
    this.class = psm_profile["PostGIS"];
    this.class.$anchor = className;
    this.associations = {
      extends: psm_profile["extends"].properties["extends"],
      transforms: psm_profile["transforms"].properties["transforms"],
    };
  }

  addAssociation_extends = () => {
    this.class.properties.extends = this.associations["extends"];
    return this;
  };

  addAssociation_transforms = () => {
    this.class.properties.transforms = this.associations["transforms"];
    return this;
  };
}

module.exports = { PostgreSQLDatabase, DataModel, DataHandler, PostGIS };
