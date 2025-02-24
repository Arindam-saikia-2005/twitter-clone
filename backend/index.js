const express = require("express");
const dotenv = require("dotenv")
const path = require("path")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db.js")
const userRouter = require("./routes/authRoute.js")
const router = require("./routes/userRoute.js")
const postRouter = require("./routes/postRoute.js")
const notificationRouter = require("./routes/notificationRoute.js")

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5002;


app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:false}))

app.use(cookieParser())


app.use("/api/auth",userRouter);
app.use("/api/user",router);
app.use("/api/posts",postRouter);
app.use("/api/notifications",notificationRouter)

// MongoDB Connection



if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname,"frontend" ,"dist")));

    app.get("*",(req,res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}


connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is started at port: ${PORT}`);
    });
  });