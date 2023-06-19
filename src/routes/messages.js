const router = require("express").Router();

const messageController = require("../controllers/messages");

router.route("/").get(messageController.get);
router.route("/chat/:withUserId").get(messageController.getChat).post(messageController.send);
router.route("/chat/:withUserId/mark-as-read").post(messageController.markAsRead);

module.exports = router;
