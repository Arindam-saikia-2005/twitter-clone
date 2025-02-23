const express = require("express");
const dotenv  = require("dotenv")
dotenv.config()
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db.js")
const userRouter = require("./routes/authRoute.js")
const router = require("./routes/userRoute.js")
const postRouter = require("./routes/postRoute.js")
const notificationRouter = require("./routes/notificationRoute.js")

const PORT = process.env.PORT || 5002

const app = express();

connectDB()


app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:false}))

app.use(cookieParser())


app.use("/api/auth",userRouter);
app.use("/api/user",router);
app.use("/api/posts",postRouter);
app.use("/api/notifications",notificationRouter)


app.listen(PORT,()=>console.log(`server is started at port ${PORT}`))