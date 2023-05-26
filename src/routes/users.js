const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// /api/users
router.get("/", usersController.get);

// /api/users/:id
router.get("/:id", usersController.getById);

module.exports = router;
