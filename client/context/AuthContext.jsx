import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import AuthContext from "./AuthContext.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const disconnectSocket = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off("getOnlineUsers");
    socketRef.current.disconnect();
    socketRef.current = null;
    setSocket(null);
    setOnlineUsers([]);
  }, []);

  const connectSocket = useCallback(
    (userData) => {
      if (!userData?._id) return;

      const existing = socketRef.current;
      const existingUserId = existing?.io?.opts?.query?.userId;

      // avoid creating duplicate sockets for the same logged-in user
      if (existing?.connected && existingUserId === userData._id) {
        return;
      }

      // if a stale socket exists (different user or half-open), clean it first
      if (existing) {
        disconnectSocket();
      }

      const newSocket = io(backendUrl, {
        transports: ["websocket"],
        query: {
          userId: userData._id,
        },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });

      newSocket.on("disconnect", () => {
        setOnlineUsers([]);
      });
    },
    [disconnectSocket],
  );

  const login = useCallback(async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("authUser", JSON.stringify(data.userData));
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setToken(null);
    setAuthUser(null);
    toast.success("Logged out successfully");
    disconnectSocket();
  }, [disconnectSocket]);

  const updateProfile = useCallback(async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    } else {
      delete axios.defaults.headers.common["token"];
    }
  }, [token]);

  useEffect(() => {
    if (authUser) {
      const t = setTimeout(() => connectSocket(authUser), 0);
      return () => clearTimeout(t);
    }
  }, [authUser, connectSocket]);

  useEffect(() => () => disconnectSocket(), [disconnectSocket]);

  const value = useMemo(
    () => ({
      axios,
      authUser,
      onlineUsers,
      socket,
      login,
      logout,
      updateProfile,
    }),
    [authUser, onlineUsers, socket, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
