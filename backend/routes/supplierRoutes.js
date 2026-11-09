const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

// ADD a new supplier
router.post("/", async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    const savedSupplier = await newSupplier.save();
    res.status(201).json({
      message: "Supplier added successfully",
      supplier: savedSupplier,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A supplier with this email already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

// VIEW all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VIEW a single supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EDIT a supplier
router.put("/:id", async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedSupplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json({
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
