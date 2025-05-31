import mongoose from "mongoose";
import "dotenv/config";

const baseURL = process.env.DB_URL;
const connectWithMongoDB = async () => {
  try {
    await mongoose.connect(`${baseURL}`);
    console.log("connected with mongodb");
  } catch (error) {
    console.log(`connection with mongodb failed : ${error}`);
  }
};

export default connectWithMongoDB;
