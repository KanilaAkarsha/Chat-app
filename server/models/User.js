import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: { type: String, required: true, trim: true },
    password: { type: String, required: true, minLength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "I am using QuickChat!", trim: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

console.log("User model loaded successfully");

export default User;
