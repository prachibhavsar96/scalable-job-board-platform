import { NextFunction, Request, Response } from "express";
import { createUser, getUsers } from "./user.service";
import { createUserSchema } from "./user.validation";

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUser(data);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
}
