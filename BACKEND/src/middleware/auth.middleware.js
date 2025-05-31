import jwt from "jsonwebtoken";
import "dotenv/config";
import Response from "../utils/apiResponse.js";

export const authenticate = (req, res, next) => {
  const response = new Response(res);
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.unauthorized("Authentication required. Please log in.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return response.unauthorized("Authentication token is missing.");
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return response.unauthorized(
          "Invalid or expired token. Please log in again."
        );
      }

      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        company_id: decoded.company_id,
      };

      next();
    });
  } catch (error) {
    return response.serverError("Authentication error");
  }
};

/**
 * Middleware to authorize users based on their roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const response = new Response(res);

    if (!req.user || !req.user.role) {
      return response.unauthorized("User not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return response.forbidden(
        "You do not have permission to access this resource"
      );
    }

    next();
  };
};
