import express from "express";
import FileController from "./file.controller.js";
import {
  validateFileUpload,
  validateFileId,
  validateQueryParams,
} from "./file.validator.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../utils/s3Service.js";

const router = express.Router();
const fileController = new FileController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Upload a file
router.post(
  "/upload",
  validateFileUpload,
  upload.single("file"),
  (req, res, next) => fileController.uploadFile(req, res, next)
);

// Get all file attachments with pagination and filters
router.get("/", validateQueryParams, (req, res, next) => {
  fileController.getFileAttachments(req, res, next);
});

// Get a single file attachment by ID
router.get("/:fileId", validateFileId, (req, res, next) => {
  fileController.getFileAttachmentById(req, res, next);
});

// Delete a file attachment
router.delete("/:fileId", validateFileId, (req, res, next) => {
  fileController.deleteFileAttachment(req, res, next);
});

// Get file attachments for a specific entity (deal, contact, activity)
router.get(
  "/entity/:entityType/:entityId",
  validateQueryParams,
  (req, res, next) => {
    fileController.getFileAttachmentsByEntity(req, res, next);
  }
);

export default router;
