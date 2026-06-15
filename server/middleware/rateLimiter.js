const rateLimit = require("express-rate-limit");

// Rate limit for auth endpoints - 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many auth attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
