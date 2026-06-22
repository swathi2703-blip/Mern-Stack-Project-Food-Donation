import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan"; 
import connectDB from "./db/connectDB.js";
import { config } from "./config.js";

// Import Food Matching Routers
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import donationRouter from "./routes/donationRouter.js"; 
import adminRouter from "./routes/adminRouter.js";
import aiRouter from "./routes/aiRouter.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mern-stack-project-food-donation.onrender.com'
];

const envOrigins = config.CORS_ORIGINS
  ? config.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

app.use(morgan("dev")); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
connectDB();

// API Routes for Food Matching
app.get("/api/test", (req, res) => res.json({ message: "API is working" }));

app.use("/api/auth", authRouter);       // Login/Signup
app.use("/api/user", userRouter);       // User Profiles
app.use("/api/donations", donationRouter); // Post & Get Surplus Food
app.use("/api/admin", adminRouter);    // Admin Dashboard
app.use("/api/ai", aiRouter);          // AI Smart Matching

// 404 handler for API routes - catches anything starting with /api
app.use("/api", (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// SPA Catch-all - Should be last
app.get("*", (req, res) => { 
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html")) 
});

app.listen(config.PORT, () => console.log(`Donor Platon Server on PORT: ${config.PORT}`));