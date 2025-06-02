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

// Create activity schema validation
const createActivitySchema = Joi.object({
  type: Joi.string()
    .valid("call", "email", "meeting", "note", "task")
    .required()
    .messages({
      "string.empty": "Activity type is required",
      "any.required": "Activity type is required",
      "any.only":
        "Activity type must be one of: call, email, meeting, note, task",
    }),
  subject: Joi.string().required().min(3).max(100).messages({
    "string.empty": "Subject is required",
    "any.required": "Subject is required",
    "string.min": "Subject must be at least 3 characters",
    "string.max": "Subject must be at most 100 characters",
  }),
  content: Joi.string().required().min(5).messages({
    "string.empty": "Content is required",
    "any.required": "Content is required",
    "string.min": "Content must be at least 5 characters",
  }),
  duration_minutes: Joi.number().integer().min(0).max(480).default(0).messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.min": "Duration cannot be negative",
    "number.max": "Duration cannot exceed 8 hours (480 minutes)",
  }),
  next_steps: Joi.string().allow("").default("").messages({
    "string.base": "Next steps must be a string",
  }),
  deal_id: Joi.string()
    .custom(objectIdValidator)
    .allow(null)
    .default(null)
    .messages({
      "any.invalid": "Invalid deal ID format",
    }),
  contact_id: Joi.string()
    .custom(objectIdValidator)
    .allow(null)
    .default(null)
    .messages({
      "any.invalid": "Invalid contact ID format",
    }),
});

// Update activity schema validation
const updateActivitySchema = Joi.object({
  type: Joi.string()
    .valid("call", "email", "meeting", "note", "task")
    .messages({
      "any.only":
        "Activity type must be one of: call, email, meeting, note, task",
    }),
  subject: Joi.string().min(3).max(100).messages({
    "string.min": "Subject must be at least 3 characters",
    "string.max": "Subject must be at most 100 characters",
  }),
  content: Joi.string().min(5).messages({
    "string.min": "Content must be at least 5 characters",
  }),
  duration_minutes: Joi.number().integer().min(0).max(480).messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.min": "Duration cannot be negative",
    "number.max": "Duration cannot exceed 8 hours (480 minutes)",
  }),
  next_steps: Joi.string().allow("").messages({
    "string.base": "Next steps must be a string",
  }),
  deal_id: Joi.string().custom(objectIdValidator).allow(null).messages({
    "any.invalid": "Invalid deal ID format",
  }),
  contact_id: Joi.string().custom(objectIdValidator).allow(null).messages({
    "any.invalid": "Invalid contact ID format",
  }),
});

// Activity ID validation
const activityIdSchema = Joi.object({
  id: Joi.string().custom(objectIdValidator).required().messages({
    "string.empty": "Activity ID is required",
    "any.required": "Activity ID is required",
    "any.invalid": "Invalid activity ID format",
  }),
});

// Query parameters validation
const querySchema = Joi.object({
  type: Joi.string().valid("call", "email", "meeting", "note", "task"),
  deal_id: Joi.string().custom(objectIdValidator),
  contact_id: Joi.string().custom(objectIdValidator),
  user_id: Joi.string().custom(objectIdValidator),
  search: Joi.string().trim().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("created_at", "-created_at").default("-created_at"),
});

// Validator middleware functions
export const validateCreateActivity = validator(createActivitySchema, "body");
export const validateUpdateActivity = validator(updateActivitySchema, "body");
export const validateActivityId = validator(activityIdSchema, "params");
export const validateQueryParams = validator(querySchema, "query");
