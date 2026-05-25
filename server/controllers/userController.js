import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudnary.js";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const signup = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const fullName = (req.body.fullName || req.body.FullName || "").trim();
  const bio = (req.body.bio || "").trim();

  try {
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({
      email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
    });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    console.log("New user created:", newUser);

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in signup:", error);
    res.json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const userData = await User.findOne({
      email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
    });

    if (!userData) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(userData._id);
    res.json({
      success: true,
      userData,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  res.json({
    success: true,
    userData: req.user,
    message: "User is authenticated",
  });
};

export const checkPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    // fetch full user (including password)
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, message: "Password verified" });
  } catch (error) {
    console.log("Error in checkPassword:", error);
    res.json({
      success: false,
      message: "Error verifying password",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Both current and new passwords are required",
        });
    }

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in changePassword:", error);
    res.json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, bio, profilePic } = req.body;
  try {
    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true },
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio, profilePic: upload.secure_url },
        { new: true },
      );
    }

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log("Error in updateProfile:", error);
    res.json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
