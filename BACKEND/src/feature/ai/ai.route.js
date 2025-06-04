import express from "express";
import AiController from "./ai.controller.js";
import {
  dealIdValidator,
  contactIdValidator,
  objectionHandlerValidator,
  embeddingGenerationValidator,
} from "./ai.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();
const aiController = new AiController();

// All routes require authentication
router.use(authenticate);

// Deal Coach endpoint
router.get(
  "/deal-coach/:deal_id",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  aiController.getDealCoach.bind(aiController)
);

// Persona Builder endpoint
router.get(
  "/persona-builder/:contact_id",
  authorize(["admin", "sales_rep"]),
  contactIdValidator,
  aiController.getPersonaBuilder.bind(aiController)
);

// Objection Handler endpoint
router.post(
  "/objection-handler",
  authorize(["admin", "sales_rep"]),
  objectionHandlerValidator,
  aiController.handleObjection.bind(aiController)
);
router.post(
  "/chatbot",
  authorize(["admin", "sales_rep"]),
  objectionHandlerValidator,
  aiController.handleChatbot.bind(aiController)
);

// Win-Loss Explainer endpoint
router.get(
  "/win-loss-explainer/:deal_id",
  authorize(["admin", "sales_rep"]),
  dealIdValidator,
  aiController.getWinLossExplainer.bind(aiController)
);

export default router;
