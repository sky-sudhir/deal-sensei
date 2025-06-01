import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for creating a new deal
const dealCreateSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Deal title is required",
    "string.empty": "Deal title cannot be empty",
  }),
  value: Joi.number().min(0).required().messages({
    "any.required": "Deal value is required",
    "number.base": "Deal value must be a number",
    "number.min": "Deal value must be a positive number",
  }),
  stage: Joi.string().required().messages({
    "any.required": "Deal stage is required",
    "string.empty": "Deal stage cannot be empty",
  }),
  pipeline_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Pipeline ID is required",
      "string.pattern.base": "Pipeline ID must be a valid MongoDB ObjectId",
    }),
  contact_ids: Joi.array()
    .items(
      Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base": "Contact ID must be a valid MongoDB ObjectId",
        })
    )
    .default([]),
  owner_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .messages({
      "string.pattern.base": "Owner ID must be a valid MongoDB ObjectId",
    }),
  status: Joi.string().valid('open', 'won', 'lost').default('open'),
  close_date: Joi.date().allow(null),
  notes: Joi.string().allow('', null),
});

// Schema for updating an existing deal
const dealUpdateSchema = Joi.object({
  title: Joi.string().messages({
    "string.empty": "Deal title cannot be empty",
  }),
  value: Joi.number().min(0).messages({
    "number.base": "Deal value must be a number",
    "number.min": "Deal value must be a positive number",
  }),
  stage: Joi.string(),
  pipeline_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Pipeline ID must be a valid MongoDB ObjectId",
    }),
  contact_ids: Joi.array().items(
    Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Contact ID must be a valid MongoDB ObjectId",
      })
  ),
  owner_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .messages({
      "string.pattern.base": "Owner ID must be a valid MongoDB ObjectId",
    }),
  status: Joi.string().valid('open', 'won', 'lost'),
  close_date: Joi.date().allow(null),
  notes: Joi.string().allow('', null),
  stage_duration_days: Joi.number().min(0),
  total_deal_duration_days: Joi.number().min(0),
});

// Schema for validating deal ID
const dealIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Deal ID must be a valid MongoDB ObjectId",
      "any.required": "Deal ID is required",
    }),
});

// Export validators using the validator middleware
export const dealCreateValidator = validator(dealCreateSchema, 'body');
export const dealUpdateValidator = validator(dealUpdateSchema, 'body');
export const dealIdValidator = validator(dealIdSchema, 'params');
