import FileRepository from "./file.repository.js";
import Response from "../../utils/apiResponse.js";
import CustomError from "../../utils/CustomError.js";
import { getSignedUrl } from "../../utils/s3Service.js";

class FileController {
  constructor() {
    this.fileRepository = new FileRepository();
  }

  /**
   * Upload a file to S3 and create a file attachment record
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async uploadFile(req, res, next) {
    const response = new Response(res);

    try {
      const { user } = req;
      // Get attached_to_type and attached_to_id from request body, default to general if not provided
      const attached_to_type = req.body.attached_to_type || "general";
      const attached_to_id = req.body.attached_to_id || null;

      // Check if file was uploaded
      if (!req.file) {
        throw new CustomError("No file uploaded", 400);
      }

      // Extract file information from multer-s3
      const { originalname, mimetype, size, key, location } = req.file;

      // Create file attachment record
      const fileData = {
        filename: key.split("/").pop(),
        original_filename: originalname,
        file_type: mimetype,
        file_size_bytes: size,
        s3_key: key,
        s3_url: location,
        uploaded_by: user.userId,
        company_id: user.company_id,
        deal_id: req.body.deal_id,
        contact_id: req.body.contact_id,
      };

      // Only add attached_to_type and attached_to_id if they are provided
      if (attached_to_type !== "general") {
        fileData.attached_to_type = attached_to_type;
        if (attached_to_id) {
          fileData.attached_to_id = attached_to_id;
        }
      } else {
        fileData.attached_to_type = "general";
      }

      const fileAttachment = await this.fileRepository.createFileAttachment(
        fileData
      );

      return response.success(
        fileAttachment,
        "File uploaded successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all file attachments with pagination and filters
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFileAttachments(req, res, next) {
    const response = new Response(res);
    try {
      const { user } = req;
      const { attached_to_type, attached_to_id, page, limit, sort, search } =
        req.query;

      const filters = { company_id: user.company_id };

      if (attached_to_type) filters.attached_to_type = attached_to_type;
      if (attached_to_id) filters.attached_to_id = attached_to_id;

      const options = { page, limit, sort, search };
      const result = await this.fileRepository.getFileAttachments(
        filters,
        options
      );

      const fileAttachmentsWithUrls = await Promise.all(
        result.fileAttachments.map(async (file) => {
          const fileObj = file.toObject();
          fileObj.signed_url = await getSignedUrl(file.s3_key);
          return fileObj;
        })
      );

      result.fileAttachments = fileAttachmentsWithUrls;

      return response.success(
        {
          data: result,
        },
        "File attachments retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single file attachment by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFileAttachmentById(req, res, next) {
    const response = new Response(res);
    try {
      const { user } = req;
      const { fileId } = req.params;

      const fileAttachment = await this.fileRepository.getFileAttachmentById(
        fileId,
        user.company_id
      );

      // Generate signed URL for the file
      const fileObj = fileAttachment.toObject();
      fileObj.signed_url = await getSignedUrl(fileAttachment.s3_key);

      return response.success(
        fileObj,
        "File attachment retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a file attachment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteFileAttachment(req, res, next) {
    const response = new Response(res);
    try {
      const { user } = req;
      const { fileId } = req.params;

      // First, get the file to check permissions
      const fileAttachment = await this.fileRepository.getFileAttachmentById(
        fileId,
        user.company_id
      );

      // Check if the user has permission to delete this file
      if (
        user.role !== "admin" &&
        fileAttachment.uploaded_by._id.toString() !== user.userId.toString()
      ) {
        throw new CustomError(
          "You do not have permission to delete this file",
          403
        );
      }

      await this.fileRepository.deleteFileAttachment(fileId, user.company_id);

      return response.success(
        null,
        "File attachment deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get file attachments for a specific entity (deal, contact, activity)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFileAttachmentsByEntity(req, res, next) {
    const response = new Response(res);
    try {
      const { user } = req;
      console.log(
        "User object in getFileAttachmentsByEntity:",
        JSON.stringify(user)
      );
      const { entityType, entityId } = req.params;
      const { page, limit, sort } = req.query;

      // Validate entity type
      if (!["deal", "contact", "activity"].includes(entityType)) {
        throw new CustomError("Invalid entity type", 400);
      }

      // Build filters
      const filters = {
        company_id: user.company_id || user.companyId,
        attached_to_type: entityType,
        attached_to_id: entityId,
      };

      console.log("Filters for entity files:", JSON.stringify(filters));

      const options = { page, limit, sort };
      const result = await this.fileRepository.getFileAttachmentsByEntity(
        entityId,
        entityType,
        user.company_id,
        options
      );

      // Generate signed URLs for each file
      const fileAttachmentsWithUrls = await Promise.all(
        result.fileAttachments.map(async (file) => {
          const fileObj = file.toObject();
          fileObj.signed_url = await getSignedUrl(file.s3_key);
          return fileObj;
        })
      );

      result.fileAttachments = fileAttachmentsWithUrls;

      return response.success(
        {
          data: result,
        },
        "File attachments retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

export default FileController;
