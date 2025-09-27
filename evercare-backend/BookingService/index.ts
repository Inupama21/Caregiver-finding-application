import express, { Application } from "express";
import cors from "cors";
import bookingRoutes from "./src/route/bookingRoute";
import notificationRoutes from "./src/route/notificationRoute";          
// import paymentRoutes from "./src/route/paymentRoute";
// import { stripeWebhook } from "./src/controller/paymentController";
import dataSource from "./src/config/config";      
import dotenv from "dotenv";

dotenv.config();


const app: Application = express();

app.use(
  cors({
    origin: ["http://192.168.176.11:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// JSON parser for general routes
app.use(express.json());
app.use("/bookings", bookingRoutes);
app.use("/notifications", notificationRoutes);
// app.use("/payments", paymentRoutes);


dataSource.initialize()
  .then(() => {

    app.listen(process.env.BOOKING_SERVICE_PORT || 5002, () => {
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

export default app; 

