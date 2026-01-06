import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Sanitize HTML input to prevent XSS
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
};

// Post validation rules
export const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['video', 'equipment', 'community']).withMessage('Invalid category'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Subcategory must not exceed 50 characters')
    .escape(),
  body('videoUrl')
    .optional()
    .trim()
    .isURL().withMessage('Invalid video URL'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand must not exceed 100 characters')
    .escape(),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model must not exceed 100 characters')
    .escape(),
  validate
];

// Comment validation rules
export const validateComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),
  body('parentId')
    .optional()
    .trim(),
  validate
];

// User profile validation rules
export const validateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters')
    .escape(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('favoriteGuitar')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Favorite guitar must not exceed 100 characters')
    .escape(),
  validate
];

// Report validation rules
export const validateReport = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Report reason is required')
    .isIn(['spam', 'harassment', 'hate_speech', 'violence', 'inappropriate_content', 'misinformation', 'copyright', 'impersonation', 'suspicious_activity', 'other'])
    .withMessage('Invalid report reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  validate
];

// Search validation rules
export const validateSearch = [
  body('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
    .escape(),
  validate
];
