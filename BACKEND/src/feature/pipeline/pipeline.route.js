import express from "express";
import PipelineController from "./pipeline.controller.js";
import {
  pipelineCreateValidator,
  pipelineUpdateValidator,
  pipelineIdValidator,
} from "./pipeline.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();
const pipelineController = new PipelineController();

// All routes require authentication
router.use(authenticate);

// Create a new pipeline (admin only)
router.post(
  "/",
  authorize(["admin"]),
  pipelineCreateValidator,
  pipelineController.createPipeline.bind(pipelineController)
);

// Get all pipelines for the company
router.get(
  "/",
  authorize(["admin", "sales_rep"]),
  pipelineController.getPipelinesByCompany.bind(pipelineController)
);

// Get default pipeline for the company
router.get(
  "/default",
  authorize(["admin", "sales_rep"]),
  pipelineController.getDefaultPipeline.bind(pipelineController)
);

// Get pipeline by ID
router.get(
  "/:id",
  authorize(["admin", "sales_rep"]),
  pipelineIdValidator,
  pipelineController.getPipelineById.bind(pipelineController)
);

// Update pipeline (admin only)
router.put(
  "/:id",
  authorize(["admin"]),
  pipelineIdValidator,
  pipelineUpdateValidator,
  pipelineController.updatePipeline.bind(pipelineController)
);

// Delete pipeline (admin only)
router.delete(
  "/:id",
  authorize(["admin"]),
  pipelineIdValidator,
  pipelineController.deletePipeline.bind(pipelineController)
);

// Set pipeline as default (admin only)
router.put(
  "/:id/set-default",
  authorize(["admin"]),
  pipelineIdValidator,
  pipelineController.setDefaultPipeline.bind(pipelineController)
);

export default router;
