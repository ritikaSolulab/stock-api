import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      ref: "Stock",
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
