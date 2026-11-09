const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unitType: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  itemTotal: { type: Number, required: true },
});

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["cash", "online", "cheque"],
    required: true,
  },
  date: { type: String, required: true },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNo: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:MM AM/PM"

    // Reference to the Supplier collection
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    productType: {
      type: String,
      enum: ["powder coat", "metal", "electrical", "wood", "glass", "other"],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["cash", "cheque", "online", "credit"],
      required: true,
    },

    remarks: { type: String, default: "" },

    // Line items
    items: [poItemSchema],

    // Financial Totals
    billTotal: { type: Number, required: true },
    billDiscount: { type: Number, default: 0 },
    advancePaymentDeduction: { type: Number, default: 0 },

    // VAT handling
    isVatApplied: { type: Boolean, default: false },
    vatAmount: { type: Number, default: 0 }, // 18% if applied

    grandTotal: { type: Number, required: true },

    // Payment & Credit Tracking
    paidAmount: {
      type: Number,
      default: function () {
        return this.paymentType === "credit" ? 0 : this.grandTotal;
      },
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "credit"],
      default: function () {
        return this.paymentType === "credit" ? "credit" : "paid";
      },
    },
    paymentHistory: [paymentHistorySchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
