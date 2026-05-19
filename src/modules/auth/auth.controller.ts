import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  login,
  register,
} from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";

function getRegisterValidationMessage(error: ZodError) {
  const roleIssue = error.issues.find((issue) => issue.path[0] === "role");

  if (roleIssue) {
    return "Role must be CANDIDATE or EMPLOYER";
  }

  return error.issues[0]?.message || "Validation failed";
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await register(data);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: getRegisterValidationMessage(error),
      });
      return;
    }

    if (error instanceof EmailAlreadyExistsError) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data);

    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}
