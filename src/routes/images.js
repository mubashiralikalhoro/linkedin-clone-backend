const router = require("express").Router();
const imagesController = require("../controllers/images");
router.get("/uploads/:key", imagesController.getImage);
module.exports = router;
