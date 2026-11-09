const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const DispatchNote = require("../models/DispatchNote");

// GENERATE a new invoice
router.post("/", async (req, res) => {
  try {
    const isCredit = req.body.paymentType === "credit";
    const grandTotal = Number(req.body.grandTotal || 0);

    // 1. Create and save the Invoice (setting payment & credit tracking fields)
    const newInvoice = new Invoice({
      ...req.body,
      remarks: req.body.remarks || "",
      paidAmount: isCredit ? 0 : grandTotal,
      paymentStatus: isCredit ? "credit" : "paid",
      paymentHistory: isCredit
        ? []
        : [
            {
              amount: grandTotal,
              method: req.body.paymentType,
              date: req.body.date || new Date().toISOString().split("T")[0],
            },
          ],
    });
    const savedInvoice = await newInvoice.save();

    // 2. Automatically format data for the Dispatch Note
    const dispatchItems = savedInvoice.items.map((item) => ({
      description: item.description,
      unitType: item.unitType || "NOS",
      quantity: item.quantity,
    }));

    const newDispatchNote = new DispatchNote({
      dispatchNo: `DN-${savedInvoice.invoiceNo}`,
      invoiceId: savedInvoice._id,
      invoiceNo: savedInvoice.invoiceNo,
      purchasingNo: savedInvoice.purchasingNo || "",
      date: savedInvoice.date,
      time: savedInvoice.time,
      remarks: savedInvoice.remarks || "",
      items: dispatchItems,
    });

    // 3. Save the Dispatch Note
    const savedDispatchNote = await newDispatchNote.save();

    // 4. Return both documents to the frontend
    res.status(201).json({
      message: "Invoice and Dispatch Note generated successfully",
      invoice: savedInvoice,
      dispatchNote: savedDispatchNote,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "An invoice with this Invoice No. already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

// VIEW all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer", "name email telephone address vatNo")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GENERATE INVOICE REPORTS
router.get("/report", async (req, res) => {
  try {
    const { startDate, endDate, month, year, customerId, paymentType } =
      req.query;
    let query = {};

    // 1. Date Range Filter
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    // 2. Monthly Filter (Expects format "YYYY-MM")
    else if (month) {
      query.date = { $regex: new RegExp(`^${month}`) };
    }
    // 3. Annual Filter (Expects format "YYYY")
    else if (year) {
      query.date = { $regex: new RegExp(`^${year}`) };
    }

    // 4. Customer-wise Filter
    if (customerId) {
      query.customer = customerId;
    }

    // 5. Payment Type-wise Filter
    if (paymentType) {
      query.paymentType = paymentType;
    }

    // Execute the query
    const reportData = await Invoice.find(query)
      .populate("customer", "name email telephone address")
      .sort({ date: -1, time: -1 });

    // Calculate Summary Metrics for the Report
    const totalInvoices = reportData.length;
    const totalRevenue = reportData.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0,
    );
    const totalVAT = reportData.reduce(
      (sum, invoice) => sum + invoice.vatAmount,
      0,
    );

    res.json({
      message: "Report generated successfully",
      summary: {
        totalInvoices,
        totalRevenue,
        totalVAT,
      },
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET next available invoice number
router.get("/next-invoice-no", async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNo = "INVMEP-00001";

    if (
      lastInvoice &&
      lastInvoice.invoiceNo &&
      lastInvoice.invoiceNo.startsWith("INVMEP-")
    ) {
      const lastNumber = parseInt(
        lastInvoice.invoiceNo.replace("INVMEP-", ""),
        10,
      );
      if (!isNaN(lastNumber)) {
        nextNo = `INVMEP-${String(lastNumber + 1).padStart(5, "0")}`;
      }
    }

    res.json({ nextInvoiceNo: nextNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RECORD A PAYMENT FOR A CREDIT INVOICE
router.post("/:id/pay", async (req, res) => {
  try {
    const { amount, method } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const payAmount = Number(amount || 0);
    if (payAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Safely determine current paid amount (compatible with older records)
    const currentPaid =
      invoice.paidAmount !== undefined
        ? Number(invoice.paidAmount)
        : invoice.paymentType === "credit"
          ? 0
          : Number(invoice.grandTotal);

    const newPaidAmount = currentPaid + payAmount;
    const remaining = Number(invoice.grandTotal) - newPaidAmount;

    invoice.paidAmount = newPaidAmount;
    invoice.paymentHistory.push({
      amount: payAmount,
      method,
      date: new Date().toISOString().split("T")[0],
    });

    // If fully settled, mark as paid and update paymentType to the final method used
    if (remaining <= 0.01) {
      invoice.paidAmount = invoice.grandTotal;
      invoice.paymentStatus = "paid";
      invoice.paymentType = method;
    } else {
      invoice.paymentStatus = "credit";
    }

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id).populate(
      "customer",
      "name email telephone address vatNo",
    );

    res.json(populatedInvoice);
  } catch (error) {
    console.error("Error processing invoice payment:", error);
    res.status(400).json({ message: error.message });
  }
});

// VIEW a single invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customer",
      "name email telephone address vatNo",
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update invoice by ID and automatically update linked Dispatch Note
router.put("/:id", async (req, res) => {
  try {
    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const newGrandTotal = Number(
      req.body.grandTotal ?? existingInvoice.grandTotal,
    );
    const newPaymentType = req.body.paymentType || existingInvoice.paymentType;

    let updatedPaidAmount = existingInvoice.paidAmount ?? 0;
    let updatedPaymentStatus = existingInvoice.paymentStatus || "paid";

    // Adjust paid status if paymentType or grandTotal was edited
    if (newPaymentType !== "credit") {
      updatedPaidAmount = newGrandTotal;
      updatedPaymentStatus = "paid";
    } else {
      // If switched from paid to credit, reset paidAmount to 0 unless partial payments exist
      if (existingInvoice.paymentType !== "credit") {
        updatedPaidAmount = 0;
      }
      updatedPaymentStatus =
        newGrandTotal - updatedPaidAmount <= 0.01 ? "paid" : "credit";
    }

    const updatePayload = {
      ...req.body,
      paidAmount: updatedPaidAmount,
      paymentStatus: updatedPaymentStatus,
    };

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true },
    );

    // Automatically map updated invoice items to dispatch items
    const dispatchItems = updatedInvoice.items.map((item) => ({
      description: item.description,
      unitType: item.unitType || "NOS",
      quantity: item.quantity,
    }));

    // Find and update the corresponding Dispatch Note
    await DispatchNote.findOneAndUpdate(
      { invoiceId: updatedInvoice._id },
      {
        invoiceNo: updatedInvoice.invoiceNo,
        purchasingNo: updatedInvoice.purchasingNo || "",
        remarks: updatedInvoice.remarks || "",
        items: dispatchItems,
      },
      { new: true, upsert: true },
    );

    res.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice & dispatch note:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE an invoice and its associated Dispatch Note (Cascade Delete)
router.delete("/:id", async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await DispatchNote.findOneAndDelete({ invoiceId: req.params.id });

    res.json({
      message: "Invoice and associated Dispatch Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
