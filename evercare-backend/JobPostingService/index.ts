import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import route from "./src/route/route";
import notificationRoute from "./src/route/notificationRoute";
import dataSource from "./src/config/config";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Add debugging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Request body:", req.body);
  next();
});

app.use("/jobposting", route);
app.use("/notifications", notificationRoute);

dataSource
  .initialize()
  .then(() => {
    console.log("JobPostingService database connected");

    app.listen(process.env.JOBPOSTING_SERVICE_PORT || 5003, () => {
      console.log(
        `job posting service is running on port ${
          process.env.JOBPOSTING_SERVICE_PORT || 5003
        }`
      );
    });
  })
  .catch((err) => {
    console.error(" Error connecting to database:", err);
    process.exit(1);
  });

export default app;
