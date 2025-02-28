const Joi = require("joi");

// User Schema Validation
module.exports.userSchema = Joi.object({
  user: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required"
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required"
    }),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be 10 digits",
        "string.empty": "Mobile number is required"
      }),
    role: Joi.string()
      .valid("citizen", "staff", "admin")
      .default("citizen")
  }).required()
});


// Service Schema Validation
module.exports.serviceSchema = Joi.object({
  service: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Service title is required"
    }),
    description: Joi.string().required().messages({
      "string.empty": "Service description is required"
    }),
    category: Joi.array()
      .items(
        Joi.string().valid(
          "Agriculture", 
          "Water", 
          "Land", 
          "Infrastructure", 
          "Education", 
          "Health", 
          "Welfare", 
          "Finance", 
          "Employment", 
          "Other"
        )
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one category must be selected",
        "array.includes": "Invalid category selection"
      }),
    fee: Joi.number().min(0).default(0).messages({
      "number.min": "Fee must be a non-negative number"
    }),
    processingTime: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Ensures YYYY-MM-DD format
    .required()
    .messages({
        "string.empty": "Processing time is required",
        "string.pattern.base": "Invalid date format. Use YYYY-MM-DD."
    }),



    approvalRequired: Joi.boolean().default(true).messages({
      "boolean.base": "Approval required must be true or false"
    }), // Matches Mongoose schema
    location: Joi.string().allow("", null),
    state: Joi.string().allow("", null)
  }).required()
});


// Application Schema Validation
module.exports.applicationSchema = Joi.object({
  application: Joi.object({
    user: Joi.string().required().messages({
      "string.empty": "User ID is required"
    }),
    service: Joi.string().required().messages({
      "string.empty": "Service ID is required"
    }),
    status: Joi.string()
      .valid("pending", "approved", "rejected")
      .default("pending"),
    submittedAt: Joi.date().iso().messages({
      "date.base": "Invalid date format (YYYY-MM-DD expected)"
    }),
    reviewedBy: Joi.string().allow("", null) // Optional field for admin/staff who reviews
  }).required()
});
