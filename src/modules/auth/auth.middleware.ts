import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "development-secret-change-me";
}

function sendSessionExpiredResponse(res: Response) {
  res.status(401).json({
    success: false,
    message: "Session expired. Please login again.",
  });
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as AuthUser;

  return (
    typeof payload.id === "number" &&
    typeof payload.email === "string" &&
    (payload.role === "CANDIDATE" || payload.role === "EMPLOYER")
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!isAuthUser(decoded)) {
      sendSessionExpiredResponse(res);
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    sendSessionExpiredResponse(res);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      });
      return;
    }

    next();
  };
}
