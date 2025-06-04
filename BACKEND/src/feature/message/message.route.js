import express from "express";
const messageRouter = express.Router();
import MessageController from "./message.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const messageController = new MessageController();
messageRouter.use(authenticate);

messageRouter.post(
  "/",
  authorize(["admin", "sales_rep"]),
  messageController.createMessage.bind(messageController)
);

export default messageRouter;
