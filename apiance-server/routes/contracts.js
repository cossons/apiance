const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const authentication = require('../modules/authentication');

const contractsController = require("../controllers/contracts");

// Get all
router.get("/", authentication.basicJWT(), catchErrors(contractsController.findAll));

// Get all
router.get("/names", authentication.basicJWT(), catchErrors(contractsController.findAllNames));

// Get one by Id
router.get("/:id", authentication.basicJWT(), catchErrors(contractsController.findById));

// Get one swagger by Id
router.get("/:id/swagger", authentication.basicJWT(), catchErrors(contractsController.findSwaggerById));

// Add one
router.post("/", authentication.basicJWT(), catchErrors(contractsController.create));

// Update one
router.put("/:id", authentication.basicJWT(), catchErrors(contractsController.update));

// Delete all
router.delete("/clear", authentication.basicJWT(), catchErrors(contractsController.clear));

// Delete one
router.delete("/:id", authentication.basicJWT(), catchErrors(contractsController.delete));

// Export our router
module.exports = router;