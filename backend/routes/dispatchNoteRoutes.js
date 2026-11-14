const express = require("express");
const router = express.Router();
const DispatchNote = require("../models/DispatchNote");

// VIEW all dispatch notes
router.get("/", async (req, res) => {
  try {
    const dispatchNotes = await DispatchNote.find()
      .populate("invoiceId", "customer") // Optional: pulls in invoice context if needed later
      .sort({ createdAt: -1 });
    res.json(dispatchNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VIEW a single dispatch note by ID
router.get("/:id", async (req, res) => {
  try {
    const dispatchNote = await DispatchNote.findById(req.params.id).populate({
      path: "invoiceId",
      populate: { path: "customer", strictPopulate: false },
    });
    if (!dispatchNote)
      return res.status(404).json({ message: "Dispatch Note not found" });
    res.json(dispatchNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a dispatch note (typically happens if an invoice is canceled)
router.delete("/:id", async (req, res) => {
  try {
    const deletedNote = await DispatchNote.findByIdAndDelete(req.params.id);
    if (!deletedNote)
      return res.status(404).json({ message: "Dispatch Note not found" });
    res.json({ message: "Dispatch Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
