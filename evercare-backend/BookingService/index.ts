import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bookingRoutes from "./src/route/bookingRoute";          
import dataSource from "./src/config/config";      
import dotenv from "dotenv";

dotenv.config();


const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:8081", "http://localhost:19006", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use("/bookings", bookingRoutes);


dataSource.initialize()
  .then(() => {
    console.log("Booking service database connected");

    app.listen(process.env.BOOKING_SERVICE_PORT || 5002, () => {
      console.log(`Booking service is running on port ${process.env.BOOKING_SERVICE_PORT || 5002}`);
    });
  })
  .catch((err) => {
    console.error(" Error connecting to database:", err);
    process.exit(1);
  });

export default app; 


// import express, { Application } from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import bookingRoutes from "./route/bookingRoute";
// import dataSource from "./config/config";
// import dotenv from "dotenv";

// dotenv.config();

// const app: Application = express();

// // CORS configuration
// app.use(
//   cors({
//     origin: [
//       "http://localhost:8081",
//       "http://localhost:19006",
//       "http://localhost:3000",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());
// app.use(bodyParser.json());

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     service: "BookingService",
//     timestamp: new Date().toISOString(),
//     port: process.env.BOOKING_SERVICE_PORT || 5002,
//   });
// });

// // API documentation
// app.get("/", (req, res) => {
//   res.json({
//     service: "BookingService",
//     version: "1.0.0",
//     description: "Booking management microservice",
//     endpoints: {
//       health: "/health",
//       bookings: "/bookings/*",
//     },
//   });
// });

// // Mount booking routes
// app.use("/bookings", bookingRoutes);

// // Error handling middleware
// app.use(
//   (
//     err: any,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     console.error("BookingService Error:", err.stack);
//     res.status(500).json({
//       error: "BookingService Error",
//       message: err.message,
//     });
//   }
// );

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     error: "Route not found in BookingService",
//     path: req.originalUrl,
//   });
// });

// const PORT = Number(process.env.BOOKING_SERVICE_PORT) || 5002;

// // Initialize database and start server
// dataSource
//   .initialize()
//   .then(() => {
//     console.log("✅ BookingService database connected successfully");
//     app.listen(PORT, () => {
//       console.log(`🚀 BookingService running on port ${PORT}`);
//       console.log(`📊 Health check: http://localhost:${PORT}/health`);
//       console.log(`📚 API docs: http://localhost:${PORT}/`);
//     });
//   })
//   .catch((error) => {
//     console.error("❌ Error connecting BookingService to database:", error);
//     process.exit(1);
//   });

// export default app;
