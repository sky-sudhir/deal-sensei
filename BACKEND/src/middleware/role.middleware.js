import Response from "../utils/apiResponse.js";

/**
 * Middleware to authorize users based on their roles
 * @param {Array} roles - Array of roles allowed to access the route
 * @returns {Function} Middleware function
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    const response = new Response(res);
    
    if (!req.user) {
      return response.unauthorized("User not authenticated");
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return response.forbidden("You don't have permission to access this resource");
    }
    
    next();
  };
};
