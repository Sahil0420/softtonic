import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try{

    if(!process.env.MONGO_URI){
      console.log("No uri")
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
