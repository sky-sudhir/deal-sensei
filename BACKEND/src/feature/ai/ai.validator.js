import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for deal_id parameter validation
const dealIdSchema = Joi.object({
  deal_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Deal ID is required",
      "string.pattern.base": "Deal ID must be a valid MongoDB ObjectId",
    }),
});

// Schema for contact_id parameter validation
const contactIdSchema = Joi.object({
  contact_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Contact ID is required",
      "string.pattern.base": "Contact ID must be a valid MongoDB ObjectId",
    }),
});

// Schema for objection handler validation
const objectionHandlerSchema = Joi.object({
  objection_text: Joi.string()
    .required()
    .min(5)
    .max(500)
    .messages({
      "any.required": "Objection text is required",
      "string.empty": "Objection text cannot be empty",
      "string.min": "Objection text must be at least {#limit} characters",
      "string.max": "Objection text cannot exceed {#limit} characters",
    }),
  deal_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Deal ID must be a valid MongoDB ObjectId",
    }),
});

// Schema for win-loss explainer validation
const winLossSchema = Joi.object({
  deal_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Deal ID is required",
      "string.pattern.base": "Deal ID must be a valid MongoDB ObjectId",
    }),
});

// Validators for routes
// Schema for embedding generation validation
const embeddingGenerationSchema = Joi.object({
  entity_type: Joi.string()
    .valid("deal", "contact", "activity")
    .required()
    .messages({
      "any.required": "Entity type is required",
      "any.only": "Entity type must be one of: deal, contact, activity",
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(500)
    .optional()
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 500",
    }),
});

export const dealIdValidator = validator(dealIdSchema, "params");
export const contactIdValidator = validator(contactIdSchema, "params");
export const objectionHandlerValidator = validator(objectionHandlerSchema, "body");
export const embeddingGenerationValidator = validator(embeddingGenerationSchema, "body");
export const winLossValidator = validator(winLossSchema, "params");
