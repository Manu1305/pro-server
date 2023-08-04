const express = require("express");
const authMiddleware = require("../Middlewares/authuser");
const router = express.Router();
const { getNotifications,createNotification } = require("../controllers/notiController");

router.post("/create-noti", authMiddleware, createNotification);
router.get("/get-user-noti", authMiddleware, getNotifications);

module.exports = router;
