import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
  getMySavedJobsController,
  removeSavedJobController,
  saveJobController,
} from "./savedJob.controller";

const router = Router();

router.post("/:jobId", authenticate, authorize("CANDIDATE"), saveJobController);
router.get("/me", authenticate, authorize("CANDIDATE"), getMySavedJobsController);
router.delete(
  "/:jobId",
  authenticate,
  authorize("CANDIDATE"),
  removeSavedJobController
);

export default router;
