import PropTypes from "prop-types";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ChatContext from "./ChatContext.js";
import AuthContext from "./AuthContext.js";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios]);

  const getMessages = useCallback(
    async (userId) => {
      try {
        const { data } = await axios.get(`/api/messages/${userId}`);

        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios],
  );

  const sendMessage = useCallback(
    async (messageData) => {
      try {
        const { data } = await axios.post(
          `/api/messages/send/${selectedUser._id}`,
          messageData,
        );
        if (data.success) {
          setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios, selectedUser],
  );

  const clearChatHistory = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.delete(
        `/api/messages/clear/${selectedUser._id}`,
      );

      if (data.success) {
        setMessages([]);
        toast.success("Chat history cleared");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, axios]);

  const value = useMemo(
    () => ({
      messages,
      users,
      selectedUser,
      getUsers,
      getMessages,
      sendMessage,
      clearChatHistory,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
    }),
    [
      messages,
      users,
      selectedUser,
      getUsers,
      getMessages,
      sendMessage,
      clearChatHistory,
      unseenMessages,
    ],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
