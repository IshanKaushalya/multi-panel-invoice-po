const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    vatNo: { type: String, default: "" }, // Optional field
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", supplierSchema);
