const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// api/users
router.route("/").get(usersController.getAll);
// api/users/:id
router
  .route("/:id")
  .get(usersController.getById)
  .delete(usersController.deleteById)
  .put(usersController.updateById);

module.exports = router;
