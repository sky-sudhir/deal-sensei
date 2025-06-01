import express from "express";
import DealController from "./deal.controller.js";
import {
  dealCreateValidator,
  dealUpdateValidator,
  dealIdValidator,
} from "./deal.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { generateDealEmbedding } from "../../middleware/embedding.middleware.js";

const router = express.Router();
const dealController = new DealController();

// All routes require authentication
router.use(authenticate);

// Create a new deal
router.post(
  "/",
  authorize(["admin", "sales_rep"]),
  dealCreateValidator,
  dealController.createDeal.bind(dealController),
  generateDealEmbedding
);

// Get all deals for the company (with pagination and search)
router.get(
  "/",
  authorize(["admin", "sales_rep"]),
  dealController.getDealsByCompany.bind(dealController)
);

// Get deal by ID
router.get(
  "/:id",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  dealController.getDealById.bind(dealController)
);

// Update deal
router.put(
  "/:id",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  dealUpdateValidator,
  dealController.updateDeal.bind(dealController),
  generateDealEmbedding
);

// Delete deal
router.delete(
  "/:id",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  dealController.deleteDeal.bind(dealController)
);

// Update deal stage
router.put(
  "/:id/stage",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  dealController.updateDealStage.bind(dealController)
);

// Transfer deal ownership (admin only)
router.put(
  "/:id/transfer",
  authorize(["admin"]),
  dealIdValidator,
  dealController.transferDealOwnership.bind(dealController)
);

// Get deals by contact
router.get(
  "/contact/:contactId",
  authorize(["admin", "sales_rep"]),
  dealController.getDealsByContact.bind(dealController)
);

export default router;
