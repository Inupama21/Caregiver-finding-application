import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import datasource from "./config/database";
import paymentRoutes from "./routes/paymentRoutes";
import 'dotenv/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware

app.use(
  cors({
    origin: ["http://192.168.176.11:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Payment Service" });
});

// Initialize database and start server
datasource.initialize()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
    process.exit(1);
  });
