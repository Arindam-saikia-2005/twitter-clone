const jwt  = require("jsonwebtoken")
const User = require("../model/userModel.js")


const protectRoute = async(req,res,next) => {
  try {
    const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded_token) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		const user = await User.findById(decoded_token.userId).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;
		next();
  } catch (error) {
    console.log("Error in Middleware ",error)
    res.status(500).json({
        success:false,
       message:error.message
    })
  }
}

module.exports = protectRoute