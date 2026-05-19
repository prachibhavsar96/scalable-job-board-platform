import { NextFunction, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { getEmployerStats, getPublicStats } from "./dashboard.service";

export async function getPublicStatsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getPublicStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployerStatsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getEmployerStats(req.user!.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
