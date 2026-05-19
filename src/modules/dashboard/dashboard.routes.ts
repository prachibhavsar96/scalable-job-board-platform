import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
  getEmployerStatsController,
  getPublicStatsController,
} from "./dashboard.controller";

const router = Router();

router.get("/public-stats", getPublicStatsController);

router.get(
  "/employer-stats",
  authenticate,
  authorize("EMPLOYER"),
  getEmployerStatsController
);

export default router;
