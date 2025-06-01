import FileAttachment from "./file.schema.js";
import CustomError from "../../utils/CustomError.js";
import mongoose from "mongoose";
import { deleteFile } from "../../utils/s3Service.js";
import "../../feature/user/user.schema.js"; // Import User schema to register it with mongoose

class FileRepository {
  /**
   * Create a new file attachment record
   * @param {Object} fileData - File attachment data
   * @returns {Promise<Object>} Created file attachment
   */
  async createFileAttachment(fileData) {
    try {
      const fileAttachment = new FileAttachment(fileData);
      return await fileAttachment.save();
    } catch (error) {
      console.error("Error creating file attachment:", error);
      throw new CustomError("Failed to create file attachment record", 500);
    }
  }

  /**
   * Get file attachments with pagination and filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} File attachments and pagination info
   */
  async getFileAttachments(filters, options) {
    try {
      const { page = 1, limit = 10, sort = "-created_at" } = options;
      const skip = (page - 1) * limit;

      const query = FileAttachment.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("uploaded_by", "name email");

      const [fileAttachments, total] = await Promise.all([
        query.exec(),
        FileAttachment.countDocuments(filters),
      ]);

      return {
        fileAttachments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching file attachments:", error);
      throw new CustomError("Failed to fetch file attachments", 500);
    }
  }

  /**
   * Get a single file attachment by ID
   * @param {string} fileId - File attachment ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} File attachment
   */
  async getFileAttachmentById(fileId, companyId) {
    try {
      const fileAttachment = await FileAttachment.findOne({
        _id: fileId,
        company_id: companyId,
      }).populate("uploaded_by", "name email");

      if (!fileAttachment) {
        throw new CustomError("File attachment not found", 404);
      }

      return fileAttachment;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      if (error instanceof mongoose.Error.CastError) {
        throw new CustomError("Invalid file attachment ID", 400);
      }
      console.error("Error fetching file attachment:", error);
      throw new CustomError("Failed to fetch file attachment", 500);
    }
  }

  /**
   * Delete a file attachment
   * @param {string} fileId - File attachment ID
   * @param {string} companyId - Company ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFileAttachment(fileId, companyId) {
    try {
      const fileAttachment = await FileAttachment.findOne({
        _id: fileId,
        company_id: companyId,
      });

      if (!fileAttachment) {
        throw new CustomError("File attachment not found", 404);
      }

      // Delete the file from S3
      await deleteFile(fileAttachment.s3_key);

      // Delete the file record from the database
      await FileAttachment.findByIdAndDelete(fileId);

      return true;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      if (error instanceof mongoose.Error.CastError) {
        throw new CustomError("Invalid file attachment ID", 400);
      }
      console.error("Error deleting file attachment:", error);
      throw new CustomError("Failed to delete file attachment", 500);
    }
  }

  /**
   * Get file attachments for a specific entity (deal, contact, activity)
   * @param {string} attachedToId - ID of the entity the files are attached to
   * @param {string} attachedToType - Type of entity (deal, contact, activity)
   * @param {string} companyId - Company ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} File attachments and pagination info
   */
  async getFileAttachmentsByEntity(
    attachedToId,
    attachedToType,
    companyId,
    options
  ) {
    try {
      console.log("getFileAttachmentsByEntity params:", {
        attachedToId,
        attachedToType,
        companyId,
        options,
      });

      if (!companyId) {
        console.error("Company ID is missing in getFileAttachmentsByEntity");
      }

      const filters = {
        attached_to_id: attachedToId,
        attached_to_type: attachedToType,
        company_id: companyId,
      };

      console.log(
        "Filters in getFileAttachmentsByEntity:",
        JSON.stringify(filters)
      );

      return await this.getFileAttachments(filters, options);
    } catch (error) {
      console.error(
        `Error fetching ${attachedToType} file attachments:`,
        error
      );
      throw new CustomError(
        `Failed to fetch ${attachedToType} file attachments`,
        500
      );
    }
  }
}

export default FileRepository;
