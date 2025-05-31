import express from "express";
import UserController from "./user.controller.js";
import {
  userCreateValidator,
  userUpdateValidator,
  userIdValidator,
} from "./user.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Routes accessible only to admin
router.post(
  "/",
  authorize(["admin"]),
  userCreateValidator,
  userController.createUser.bind(userController)
);

// Get all users in the company
router.get(
  "/",
  authorize(["admin", "sales_rep"]),
  userController.getUsersByCompany.bind(userController)
);

// Get user by ID
router.get(
  "/:id",
  authorize(["admin", "sales_rep"]),
  userIdValidator,
  userController.getUserById.bind(userController)
);

// Update user
router.put(
  "/:id",
  authorize(["admin", "sales_rep"]),
  userIdValidator,
  userUpdateValidator,
  userController.updateUser.bind(userController)
);

// Delete user (admin only)
router.delete(
  "/:id",
  authorize(["admin"]),
  userIdValidator,
  userController.deactivateUser.bind(userController)
);

// Deactivate user (admin only)
router.put(
  "/:id/deactivate",
  authorize(["admin"]),
  userIdValidator,
  userController.deactivateUser.bind(userController)
);

export default router;
