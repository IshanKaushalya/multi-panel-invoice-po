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

// Robust CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Allow non-browser requests (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      // 2. Allow local development
      if (
        origin === "http://localhost:5173" ||
        origin === "http://localhost:3000"
      ) {
        return callback(null, true);
      }

      // 3. Allow all Vercel domains and previews for your project
      if (
        origin.endsWith(".vercel.app") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Blocked by CORS policy"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dispatch-notes", dispatchNoteRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/settings", settingsRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Multi-Panel Invoice PO API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
