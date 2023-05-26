const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// api/users
router.route("/").get(usersController.get).post(usersController.create);

// api/users/:id
router
  .route("/:id")
  .get(usersController.getById)
  .delete(usersController.deleteById);

module.exports = router;
