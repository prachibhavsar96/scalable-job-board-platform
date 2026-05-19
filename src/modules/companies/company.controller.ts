import { NextFunction, Request, Response } from "express";
import { clearCacheByPrefix, isRedisEnabled } from "../../config/redis";
import { AuthRequest } from "../auth/auth.middleware";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  getCompaniesByEmployerId,
  updateCompany,
} from "./company.service";
import { createCompanySchema, updateCompanySchema } from "./company.validation";

const JOBS_CACHE_PREFIX = "jobs:";

async function clearJobsCache() {
  if (!isRedisEnabled) {
    return;
  }

  try {
    await clearCacheByPrefix(JOBS_CACHE_PREFIX);
  } catch (error) {
    console.error("Failed to clear jobs cache:", error);
  }
}

export async function createCompanyController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createCompanySchema.parse(req.body);
    const company = await createCompany(data, req.user!.id);

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
}

export async function getCompaniesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companies = await getCompanies();

    res.json(companies);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Company id must be a number" });
      return;
    }

    const company = await getCompanyById(id);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
}

export async function getMyCompaniesController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const companies = await getCompaniesByEmployerId(req.user!.id);

    res.json(companies);
  } catch (error) {
    next(error);
  }
}

export async function updateCompanyController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Company id must be a number" });
      return;
    }

    const data = updateCompanySchema.parse(req.body);
    const company = await updateCompany(id, data, req.user!.id);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    await clearJobsCache();

    res.json(company);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next(error);
  }
}
