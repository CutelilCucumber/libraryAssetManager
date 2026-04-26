const { body } = require ('express-validator')
const db = require('../db');

const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .escape()
    .custom(async (value) => {
      const existing = await db.getUserByUsername(value);
      if (existing) throw new Error('Username already taken');
    }),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .custom(async (value) => {
      const existing = await db.getUserByEmail(value);
      if (existing) throw new Error('Email already registered');
    }),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = {
  registerValidation
}