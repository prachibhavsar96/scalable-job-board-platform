import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import {
  clearCacheByPrefix,
  getCache,
  isRedisEnabled,
  setCache,
} from "../../config/redis";
import { AuthRequest } from "../auth/auth.middleware";
import {
  createJob,
  getJobById,
  getJobs,
  getJobsByEmployerId,
  updateJob,
} from "./job.service";
import { createJobSchema, getJobsQuerySchema, updateJobSchema } from "./job.validation";

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

async function getJobsFromCache(cacheKey: string) {
  if (!isRedisEnabled) {
    return null;
  }

  try {
    const cachedJobs = await getCache(cacheKey);

    return cachedJobs ? JSON.parse(cachedJobs) : null;
  } catch (error) {
    console.error("Failed to read jobs cache:", error);
    return null;
  }
}

async function saveJobsToCache(cacheKey: string, jobs: unknown) {
  if (!isRedisEnabled) {
    return;
  }

  try {
    await setCache(cacheKey, jobs, env.jobsCacheTtlSeconds);
  } catch (error) {
    console.error("Failed to save jobs cache:", error);
  }
}

export async function createJobController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createJobSchema.parse(req.body);
    const job = await createJob(data);

    await clearJobsCache();

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
}

export async function getJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cacheKey = `${JOBS_CACHE_PREFIX}${req.originalUrl}`;
    const cachedJobs = await getJobsFromCache(cacheKey);

    if (cachedJobs) {
      res.setHeader("X-Cache", "HIT");
      res.json(cachedJobs);
      return;
    }

    const query = getJobsQuerySchema.parse(req.query);
    const jobs = await getJobs(query);

    await saveJobsToCache(cacheKey, jobs);

    if (isRedisEnabled) {
      res.setHeader("X-Cache", "MISS");
    }

    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

export async function getEmployerJobsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const jobs = await getJobsByEmployerId(req.user!.id);

    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

export async function getJobByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Job id must be a number" });
      return;
    }

    const job = await getJobById(id);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
}

export async function updateJobController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Job id must be a number" });
      return;
    }

    const data = updateJobSchema.parse(req.body);
    const job = await updateJob(id, data, req.user!.id);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    await clearJobsCache();

    res.json(job);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (error instanceof Error && error.message === "Company not found") {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    next(error);
  }
}
