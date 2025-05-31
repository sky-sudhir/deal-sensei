import express from "express";
import AuthController from "./auth.controller.js";
import {
  loginValidator,
  companySignupValidator,
  resendVerificationValidator
} from "./auth.validator.js";

const router = express.Router();
const authController = new AuthController();

// Login route
router.post(
  "/login",
  loginValidator,
  authController.login.bind(authController)
);

// Logout route
router.post(
  "/logout",
  authController.logout.bind(authController)
);

// Verify email route
router.get(
  "/verify-email/:token",
  authController.verifyEmail.bind(authController)
);

// Resend verification email
router.post(
  "/resend-verification",
  resendVerificationValidator,
  authController.resendVerificationEmail.bind(authController)
);

export default router;
