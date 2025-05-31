import express from "express";
import CompanyController from "./company.controller.js";
import {
  companyCreateValidator,
  companyUpdateValidator,
  companyIdValidator,
} from "./company.validator.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import AuthController from "../auth/auth.controller.js";
import { companySignupValidator } from "../auth/auth.validator.js";

const router = express.Router();
const companyController = new CompanyController();
const authController = new AuthController();

// Public route for company signup
router.post("/signup", companySignupValidator, (req, res, next) =>
  authController.companySignup(req, res, next)
);

// Routes accessible only to SUPERADMIN
router.post(
  "/",
  authenticate,
  // authorize(["SUPERADMIN"]),
  companyCreateValidator,
  (req, res, next) => companyController.createCompany(req, res, next)
);

router.put(
  "/:id",
  authenticate,
  // authorize(["SUPERADMIN"]),
  companyUpdateValidator,
  (req, res, next) => companyController.updateCompany(req, res, next)
);

router.delete(
  "/:id",
  authenticate,
  // authorize(["SUPERADMIN"]),
  companyIdValidator,
  (req, res, next) => companyController.deleteCompany(req, res, next)
);

// Routes accessible to SUPERADMIN and STORE_ADMIN
router.get(
  "/",
  authenticate,
  // authorize(["SUPERADMIN", "STORE_ADMIN"]),
  (req, res, next) => companyController.getAllCompanies(req, res, next)
);

router.get(
  "/:id",
  authenticate,
  //   authorize(["SUPERADMIN", "STORE_ADMIN"]),
  companyIdValidator,
  (req, res, next) => companyController.getCompanyById(req, res, next)
);

// Get current company info
router.get("/me", authenticate, (req, res, next) =>
  companyController.getCurrentCompany(req, res, next)
);

export default router;
