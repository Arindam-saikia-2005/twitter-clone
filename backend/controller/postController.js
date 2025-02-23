const Post = require("../model/postModel.js")
const User = require("../model/userModel.js")
const cloudinary = require("../config/cloudinary.js")
const Notification = require("../model/notificationModel.js")

const createPost = async(req,res) => {
  try {
    let {text, img} = req.body
    const userId = req.user._id
    const user = await User.findById(userId)

    if(!user) return res.status(400).json({error:"User not found"})

    if(!text && !img ) return res.status(400).json({error:"Post must a text or image"})  
        
     if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
	} 
        
     const newPost = new Post({
        user:userId,
        text,
        img
     }) 
     
     await newPost.save()

     res.status(201).json(newPost)
  } catch (error) {
    console.log("Error in creatPost controller",error)
    res.status(500).json({message:error.message})
  }
}

const deletePost = async(req,res) => {
  try {
    const { id:userId } = req.params

    const post = await Post.findById(userId)

    if(!post) return res.status(400).json({error:"post not found"})

   if(post.user.toString() !== req.user._id.toString() ) {
    return res.status(400).json({error:"You are not Authorized to delete"})
   }

   if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
   }

//    This line delete the post from the mongoDb through the userId
   await Post.findByIdAndDelete(userId)

   res.status(200).json({message:"Post deleted successfully"})

  } catch (error) {
    console.log("Error in Delete controller",error)
    res.status(500).json({message:error.message})
  }
}

const commentOnPost = async(req,res) => {
  try {
    const {text} = req.body
    const postId = req.params.id
    const userId = req.user._id

    if(!text) return res.status(400).json({error:"Text field is required"})

     const post = await Post.findById(postId)
     
     if(!post) return res.status(400).json({error:"Post not found"})

      const comment = {user:userId, text} 
      
      post.comments.push(comment)

      await post.save()

      res.status(201).json(post)

  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ message:error.message })
  }
}

const likeUnlikePost = async(req,res) => {
  try {
     const userId = req.user._id
     const {id:postId} = req.params

    const post = await Post.findById(postId)

    if(!post) return res.status(400).json({error:"Post not found"})

   const userLikePost = post.likes.includes(userId)

   if(userLikePost) {
    //  unlike post
    await post.updateOne({_id:postId},{$pull : {likes:userId}})
    await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

    const updateLikes = post.likes.filter((id) => id.toString() !== userId.toString());
    res.status(200).json(updateLikes)
   } else {
    // Like the post
    post.likes.push(userId)
    await post.save();
    await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
    const notification = new Notification({
        from:userId,
        to:post.user,
        type:"like"
    })

    await notification.save()

    const updatedLikes = post.likes
    res.status(200).json(updatedLikes)


   }

  } catch (error) {
    console.log("Error in userPostLike controller",error)
    res.status(500).json({message:error.message})
  }
}

const getAllPosts = async(req,res) => {
   try {
    // sort({ created : -1 }) gives latest posts
    const allPosts = await Post.find().sort({ created : -1 }).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"comments.user",
        select:"-password"
    })

    if(allPosts === 0) return res.status(200).json([])

     res.status(200).json(allPosts) 

   } catch (error) {
    console.log("Error in getAllPosts controller",error.message)
    res.status(500).json({message:error.message})
   }
}

const getLikedPosts = async(req,res) => {
  const userId = req.params.id;
	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ message:error.message });
	}
}

const getFollowingPosts = async(req,res) => {
  try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ message:error.message });
	}
}

const getUserPosts = async(req,res) => {
  try {
    const {username} = req.params
    const user = User.findOne({username})
   
    if(!user) return res.json(400).json({error:"User not  found"})

    const userPosts = await Post.find({user : user._id}).sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "comments.user",
      select: "-password",
    });

    res.status(200).json(userPosts)
  } catch (error) {
    console.log("Error in getUserPosts",error)
    res.status(500).json({message:error.message})
  }
}

module.exports = {createPost,
    deletePost,
    commentOnPost,
    likeUnlikePost,
    getAllPosts,
    getLikedPosts,
    getFollowingPosts,
    getUserPosts
}