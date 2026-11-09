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

// Allowed Origins (Localhost + your Vercel deployment URL)
const allowedOrigins = [
  "http://localhost:5173",
  "https://multi-panel-invoice-po.vercel.app", // Replace or add your exact Vercel URL if different
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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
