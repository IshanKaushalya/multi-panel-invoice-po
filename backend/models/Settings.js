const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: "MULTI ENGINEERING SERVICES LANKA (PVT) LTD",
    },
    companyAddress: {
      type: String,
      default: "No.466/7A Thapowanaya Road, Aggona, Angoda",
    },
    companyPhone: { type: String, default: "0777791772/0771118034" },
    companyEmail: { type: String, default: "newmultiengineering@gmail.com" },
    vatRate: { type: Number, required: true, default: 18 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
