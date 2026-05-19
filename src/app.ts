import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import morgan from "morgan";
import { ZodError } from "zod";
import { globalRateLimiter } from "./middleware/rateLimit.middleware";
import { responseTimeLogger } from "./middleware/responseTime.middleware";
import applicationRoutes from "./modules/applications/application.routes";
import authRoutes from "./modules/auth/auth.routes";
import companyRoutes from "./modules/companies/company.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import jobRoutes from "./modules/jobs/job.routes";
import savedJobRoutes from "./modules/savedJobs/savedJob.routes";
import userRoutes from "./modules/users/user.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(responseTimeLogger);
app.use(globalRateLimiter);
app.use("/uploads", express.static("uploads"));

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Job Board API is running",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/applications", applicationRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      status: "ERROR",
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File size must be less than 5MB"
          : err.message,
    });
    return;
  }

  if (err.message === "Only PDF files are allowed") {
    res.status(400).json({
      status: "ERROR",
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "ERROR",
      message: "Validation failed",
      errors: err.issues,
    });
    return;
  }

  res.status(500).json({
    status: "ERROR",
    message: "Something went wrong",
  });
});

export default app;
