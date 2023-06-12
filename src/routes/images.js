const router = require("express").Router();
const imagesController = require("../controllers/images");

// /images/uploads/:key
router.get("/uploads/:key", imagesController.getImage);
module.exports = router;
