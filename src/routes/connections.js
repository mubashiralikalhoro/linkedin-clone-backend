const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connections");

router.route("/send-request").post(connectionController.sendRequest);
router.route("/accept-request").post(connectionController.acceptRequest);
router.route("/remove-connection").post(connectionController.removeConnection);
router.route("/get-connections").get(connectionController.getConnectedUsers);
router.route("/get-requests").get(connectionController.getConnectionRequests);

module.exports = router;
