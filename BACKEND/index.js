import express from "express";
import companyRouter from "./src/feature/company/company.route.js";
import userRouter from "./src/feature/user/user.route.js";
import authRouter from "./src/feature/auth/auth.route.js";
import pipelineRouter from "./src/feature/pipeline/pipeline.route.js";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors());

app.use(express.json());

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/pipelines", pipelineRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || null,
    stack: statusCode == 500 ? err.stack : null,
  });
});

export default app;
