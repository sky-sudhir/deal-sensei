import { body, param } from "express-validator";
import { validate } from "../../utils/validator.js";

const companyCreateValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  validate,
];

const companyUpdateValidator = [
  param("id").isMongoId().withMessage("Invalid company ID format"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  validate,
];

const companyIdValidator = [
  param("id").isMongoId().withMessage("Invalid company ID format"),
  validate,
];

export { companyCreateValidator, companyUpdateValidator, companyIdValidator };
