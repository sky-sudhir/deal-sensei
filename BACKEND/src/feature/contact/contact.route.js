import express from "express";
import ContactController from "./contact.controller.js";
import {
  contactCreateValidator,
  contactUpdateValidator,
  contactIdValidator,
} from "./contact.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();
const contactController = new ContactController();

// All routes require authentication
router.use(authenticate);

// Create a new contact
router.post(
  "/",
  authorize(["admin", "sales_rep"]),
  contactCreateValidator,
  contactController.createContact.bind(contactController)
);

// Get all contacts for the company (with pagination and search)
router.get(
  "/",
  authorize(["admin", "sales_rep"]),
  contactController.getContactsByCompany.bind(contactController)
);

// Get contact by ID
router.get(
  "/:id",
  authorize(["admin", "sales_rep"]),
  contactIdValidator,
  contactController.getContactById.bind(contactController)
);

// Update contact
router.put(
  "/:id",
  authorize(["admin", "sales_rep"]),
  contactIdValidator,
  contactUpdateValidator,
  contactController.updateContact.bind(contactController)
);

// Delete contact
router.delete(
  "/:id",
  authorize(["admin", "sales_rep"]),
  contactIdValidator,
  contactController.deleteContact.bind(contactController)
);

// Transfer contact ownership (admin only)
router.put(
  "/:id/transfer",
  authorize(["admin"]),
  contactIdValidator,
  contactController.transferContactOwnership.bind(contactController)
);

export default router;
