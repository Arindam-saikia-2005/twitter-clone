const express = require("express")
const { SignIn, Login, Logout ,getMe } = require("../controller/authController.js")
const protectRoute = require("../middleware/authMiddleware.js")


const userRouter = express.Router()

userRouter.get("/me",protectRoute,getMe)
userRouter.post("/register",SignIn)
userRouter.post("/login",Login)
userRouter.post("/logout",Logout)




module.exports = userRouter