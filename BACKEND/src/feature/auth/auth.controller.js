import Response from "../../utils/apiResponse.js";
import UserRepository from "../user/user.repository.js";
import CompanyRepository from "../company/company.repository.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";
// import CustomError from "../../utils/CustomError.js";
import emailService from "../../utils/emailService.js";

// In-memory token store for email verification (in production, use Redis or DB)
const verificationTokens = new Map();

class AuthController {
  constructor() {
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
  }

  async login(req, res, next) {
    const response = new Response(res);
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userRepository.findUserByEmail(email);

      // Check if user exists
      if (!user) {
        return response.unauthorized("Invalid email or password");
      }

      // Check if user is active
      if (!user.is_active) {
        return response.unauthorized(
          "Your account has been deactivated. Please contact your administrator."
        );
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return response.unauthorized("Invalid email or password");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          company_id: user.company_id._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return user info and token
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      };

      return response.success({ user: userInfo, token }, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    const response = new Response(res);
    // JWT is stateless, so we just return a success message
    // In a real app, you might want to invalidate the token using a token blacklist
    return response.success(null, "Logout successful");
  }

  async companySignup(req, res, next) {
    const response = new Response(res);
    try {
      const { company, admin } = req.body;

      // Check if company email already exists
      const existingCompany = await this.companyRepository.findCompanyByEmail(
        company.email
      );
      if (existingCompany) {
        return response.badRequest("A company with this email already exists");
      }

      // Check if admin email already exists
      const existingUser = await this.userRepository.findUserByEmail(
        admin.email
      );
      if (existingUser) {
        return response.badRequest("A user with this email already exists");
      }

      // Create company
      const newCompany = await this.companyRepository.createCompany({
        name: company.name,
        email: company.email,
        is_verified: false,
      });

      // Create admin user
      const adminUser = await this.userRepository.createUser({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: "admin",
        company_id: newCompany._id,
      });

      // Update company with admin user ID
      await this.companyRepository.updateCompany(newCompany._id, {
        admin_user_id: adminUser._id,
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Store token with company ID (in production, store in Redis or DB with expiry)
      verificationTokens.set(verificationToken, {
        company_id: newCompany._id,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(
          company.email,
          verificationToken,
          company.name
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with the registration process even if email fails
      }

      return response.success(
        {
          company: newCompany,
          admin: { ...adminUser, password: undefined },
        },
        "Company registered successfully. Please verify your email.",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    const response = new Response(res);
    try {
      const { token } = req.params;

      // Check if token exists and is valid
      const tokenData = verificationTokens.get(token);
      if (!tokenData) {
        return response.badRequest("Invalid or expired verification token");
      }

      // Check if token is expired
      if (tokenData.expires < Date.now()) {
        verificationTokens.delete(token);
        return response.badRequest("Verification token has expired");
      }

      // Update company verification status
      await this.companyRepository.updateCompany(tokenData.company_id, {
        is_verified: true,
      });

      // Remove used token
      verificationTokens.delete(token);

      return response.success(
        null,
        "Email verified successfully. You can now log in."
      );
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req, res, next) {
    const response = new Response(res);
    try {
      const { email } = req.body;

      // Find company by email
      const company = await this.companyRepository.findCompanyByEmail(email);
      if (!company) {
        // Don't reveal if company exists for security
        return response.success(
          null,
          "If your email exists in our system, a verification link has been sent."
        );
      }

      // Check if already verified
      if (company.is_verified) {
        return response.badRequest("This company email is already verified");
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Store token with company ID
      verificationTokens.set(verificationToken, {
        company_id: company._id,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(
          email,
          verificationToken,
          company.name
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      return response.success(
        null,
        "If your email exists in our system, a verification link has been sent."
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
