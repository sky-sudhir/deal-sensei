import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for login validation
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

// Schema for company signup validation
const companySignupSchema = Joi.object({
  company: Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Company name is required",
      "any.required": "Company name is required",
    }),
    email: Joi.string().trim().email().required().messages({
      "string.email": "Please provide a valid company email address",
      "string.empty": "Company email is required",
      "any.required": "Company email is required",
    }),
  }).required(),
  admin: Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Admin name is required",
      "any.required": "Admin name is required",
    }),
    email: Joi.string().trim().email().required().messages({
      "string.email": "Please provide a valid admin email address",
      "string.empty": "Admin email is required",
      "any.required": "Admin email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  }).required(),
});

// Schema for resend verification validation
const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});

// Export validators using the validator middleware
export const loginValidator = validator(loginSchema, 'body');
export const companySignupValidator = validator(companySignupSchema, 'body');
export const resendVerificationValidator = validator(resendVerificationSchema, 'body');
