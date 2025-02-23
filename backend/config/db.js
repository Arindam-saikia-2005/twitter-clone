const mongoose = require("mongoose");

const connectDB = async () => {
  try {
     await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDb is connected");
  } catch (error) {
    console.log("Mongo connection Error", error);
  }
};


module.exports = connectDB;