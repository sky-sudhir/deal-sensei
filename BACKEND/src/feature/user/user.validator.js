import Joi from "joi";
import validator from "../../middleware/validator.js";

// Schema for creating a new user
const userCreateSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),
  role: Joi.string().valid("admin", "sales_rep").default("sales_rep"),
  company_id: Joi.string().messages({
    "any.required": "Company ID is required",
  }),
});

// Schema for updating a user
const userUpdateSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(8).messages({
    "string.min": "Password must be at least 8 characters long",
  }),
  name: Joi.string(),
  is_active: Joi.boolean(),
});

// Schema for validating user ID
const userIdSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
});

// Schema for login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Export validators using the validator middleware
export const userCreateValidator = validator(userCreateSchema, "body");
export const userUpdateValidator = validator(userUpdateSchema, "body");
export const userIdValidator = validator(userIdSchema, "params");
export const loginValidator = validator(loginSchema, "body");
