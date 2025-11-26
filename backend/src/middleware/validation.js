const Joi = require('joi');

// Validation schemas
const createLinkSchema = Joi.object({
  originalUrl: Joi.string().uri().required(),
  customCode: Joi.string().pattern(/^[A-Za-z0-9]{6,8}$/).optional()
});

// Validate create link request
const validateCreateLink = (req, res, next) => {
  const { error, value } = createLinkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validatedData = value;
  next();
};

module.exports = {
  validateCreateLink
};