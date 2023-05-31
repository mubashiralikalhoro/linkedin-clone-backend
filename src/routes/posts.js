const router = require("express").Router();
const postsController = require("../controllers/posts");
const multerUpload = require("../utils/multerUpload");

router
  .route("/")
  .get(postsController.get)
  .post(multerUpload.single("image"), postsController.post);
router
  .route("/:id")
  .get(postsController.getById)
  .delete(postsController.deleteById);

module.exports = router;
