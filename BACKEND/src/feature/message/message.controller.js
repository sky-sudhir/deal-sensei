import MessageRepository from "./message.repository.js";
import Response from "../../utils/apiResponse.js";
import AiRepository from "../ai/ai.repository.js";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

class MessageController {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.aiRepository = new AiRepository();
  }

  async createMessage(req, res, next) {
    const response = new Response(res);
    try {
      //   const { user } = req;
      const { company_id } = req.user;
      const {
        deal_id = null,
        contact_id = null,
        message_user,
        message_assistant,
        history,
      } = req.body;

      const messageData = {
        company_id,
        deal_id,
        contact_id,
        user_id: req.user.userId,
        message_user,
        message_assistant,
      };

      const newMessage = await this.messageRepository.createMessage(
        messageData
      );

      if (newMessage && history) {
        const embeddingData = await createEntityEmbedding(
          newMessage,
          "message"
        );
        if (embeddingData?.embedding_vector) {
          try {
            await this.aiRepository.storeEmbedding(
              "message",
              newMessage._id,
              newMessage.company_id,
              embeddingData.embedding_vector,
              embeddingData.content_summary,
              newMessage.deal_id,
              newMessage.contact_id
            );
          } catch (error) {
            next(error);
          }
        }
      }

      return response.success(
        newMessage,
        history
          ? "Message logged with embeddings successfully"
          : "Message Logged successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default MessageController;
