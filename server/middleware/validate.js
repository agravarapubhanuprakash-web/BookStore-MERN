const { validationResult } = require('express-validator');

/**
 * validate
 * --------------------------------------------------
 * Middleware that checks the result of preceding
 * express-validator validation chains. If there are
 * errors, it returns a 400 response with a structured
 * array of error messages. Otherwise, calls next().
 *
 * Usage:
 *   router.post('/route',
 *     [body('email').isEmail()],
 *     validate,
 *     controller
 *   );
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
