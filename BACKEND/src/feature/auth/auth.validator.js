import Joi from "joi";
import { validate } from "../../utils/validator.js";

export const loginValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  });

  validate(req, res, next, schema);
};

export const companySignupValidator = (req, res, next) => {
  const schema = Joi.object({
    company: Joi.object({
      name: Joi.string().required().messages({
        "any.required": "Company name is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid company email address",
        "any.required": "Company email is required",
      }),
    }).required(),
    admin: Joi.object({
      name: Joi.string().required().messages({
        "any.required": "Admin name is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid admin email address",
        "any.required": "Admin email is required",
      }),
      password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters long",
        "any.required": "Password is required",
      }),
    }).required(),
  });

  validate(req, res, next, schema);
};

export const resendVerificationValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  });

  validate(req, res, next, schema);
};
