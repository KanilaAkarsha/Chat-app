import { useCallback, useEffect, useState, useMemo } from "react";
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

  const connectSocket = useCallback(
    (userData) => {
      if (!userData || socket?.connected) return;

      const newSocket = io(backendUrl, {
        query: {
          userId: userData._id,
        },
      });
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });
    },
    [socket],
  );

  const login = useCallback(
    async (state, credentials) => {
      try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        if (data.success) {
          setAuthUser(data.userData);
          connectSocket(data.userData);
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
    },
    [connectSocket],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    toast.success("Logged out successfully");
    socket?.disconnect();
  }, [socket]);

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
    // ensure socket connects when authUser is present (e.g., after refresh)
    if (authUser) {
      // defer to avoid synchronous setState inside effect
      const t = setTimeout(() => connectSocket(authUser), 0);
      return () => clearTimeout(t);
    }
  }, [authUser, connectSocket]);

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
