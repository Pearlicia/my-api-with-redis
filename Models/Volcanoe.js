const mongoose = require("mongoose");

const VolcanoeSchema = new mongoose.Schema(
  {
    name: { type: String},
    subregion: { type: String },
    volcanoe_type: { type: String },
    evidence: { type: String },    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volcanoe", VolcanoeSchema);