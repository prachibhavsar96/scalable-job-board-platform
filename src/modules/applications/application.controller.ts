import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../auth/auth.middleware";
import {
  ApplicationForbiddenError,
  ApplicationNotFoundError,
  createApplication,
  getApplications,
  getApplicationsByEmployerId,
  getApplicationsForCandidate,
  getApplicationsByUserId,
  withdrawApplicationForCandidate,
  updateApplicationStatusForEmployer,
} from "./application.service";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "./application.validation";

export async function createApplicationController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createApplicationSchema.parse(req.body);

    if (!req.file) {
      res.status(400).json({
        status: "ERROR",
        message: "Resume file is required",
      });
      return;
    }

    const application = await createApplication({
      ...data,
      userId: req.user!.id,
      resumePath: `/uploads/resumes/${req.file.filename}`,
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        status: "ERROR",
        message: "Validation failed",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof ApplicationNotFoundError) {
      res.status(404).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message === "Only PDF files are allowed") {
      res.status(400).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const message =
        error instanceof Error ? error.message : "Unknown application error";

      res.status(500).json({
        status: "ERROR",
        message,
      });
      return;
    }

    next(error);
  }
}

export async function getApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applications = await getApplications();

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function getApplicationsByUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      res.status(400).json({ message: "User id must be a number" });
      return;
    }

    const applications = await getApplicationsByUserId(userId);

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function getMyApplicationsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const applications = await getApplicationsForCandidate(req.user!.id);

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function withdrawApplicationController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = Number(req.params.id);

    if (Number.isNaN(applicationId)) {
      res.status(400).json({ message: "Application id must be a number" });
      return;
    }

    const application = await withdrawApplicationForCandidate(
      applicationId,
      req.user!.id
    );

    res.json({
      success: true,
      message: "Application withdrawn successfully.",
      data: application,
    });
  } catch (error) {
    if (error instanceof ApplicationNotFoundError) {
      res.status(404).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    if (error instanceof ApplicationForbiddenError) {
      res.status(403).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

export async function getEmployerApplicationsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const applications = await getApplicationsByEmployerId(req.user!.id);

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatusController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = Number(req.params.id);

    if (Number.isNaN(applicationId)) {
      res.status(400).json({ message: "Application id must be a number" });
      return;
    }

    const data = updateApplicationStatusSchema.parse(req.body);
    const application = await updateApplicationStatusForEmployer(
      applicationId,
      req.user!.id,
      data
    );

    res.json(application);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        status: "ERROR",
        message: "Validation failed",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof ApplicationNotFoundError) {
      res.status(404).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    if (error instanceof ApplicationForbiddenError) {
      res.status(403).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    next(error);
  }
}
