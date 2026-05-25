import { protectRoute } from "../middleware/auth.js";
import {
  clearChatHistory,
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
import express from "express";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.delete("/clear/:id", protectRoute, clearChatHistory);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
