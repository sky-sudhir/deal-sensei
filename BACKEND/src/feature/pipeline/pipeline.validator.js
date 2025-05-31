import Joi from "joi";
import { validate } from "../../utils/validator.js";

export const pipelineCreateValidator = (req, res, next) => {
  const stageSchema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Stage name is required",
    }),
    order: Joi.number().min(0),
    win_probability: Joi.number().min(0).max(100).default(0),
  });

  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Pipeline name is required",
    }),
    stages: Joi.array().items(stageSchema).min(2).required().messages({
      "array.min": "Pipeline must have at least 2 stages",
      "any.required": "Stages are required",
    }),
    is_default: Joi.boolean().default(false),
    company_id: Joi.string(),
  });

  validate(req, res, next, schema);
};

export const pipelineUpdateValidator = (req, res, next) => {
  const stageSchema = Joi.object({
    name: Joi.string(),
    order: Joi.number().min(0),
    win_probability: Joi.number().min(0).max(100),
  });

  const schema = Joi.object({
    name: Joi.string(),
    stages: Joi.array().items(stageSchema).min(2).messages({
      "array.min": "Pipeline must have at least 2 stages",
    }),
    is_default: Joi.boolean(),
  });

  validate(req, res, next, schema);
};

export const pipelineIdValidator = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Pipeline ID is required",
    }),
  });

  validate(req.params, res, next, schema);
};
