const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const contractsController = require("../controllers/contracts");

// Get all
router.get("/", catchErrors(contractsController.findAll));

// Get all
router.get("/names", catchErrors(contractsController.findAllNames));

// Get one by Id
router.get("/:id", catchErrors(contractsController.findById));

// Get one swagger by Id
router.get("/:id/swagger", catchErrors(contractsController.findSwaggerById));

// Add one
router.post("/", catchErrors(contractsController.create));

// Update one
router.put("/:id", catchErrors(contractsController.update));

// Delete all
router.delete("/clear", catchErrors(contractsController.clear));

// Delete one
router.delete("/:id", catchErrors(contractsController.delete));

// Export our router
module.exports = router;