const mongoose = require("mongoose");

const VolcanoeSchema = new mongoose.Schema(
  {
    Region: { type: String},
    Number: { type: String },
    Volcanoe_Name: { type: String },
    Country: { type: String }, 
    Location: { type: String }, 
    Latitude: { type: String }, 
    Longitude: { type: String },    
    Elevation: { type: String },    
    Type: { type: String },  
    Status: { type: String },    
  },
  { timestamps: true }
);

module.exports = mongoose.model("volcanoe", VolcanoeSchema);