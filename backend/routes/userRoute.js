const express = require("express");
const protectRoute = require("../middleware/authMiddleware.js")
const  {getUserProfile , followUnfollowUser,suggestToFollow, updateUser}  = require("../controller/userController.js")

const router = express.Router()

router.get("/profile/:username",protectRoute,getUserProfile)
router.get("/suggested",protectRoute,suggestToFollow)
router.post("/follow/:id",protectRoute,followUnfollowUser)
router.post("/update",protectRoute,updateUser)

module.exports = router;