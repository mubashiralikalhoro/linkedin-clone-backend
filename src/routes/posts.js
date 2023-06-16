const router = require("express").Router();
const postsController = require("../controllers/posts");
const multerUpload = require("../utils/multerUpload");

// posts
router.route("/").get(postsController.get).post(multerUpload.single("image"), postsController.post);
router.route("/:id").get(postsController.getById).delete(postsController.deleteById);

// like
router.route("/:id/like").post(postsController.like);
router.route("/:id/unlike").post(postsController.unlike);

//  comment
router.route("/:id/comment").get(postsController.getComments).post(postsController.addComment);

module.exports = router;
