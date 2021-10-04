import mongoose from "mongoose";

export default async () => {
  const URI = process.env.MONGODB_URI ?? "";
  try {
    return mongoose.connect(URI, {});
  } catch (error) {
    console.error(error);
  }
};
