import "reflect-metadata";
import express from "express";
import cors from "cors";
import datasource from "./src/config/config";
import reviewRoutes from "./src/route/reviewRoutes";

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", reviewRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Review Service is running",
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await datasource.initialize();
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Review Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
