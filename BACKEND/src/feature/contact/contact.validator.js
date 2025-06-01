import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for creating a new contact
const contactCreateSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Contact name is required",
    "any.required": "Contact name is required",
  }),
  email: Joi.string().trim().email().allow("", null).messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().trim().allow("", null).messages({
    "string.base": "Phone number must be a string",
  }),
  notes: Joi.string().trim().allow("", null).messages({
    "string.base": "Notes must be a string",
  }),
  engagement_score: Joi.number().min(0).max(100).default(0).messages({
    "number.min": "Engagement score must be at least 0",
    "number.max": "Engagement score cannot exceed 100",
  }),
  last_interaction_date: Joi.date().allow(null).default(null),
  owner_id: Joi.string().allow("", null),
  company_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
});

// Schema for updating a contact
const contactUpdateSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.empty": "Contact name cannot be empty",
  }),
  email: Joi.string().trim().email().allow("", null).messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().trim().allow("", null).messages({
    "string.base": "Phone number must be a string",
  }),
  notes: Joi.string().trim().allow("", null).messages({
    "string.base": "Notes must be a string",
  }),
  engagement_score: Joi.number().min(0).max(100).messages({
    "number.min": "Engagement score must be at least 0",
    "number.max": "Engagement score cannot exceed 100",
  }),
  last_interaction_date: Joi.date().allow(null),
  owner_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "Owner ID must be a valid MongoDB ObjectId",
    }),
});

// Schema for validating contact ID
const contactIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Contact ID must be a valid MongoDB ObjectId",
      "any.required": "Contact ID is required",
    }),
});

// Export validators using the validator middleware
export const contactCreateValidator = validator(contactCreateSchema, 'body');
export const contactUpdateValidator = validator(contactUpdateSchema, 'body');
export const contactIdValidator = validator(contactIdSchema, 'params');
