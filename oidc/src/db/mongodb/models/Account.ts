import mongoose, { Schema } from "mongoose";

const AccountSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  email: {
    type: String,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
});

export const Account = mongoose.model("Account", AccountSchema);
