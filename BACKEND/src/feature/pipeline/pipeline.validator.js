import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for stage validation (reused in create and update)
const stageSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Stage name is required",
  }),
  order: Joi.number().min(0),
  win_probability: Joi.number().min(0).max(100).default(0),
});

// Schema for creating a new pipeline
const pipelineCreateSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Pipeline name is required",
    "any.required": "Pipeline name is required",
  }),
  stages: Joi.array().items(stageSchema).min(2).required().messages({
    "array.min": "Pipeline must have at least 2 stages",
    "any.required": "Stages are required",
  }),
  is_default: Joi.boolean().default(false),
  company_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
  }),
});

// Schema for updating a pipeline
const pipelineUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  stages: Joi.array().items(stageSchema).min(2).messages({
    "array.min": "Pipeline must have at least 2 stages",
  }),
  is_default: Joi.boolean(),
});

// Schema for validating pipeline ID
const pipelineIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    "string.pattern.base": "Pipeline ID must be a valid MongoDB ObjectId",
    "any.required": "Pipeline ID is required",
  }),
});

// Export validators using the validator middleware
export const pipelineCreateValidator = validator(pipelineCreateSchema, 'body');
export const pipelineUpdateValidator = validator(pipelineUpdateSchema, 'body');
export const pipelineIdValidator = validator(pipelineIdSchema, 'params');
