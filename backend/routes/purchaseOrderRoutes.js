const express = require("express");
const router = express.Router();
const PurchaseOrder = require("../models/PurchaseOrder");

// GENERATE a new PO
router.post("/", async (req, res) => {
  try {
    const isCredit = req.body.paymentType === "credit";
    const grandTotal = Number(req.body.grandTotal || 0);

    const newPO = new PurchaseOrder({
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

    const savedPO = await newPO.save();
    res.status(201).json({
      message: "Purchase Order generated successfully",
      purchaseOrder: savedPO,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A Purchase Order with this PO No. already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

// VIEW all POs
router.get("/", async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("supplier", "name email telephone address vatNo")
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GENERATE PO REPORTS
// Query parameters: ?startDate=2026-01-01&endDate=2026-12-31, ?month=2026-11, ?year=2026, ?supplierId=..., ?paymentType=..., ?productType=...
router.get("/report", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      month,
      year,
      supplierId,
      paymentType,
      productType,
    } = req.query;
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

    // 4. Supplier-wise Filter (Equivalent to customer-wise for POs)
    if (supplierId) {
      query.supplier = supplierId;
    }

    // 5. Payment Type-wise Filter
    if (paymentType) {
      query.paymentType = paymentType;
    }

    // 6. Product Type-wise Filter
    if (productType) {
      query.productType = productType;
    }

    // Execute the query
    const reportData = await PurchaseOrder.find(query)
      .populate("supplier", "name email telephone address")
      .sort({ date: -1, time: -1 });

    // Calculate Summary Metrics for the Report
    const totalPOs = reportData.length;
    const totalSpend = reportData.reduce((sum, po) => sum + po.grandTotal, 0);
    const totalVAT = reportData.reduce((sum, po) => sum + po.vatAmount, 0);

    res.json({
      message: "PO Report generated successfully",
      summary: {
        totalPOs,
        totalSpend, // Represents outbound money instead of revenue
        totalVAT,
      },
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET next available purchase order number
router.get("/next-po-no", async (req, res) => {
  try {
    const lastPO = await PurchaseOrder.findOne().sort({ createdAt: -1 });
    let nextNo = "MEPPO-00001"; // Default starting number

    if (lastPO && lastPO.poNo && lastPO.poNo.startsWith("MEPPO-")) {
      const lastNumber = parseInt(lastPO.poNo.replace("MEPPO-", ""), 10);
      if (!isNaN(lastNumber)) {
        nextNo = `MEPPO-${String(lastNumber + 1).padStart(5, "0")}`;
      }
    }

    res.json({ nextPoNo: nextNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RECORD A PAYMENT FOR A CREDIT PURCHASE ORDER
router.post("/:id/pay", async (req, res) => {
  try {
    const { amount, method } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    const payAmount = Number(amount || 0);
    if (payAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const currentPaid =
      po.paidAmount !== undefined
        ? Number(po.paidAmount)
        : po.paymentType === "credit"
          ? 0
          : Number(po.grandTotal);

    const newPaidAmount = currentPaid + payAmount;
    const remaining = Number(po.grandTotal) - newPaidAmount;

    po.paidAmount = newPaidAmount;
    po.paymentHistory.push({
      amount: payAmount,
      method,
      date: new Date().toISOString().split("T")[0],
    });

    if (remaining <= 0.01) {
      po.paidAmount = po.grandTotal;
      po.paymentStatus = "paid";
      po.paymentType = method;
    } else {
      po.paymentStatus = "credit";
    }

    await po.save();

    const populatedPO = await PurchaseOrder.findById(po._id).populate(
      "supplier",
      "name email telephone address vatNo",
    );

    res.json(populatedPO);
  } catch (error) {
    console.error("Error processing PO payment:", error);
    res.status(400).json({ message: error.message });
  }
});

// VIEW a single PO by ID
router.get("/:id", async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id).populate(
      "supplier",
      "name email telephone address vatNo",
    );
    if (!po)
      return res.status(404).json({ message: "Purchase Order not found" });
    res.json(po);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EDIT a PO
router.put("/:id", async (req, res) => {
  try {
    const existingPO = await PurchaseOrder.findById(req.params.id);
    if (!existingPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    const newGrandTotal = Number(req.body.grandTotal ?? existingPO.grandTotal);
    const newPaymentType = req.body.paymentType || existingPO.paymentType;

    let updatedPaidAmount = existingPO.paidAmount ?? 0;
    let updatedPaymentStatus = existingPO.paymentStatus || "paid";

    if (newPaymentType !== "credit") {
      updatedPaidAmount = newGrandTotal;
      updatedPaymentStatus = "paid";
    } else {
      if (existingPO.paymentType !== "credit") {
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

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true },
    ).populate("supplier", "name email telephone");

    if (!updatedPO)
      return res.status(404).json({ message: "Purchase Order not found" });

    res.json({
      message: "Purchase Order updated successfully",
      purchaseOrder: updatedPO,
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE a PO
router.delete("/:id", async (req, res) => {
  try {
    const deletedPO = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deletedPO)
      return res.status(404).json({ message: "Purchase Order not found" });
    res.json({ message: "Purchase Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
