const User = require("../model/userModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../config/utils.js")


// Sign 
const SignIn = async (req, res) => {
  try {
    const { username,fullName, email, password} = req.body;

     if(!username || !fullName || !email || !password) {
       return res.json({
            success:false,
            message:"All fields are required"
        })
     }

     if(password.length < 8) {
       return res.json({
            message:"Password must be at least 8 characters"
        })
     }


    const existingUser = await User.findOne({ email });

    if (existingUser) {
     return res.json({
        message: "User Already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await new User({
      username,
      fullName,
      email,
      password: hashPassword,
    });

   if(newUser) {
    generateToken(newUser._id,res);
    res.status(201).json({
        _id:newUser._id,
        username:newUser.username,
        fullName:newUser.fullName,
        email: newUser.email,
        profilePic:newUser.profilePic,
        followers: newUser.followers,
				following: newUser.following,
        coverImg: newUser.coverImg,
    })
   }

   await newUser.save()
  } catch (error) {
    console.log("Error in SignIn controller", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


// Login
const Login = async (req, res) => {
 try {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

  if (!user || !isPasswordCorrect) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  generateToken(user._id, res);

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    followers: user.followers,
    following: user.following,
    profileImg: user.profileImg,
    coverImg: user.coverImg,
  });

 } catch (error) {
    console.log("Error in Login Controller",error)
    res.json({
        message:error.message
    }).status(500)
 }
 };


//  logout
const Logout = async(req,res) => {
  try {
    res.cookie("jwt","",{
      maxAge:0
    })
    res.json({message:"loggedOut successfully" })
  } catch (error) {
    console.log("Error in Logout Controller",error)
    res.status(500).json({
      message:error.message
    })
  }
}

const getMe = async(req,res) => {
  try {
    // if(!req.user || req.user._id) {
    //   return res.status(401).json({ error: "Unauthorized: No user found" });
    // }
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

module.exports = {
  SignIn,
  Login,
  Logout,
  getMe
};
