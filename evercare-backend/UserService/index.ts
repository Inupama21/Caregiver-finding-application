import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import careseekerRoutes from "./src/route/careseekerRoutes";
import caregiverRoutes from "./src/route/caregiverRoutes";
import careseekerProfileRoutes from "./src/route/careseekerProfileRoutes";
import caregiverProfileRoutes, {
  postsRouter,
} from "./src/route/caregiverProfieRoutes";
import dataSource from "../UserService/src/config/config";
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

app.use(express.json({ limit: "10mb" })); // Increased limit for base64 images
app.use(bodyParser.json({ limit: "10mb" }));

// Static file serving for uploads (if needed later)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route handlers
app.use("/careseeker", careseekerRoutes);
app.use("/caregiver", caregiverRoutes);
app.use("/careseeker-profile", careseekerProfileRoutes);
app.use("/caregiverProfile", caregiverProfileRoutes);
app.use("/caregiverPosts", postsRouter);

dataSource
  .initialize()
  .then(() => {
    console.log("UserService database connected");

    app.listen(process.env.USER_SERVICE_PORT || 5001, () => {
      console.log(
        `UserService is running on port ${
          process.env.USER_SERVICE_PORT || 5001
        }`
      );
    });
  })
  .catch((err) => {
    console.error(" Error connecting to database:", err);
    process.exit(1);
  });

export default app;

