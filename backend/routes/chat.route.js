const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.get("/sessions", chatController.getSessions);
router.get("/sessions/:id", chatController.getSessionById);
router.post("/sessions", chatController.saveSession);
router.delete("/sessions/:id", chatController.deleteSession);

module.exports = router;
