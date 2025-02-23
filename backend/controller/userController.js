const User = require("../model/userModel.js");
const Notification = require("../model/notificationModel.js");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary.js")

const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.json({
        message: "user not found",
      });
    }
    res.status(200).send({ user });
  } catch (error) {
    console.log("Error in getUserProfile Controller", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.json({
        message: "YOu can not follow/unfollow to yourself",
      });
    }
    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({
        message: "User unfollowed successfully",
      });
    } else {
      //  follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const notification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await notification.save();

      res.status(200).json({
        message: "user followed successfully",
      });
    }
  } catch (error) {
    console.log("Error in followUnfollowToUser controller", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

const suggestToFollow = async (req, res) => {
  try {
    //The userId we can get from the protected route
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: { id: { $ne: userId } },
      },
      { $sample: { size: 10 } },
    ]);

    // This line removes users who are already followed by the current user
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => {
      user.password === null;
    });

    res.status(200).json({ suggestedUsers });
  } catch (error) {
    console.log("Error in suggestedUser controller", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profilePic, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}
    console.log("Existing Profile Image:", user.profilePic);
    console.log("Existing Cover Image:", user.coverImg);


		if (profilePic) {
      if (user.profileImg) {
          try {
              const profileImgUrl = user.profileImg;
              console.log("Profile Image URL Before Deleting:", profileImgUrl);
  
              // Check if profileImgUrl exists before calling split
              if (profileImgUrl.includes("/")) {
                  const publicId = profileImgUrl.split("/").pop().split(".")[0];
                  await cloudinary.uploader.destroy(publicId);
              } else {
                  console.warn("Skipping profile image deletion, invalid URL:", profileImgUrl);
              }
          } catch (error) {
              console.error("Error destroying old profile image:", error);
          }
      }
  
      try {
          const uploadedResponse = await cloudinary.uploader.upload(profilePic);
          profilePic = uploadedResponse.secure_url;
          console.log("Uploaded Profile Pic URL:", profilePic);
      } catch (error) {
          console.error("Cloudinary Upload Error:", error);
      }
  }
  
  if (coverImg) {
      if (user.coverImg) {
          try {
              const coverImgUrl = user.coverImg;
              console.log("Cover Image URL Before Deleting:", coverImgUrl);
  
              if (coverImgUrl.includes("/")) {
                  const publicId = coverImgUrl.split("/").pop().split(".")[0];
                  await cloudinary.uploader.destroy(publicId);
              } else {
                  console.warn("Skipping cover image deletion, invalid URL:", coverImgUrl);
              }
          } catch (error) {
              console.error("Error destroying old cover image:", error);
          }
      }
  
      try {
          const uploadedResponse = await cloudinary.uploader.upload(coverImg);
          coverImg = uploadedResponse.secure_url;
          console.log("Uploaded Cover Image URL:", coverImg);
      } catch (error) {
          console.error("Cloudinary Upload Error:", error);
      }
  }
  

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profilePic = profilePic || user.profilePic;
		user.coverImg = coverImg || user.coverImg;
     
    console.log("Before saving",user)
		await user.save();
    console.log("After saving",user)

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
  getUserProfile,
  followUnfollowUser,
  suggestToFollow,
  updateUser,
};
