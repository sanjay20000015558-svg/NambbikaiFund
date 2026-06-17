const { body, param, query, validationResult } = require('express-validator');

// Custom validation rules
const isIndianMobile = (value) => {
  return /^[6-9]\d{9}$/.test(value);
};

const isIndianPincode = (value) => {
  return /^\d{6}$/.test(value);
};

const isIndianIFSC = (value) => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
};

const isAmountPositive = (value) => {
  return value > 0;
};

const isFutureDate = (value) => {
  return new Date(value) > new Date();
};

const sanitizeInput = (req, res, next) => {
  // Trim strings and convert empty strings to null
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
    if (req.body[key] === '') {
      req.body[key] = null;
    }
  });
  next();
};

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validations
const userValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('mobileNumber')
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number is required'),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('language')
    .optional()
    .isIn(['en', 'ta', 'hi', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur'])
];

// Login validations
const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

// Campaign validation
const campaignValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Campaign title is required')
    .isLength({ min: 10, max: 200 }),

  body('category')
    .isIn(['leukemia', 'medical', 'education', 'startup', 'agriculture', 'emergency', 'social-cause'])
    .withMessage('Valid category is required'),

  body('shortDescription')
    .trim()
    .notEmpty().withMessage('Short description is required')
    .isLength({ max: 500 }),

  body('description')
    .trim()
    .notEmpty().withMessage('Campaign story is required')
    .isLength({ min: 200, max: 10000 }),

  body('targetAmount')
    .isNumeric().withMessage('Target amount must be a number')
    .isFloat({ min: 1000, max: 100000000 })
    .withMessage('Target amount must be between ₹1,000 and ₹10 Crore'),

  body('deadline')
    .notEmpty().withMessage('Campaign deadline is required')
    .isISO8601().withMessage('Valid deadline date is required')
    .custom(isFutureDate).withMessage('Deadline must be in the future'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']),

  // Patient details
  body('patientDetails.name')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('patientDetails.age')
    .optional()
    .isInt({ min: 0, max: 120 }),

  // Medical details
  body('medicalDetails.hospitalName')
    .optional()
    .trim()
    .isLength({ max: 200 }),

  body('medicalDetails.doctorName')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  // Location
  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ max: 100 }),

  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ max: 100 }),

  body('location.country')
    .optional()
    .default('India')
];

// Donation validations
const donationValidation = [
  body('campaignId')
    .notEmpty().withMessage('Campaign ID is required')
    .isMongoId().withMessage('Invalid campaign ID'),

  body('amount')
    .isNumeric().withMessage('Donation amount must be a number')
    .isFloat({ min: 1, max: 10000000 })
    .withMessage('Donation amount must be between ₹1 and ₹1 Crore'),

  body('isAnonymous')
    .optional()
    .isBoolean(),

  body('dedicatedTo')
    .optional()
    .trim()
    .isLength({ max: 200 }),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
];

// Withdrawal validations
const withdrawalValidation = [
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 100 }).withMessage('Minimum withdrawal amount is ₹100'),

  body('bankDetails.accountNumber')
    .notEmpty().withMessage('Account number is required')
    .isLength({ min: 9, max: 18 }),

  body('bankDetails.accountHolderName')
    .notEmpty().withMessage('Account holder name is required')
    .isLength({ max: 100 }),

  body('bankDetails.ifsc')
    .notEmpty().withMessage('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Valid IFSC code is required'),

  body('bankDetails.pan')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Valid PAN number is required')
];

// ID parameter validation
const objectIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format`)
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'amountRaised', 'deadline', 'views'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

// Razorpay webhook validation
const webhookValidation = [
  body('razorpay_order_id')
    .notEmpty().withMessage('Order ID is required'),

  body('razorpay_payment_id')
    .notEmpty().withMessage('Payment ID is required'),

  body('razorpay_signature')
    .notEmpty().withMessage('Signature is required')
];

module.exports = {
  validate,
  sanitizeInput,
  userValidation,
  loginValidation,
  campaignValidation,
  donationValidation,
  withdrawalValidation,
  objectIdValidation,
  paginationValidation,
  webhookValidation
};
