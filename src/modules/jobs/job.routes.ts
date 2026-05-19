import { Router } from "express";
import {
  createJobController,
  getEmployerJobsController,
  getJobByIdController,
  getJobsController,
  updateJobController,
} from "./job.controller";
import { authenticate, authorize } from "../auth/auth.middleware";

const router = Router();

router.post("/", authenticate, authorize("EMPLOYER"), createJobController);
router.put("/:id", authenticate, authorize("EMPLOYER"), updateJobController);
router.get("/", getJobsController);
router.get(
  "/employer/my-jobs",
  authenticate,
  authorize("EMPLOYER"),
  getEmployerJobsController
);
router.get("/:id", getJobByIdController);

export default router;
