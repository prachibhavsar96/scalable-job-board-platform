import { Router } from "express";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { loginController, registerController } from "./auth.controller";

const router = Router();

router.post("/register", authRateLimiter, registerController);
router.post("/login", authRateLimiter, loginController);

export default router;
