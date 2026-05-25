import express from "express";
import {
  signup,
  login,
  updateProfile,
  checkAuth,
  checkPassword,
  changePassword,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.post("/check-password", protectRoute, checkPassword);
userRouter.put("/change-password", protectRoute, changePassword);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
