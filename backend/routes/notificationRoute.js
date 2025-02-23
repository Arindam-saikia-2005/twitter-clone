const express = require("express")
const protectRoute = require("../middleware/authMiddleware.js")
const {getNotifications, deleteNotifications, }= require("../controller/notificationController.js")


const notificationRouter = express.Router()

notificationRouter.get("/", protectRoute, getNotifications);
notificationRouter.delete("/", protectRoute, deleteNotifications);

module.exports = notificationRouter