import { Router } from "express";
import { createUserController, getUsersController } from "./user.controller";

const router = Router();

router.post("/", createUserController);
router.get("/", getUsersController);

export default router;
