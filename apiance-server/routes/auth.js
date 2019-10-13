const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const authentication = require('../modules/authentication');

const authController = require("../controllers/auth");

// Login user
router.post("/login", authentication.basicLDAP(), catchErrors(authController.login));

// Invalidate token / logout user
router.get("/invalidate", authentication.basicJWT(), catchErrors(authController.invalidate));

// Verify user token
router.get("/token/verify", catchErrors(authController.tokenVerify));

// Refresh token
router.get("/token/refresh", catchErrors(authController.tokenRefresh));

// Export our router
module.exports = router;