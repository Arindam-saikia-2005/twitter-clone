const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect("mongodb+srv://arindamsaikia18a:1k2zsNeq8O4Qbguz@cluster0.kjejq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${connect.connection.host}`);
    console.log(`MongoDB URL: ${"mongodb+srv://arindamsaikia18a:1k2zsNeq8O4Qbguz@cluster0.kjejq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"}`); 
  } catch (error) {
    console.error(`Mongo connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
