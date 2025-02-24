const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect =  await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDb connected : ${connect.connection.host}`);
    console.log(`MongoDB URI : ${process.env.MONGODB_URI}`)
  } catch (error) {
    console.log(`Mongo connection Error:${error.message}` );
    process.exit(1)
  }
};


module.exports = connectDB;