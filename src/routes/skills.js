const router = require("express").Router();
const skillsController = require("../controllers/skills");

router.get("/:id", skillsController.get);

module.exports = router;
