class CustomError extends Error {
  constructor(message, status = 500) {
    super(message?.message ?? message);
    this.statusCode = message?.statusCode ?? status;
  }
}

export default CustomError;
