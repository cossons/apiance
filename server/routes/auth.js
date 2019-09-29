const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const authController = require("../controllers/auth");
const passport = require('passport');

// Login user
router.post("/login", catchErrors(authController.login));

// Invalidate token / logout user
router.get("/invalidate", catchErrors(authController.invalidate));

// Verify user token
router.get("/token/verify", catchErrors(authController.tokenVerify));

// Refresh token
router.get("/token/refresh", catchErrors(authController.tokenRefresh));

// Export our router
module.exports = router;