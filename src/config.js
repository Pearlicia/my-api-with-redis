const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("swagger.yaml");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "VOLCANOE API",
            version: "1.0.0",
            description: "An Express Volcanoe API",
        },
    },
    
};



module.exports = { swaggerServe: swaggerUI.serve, swaggerSetup: swaggerUI.setup(swaggerJSDocs,options), specs: swaggerJSDocs };