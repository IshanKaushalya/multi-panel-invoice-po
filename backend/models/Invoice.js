const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unitType: { type: String, required: true }, // e.g., kg, pcs, box
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

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // e.g., "YYYY-MM-DD"
    time: { type: String, required: true }, // e.g., "HH:MM AM/PM"

    // Reference to the Customer collection
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["cash", "cheque", "online", "credit"],
      required: true,
    },

    // Optional reference numbers & overall invoice remarks
    quotationNo: { type: String, default: "" },
    purchasingNo: { type: String, default: "" },
    advanceNo: { type: String, default: "" },
    remarks: { type: String, default: "" },

    // Line items
    items: [invoiceItemSchema],

    // Financial Totals
    billTotal: { type: Number, required: true }, // Sum of item totals
    billDiscount: { type: Number, default: 0 }, // Percentage discount
    advancePaymentDeduction: { type: Number, default: 0 },

    // VAT handling
    isVatApplied: { type: Boolean, default: false },
    vatAmount: { type: Number, default: 0 },

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

module.exports = mongoose.model("Invoice", invoiceSchema);
