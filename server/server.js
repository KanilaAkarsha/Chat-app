import express from "express";
import "dotenv/config.js";
import cors from "cors";
import { createServer } from "node:http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL || "http://localhost:5174",
    process.env.FRONTEND_URL || "http://localhost:5174",
    // Vite default dev origin
    "http://localhost:5173",
  ].filter(Boolean),
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  try {
    const u = new URL(origin);
    // allow any localhost origin during development
    if (u.hostname === "localhost") return true;
  } catch (e) {
    // fallthrough
  }
  return false;
};

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("user connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: "4mb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,token",
    );
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api/status", (req, res) => res.send("Server is live"));

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const listenServer = () => {
    const listener = server.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });

    listener.on("error", async (error) => {
      if (error.code !== "EADDRINUSE") {
        console.error(error);
        process.exit(1);
        return;
      }

      try {
        const response = await fetch(`http://localhost:${PORT}/api/status`);
        if (response.ok) {
          console.log(
            `Port ${PORT} is already serving this app, so this launch will exit cleanly.`,
          );
          process.exit(0);
          return;
        }
      } catch {
        // fall through to the user-facing message below
      }

      console.error(
        `Port ${PORT} is already in use. Stop the existing process or change PORT.`,
      );
      process.exit(1);
    });
  };

  listenServer();
}

export default server;
