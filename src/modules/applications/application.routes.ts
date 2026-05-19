import { Router } from "express";
import {
  createApplicationController,
  getEmployerApplicationsController,
  getApplicationsByUserIdController,
  getApplicationsController,
  getMyApplicationsController,
  withdrawApplicationController,
  updateApplicationStatusController,
} from "./application.controller";
import { authenticate, authorize } from "../auth/auth.middleware";
import { resumeUpload } from "../../middleware/resumeUpload.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CANDIDATE"),
  resumeUpload.single("resume"),
  createApplicationController
);
router.get(
  "/employer/received",
  authenticate,
  authorize("EMPLOYER"),
  getEmployerApplicationsController
);
router.get(
  "/user/me",
  authenticate,
  authorize("CANDIDATE"),
  getMyApplicationsController
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("EMPLOYER"),
  updateApplicationStatusController
);
router.delete(
  "/:id",
  authenticate,
  authorize("CANDIDATE"),
  withdrawApplicationController
);
router.get("/", getApplicationsController);
router.get("/user/:userId", getApplicationsByUserIdController);

export default router;
