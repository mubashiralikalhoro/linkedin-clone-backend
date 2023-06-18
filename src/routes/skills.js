const router = require("express").Router();
const skillsController = require("../controllers/skills");

router.get("/user/:id", skillsController.getByUser);
router.get("/", skillsController.getAll);

module.exports = router;
