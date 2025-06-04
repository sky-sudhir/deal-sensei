import { MessageModel } from "./message.schema.js";
import CustomError from "../../utils/CustomError.js";

export default class MessageRepository {
  async createMessage(messageData) {
    try {
      const message = await MessageModel.create(messageData);
      return message;
    } catch (error) {
      throw new CustomError(error);
    }
  }
}
