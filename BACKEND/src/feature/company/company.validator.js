import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for creating a new company
const companyCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Company name is required",
    "string.min": "Company name must be at least 2 characters",
    "string.max": "Company name cannot exceed 100 characters",
    "any.required": "Company name is required"
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required"
  }),
  description: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Description cannot exceed 500 characters"
  }),
  settings: Joi.object().default({}),
  is_verified: Joi.boolean().default(false)
});

// Schema for updating a company
const companyUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    "string.empty": "Company name cannot be empty",
    "string.min": "Company name must be at least 2 characters",
    "string.max": "Company name cannot exceed 100 characters"
  }),
  email: Joi.string().trim().email().messages({
    "string.email": "Please provide a valid email address"
  }),
  description: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Description cannot exceed 500 characters"
  }),
  is_verified: Joi.boolean(),
  settings: Joi.object(),
  admin_user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    "string.pattern.base": "Admin user ID must be a valid MongoDB ObjectId"
  })
});

// Schema for validating company ID
const companyIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    "any.required": "Company ID is required"
  })
});

// Export validators using the validator middleware
export const companyCreateValidator = validator(companyCreateSchema, 'body');
export const companyUpdateValidator = validator(companyUpdateSchema, 'body');
export const companyIdValidator = validator(companyIdSchema, 'params');
