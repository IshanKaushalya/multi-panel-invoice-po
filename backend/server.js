require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dispatchNoteRoutes = require("./routes/dispatchNoteRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json()); // Parses incoming JSON requests

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process with failure
  });

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dispatch-notes", dispatchNoteRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/settings", settingsRoutes);

// Basic Health Check Route
app.get("/", (req, res) => {
  res.send("Multi-Panel Invoice PO API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
