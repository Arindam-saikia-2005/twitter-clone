const express = require("express")
const protectRoute = require("../middleware/authMiddleware.js");
const {createPost,deletePost,commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts,} = require("../controller/postController.js");

const postRouter = express.Router()


postRouter.get("/allpost", protectRoute, getAllPosts);
postRouter.get("/following", protectRoute, getFollowingPosts);
postRouter.get("/likes/:id", protectRoute, getLikedPosts);
postRouter.get("/user/:username", protectRoute, getUserPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, commentOnPost);
postRouter.delete("/:id", protectRoute, deletePost);


module.exports = postRouter;