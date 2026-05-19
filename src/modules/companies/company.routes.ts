import { Router } from "express";
import {
  createCompanyController,
  getCompaniesController,
  getCompanyByIdController,
  getMyCompaniesController,
  updateCompanyController,
} from "./company.controller";
import { authenticate, authorize } from "../auth/auth.middleware";

const router = Router();

router.post("/", authenticate, authorize("EMPLOYER"), createCompanyController);
router.put("/:id", authenticate, authorize("EMPLOYER"), updateCompanyController);
router.get(
  "/my-companies",
  authenticate,
  authorize("EMPLOYER"),
  getMyCompaniesController
);
router.get("/", getCompaniesController);
router.get("/:id", getCompanyByIdController);

export default router;
