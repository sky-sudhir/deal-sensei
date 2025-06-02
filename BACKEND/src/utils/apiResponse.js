class Response {
  constructor(res) {
    this.res = res;
  }

  success(data = {}, message = "Success", statusCode = 200) {
    return this.res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  error(message = "Something went wrong", statusCode = 500, errors = []) {
    return this.res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  validationError(errors, message = "Validation Failed") {
    return this.res.status(422).json({
      success: false,
      message,
      errors,
    });
  }

  unauthorized(message = "Unauthorized") {
    return this.res.status(401).json({
      success: false,
      message,
    });
  }

  forbidden(message = "Forbidden") {
    return this.res.status(403).json({
      success: false,
      message,
    });
  }

  notFound(message = "Not Found") {
    return this.res.status(404).json({
      success: false,
      message,
    });
  }
  badRequest(message = "Bad Request") {
    return this.res.status(400).json({
      success: false,
      message,
    });
  }
}

export default Response;
