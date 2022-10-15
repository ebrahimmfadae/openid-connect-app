import mongoose from "mongoose";

export default async () => {
  const URI = process.env.MONGODB_URI ?? "";
  try {
    return await mongoose.connect(URI, {});
  } catch (error) {
    console.error(error);
  }
};
