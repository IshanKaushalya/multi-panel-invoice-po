const mongoose = require("mongoose");

const dispatchItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unitType: { type: String, default: "NOS" },
  quantity: { type: Number, required: true },
});

const dispatchNoteSchema = new mongoose.Schema(
  {
    dispatchNo: { type: String, required: true, unique: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    invoiceNo: { type: String, required: true },
    purchasingNo: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    remarks: { type: String, default: "" },
    items: [dispatchItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("DispatchNote", dispatchNoteSchema);
