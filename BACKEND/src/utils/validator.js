import { validationResult } from "express-validator";
import Response from "./apiResponse.js";

class Validator {
  static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
}

export default Validator;

export const validate = (req, res, next, schema) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response = new Response(res);
    return response.badRequest(errors.array().map((error) => error.msg));
  }
  next();
};
