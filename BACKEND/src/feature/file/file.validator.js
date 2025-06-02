import Joi from "joi";
import mongoose from "mongoose";
import validator from "../../middleware/validator.js";

// Validate ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// File upload validation schema
const fileUploadSchema = Joi.object({
  attached_to_type: Joi.string()
    .valid("deal", "contact", "activity")
    .required()
    .messages({
      "string.empty": "Attachment type is required",
      "any.required": "Attachment type is required",
      "any.only": "Attachment type must be one of: deal, contact, activity",
    }),
  attached_to_id: Joi.string().custom(objectIdValidator).required().messages({
    "string.empty": "Attachment ID is required",
    "any.required": "Attachment ID is required",
    "any.invalid": "Invalid attachment ID format",
  }),
});

// File ID validation
const fileIdSchema = Joi.object({
  fileId: Joi.string().custom(objectIdValidator).required().messages({
    "string.empty": "File ID is required",
    "any.required": "File ID is required",
    "any.invalid": "Invalid file ID format",
  }),
});

// Query parameters validation
const querySchema = Joi.object({
  attached_to_type: Joi.string().valid("deal", "contact", "activity"),
  attached_to_id: Joi.string().custom(objectIdValidator),
  search: Joi.string().trim().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("created_at", "-created_at").default("-created_at"),
});

// Validator middleware functions
export const validateFileUpload = validator(fileUploadSchema, "body");
export const validateFileId = validator(fileIdSchema, "params");
export const validateQueryParams = validator(querySchema, "query");
