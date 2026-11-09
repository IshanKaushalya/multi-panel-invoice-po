const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// ADD a new customer
router.post("/", async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json({
      message: "Customer added successfully",
      customer: savedCustomer,
    });
  } catch (error) {
    // Handle duplicate email error specifically
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A customer with this email already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

// VIEW all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }); // Newest first
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VIEW a single customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EDIT a customer
router.put("/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }, // Returns the updated document and runs schema rules
    );

    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
