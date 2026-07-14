/**
 * Custom API Error class that extends the native Error.
 * Carries an HTTP status code alongside the error message.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500)
   * @param {string} message    - Human-readable error description
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
