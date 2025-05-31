import Response from '../utils/apiResponse.js';
import CustomError from '../utils/CustomError.js';

/**
 * Validator middleware factory
 * @param {Object} schema - Joi schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validator = (schema, property) => {
  return (req, res, next) => {
    const response = new Response(res);
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return response.badRequest(errors);
  };
};

export default validator;
