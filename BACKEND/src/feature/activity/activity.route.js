import express from "express";
import ActivityController from "./activity.controller.js";
import {
  validateCreateActivity,
  validateUpdateActivity,
  validateActivityId,
  validateQueryParams,
} from "./activity.validator.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();
const activityController = new ActivityController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new activity
router.post("/", validateCreateActivity, (req, res, next) =>
  activityController.createActivity(req, res, next)
);

// Get all activities with pagination and filters
router.get("/", validateQueryParams, (req, res, next) =>
  activityController.getActivities(req, res, next)
);

// Get activities for a specific deal
router.get("/deal/:id", (req, res, next) =>
  activityController.getActivitiesByDeal(req, res, next)
);

// Get activities for a specific contact
router.get("/contact/:id", (req, res, next) =>
  activityController.getActivitiesByContact(req, res, next)
);

// Get a single activity by ID
router.get("/:id", validateActivityId, (req, res, next) =>
  activityController.getActivityById(req, res, next)
);

// Update an activity
router.put(
  "/:id",
  validateActivityId,
  validateUpdateActivity,
  (req, res, next) => activityController.updateActivity(req, res, next)
);

// Delete an activity
router.delete("/:id", validateActivityId, (req, res, next) =>
  activityController.deleteActivity(req, res, next)
);

export default router;
