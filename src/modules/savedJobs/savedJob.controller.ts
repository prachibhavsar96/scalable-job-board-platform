import { NextFunction, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import {
  getSavedJobsForCandidate,
  removeSavedJobForCandidate,
  saveJobForCandidate,
  SavedJobJobNotFoundError,
  SavedJobNotFoundError,
} from "./savedJob.service";

function getJobId(value: string) {
  const jobId = Number(value);

  return Number.isNaN(jobId) ? null : jobId;
}

export async function saveJobController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = getJobId(req.params.jobId);

    if (!jobId) {
      res.status(400).json({ message: "Job id must be a number" });
      return;
    }

    const savedJob = await saveJobForCandidate(req.user!.id, jobId);

    res.status(201).json(savedJob);
  } catch (error) {
    if (error instanceof SavedJobJobNotFoundError) {
      res.status(404).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

export async function getMySavedJobsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const savedJobs = await getSavedJobsForCandidate(req.user!.id);

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
}

export async function removeSavedJobController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const jobId = getJobId(req.params.jobId);

    if (!jobId) {
      res.status(400).json({ message: "Job id must be a number" });
      return;
    }

    await removeSavedJobForCandidate(req.user!.id, jobId);

    res.json({
      success: true,
      message: "Saved job removed successfully.",
    });
  } catch (error) {
    if (error instanceof SavedJobNotFoundError) {
      res.status(404).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    next(error);
  }
}
