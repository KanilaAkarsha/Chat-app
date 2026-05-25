import { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import ChatContext from "../../context/ChatContext.js";
import AuthContext from "../../context/AuthContext.js";
import toast from "react-hot-toast";

const ChatContainer = ({ showRightSideBar, toggleRightSideBar }) => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedText = input.trim();

    if (!trimmedText && !selectedImage) return null;

    await sendMessage({
      ...(trimmedText ? { text: trimmedText } : {}),
      ...(selectedImage ? { image: selectedImage } : {}),
    });

    setInput("");
    setSelectedImage("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("select an image file");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setSelectedUser()}
          className="md:hidden p-1"
          aria-label="Close conversation">
          <img src={assets.arrow_icon} alt="info" className="max-w-7" />
        </button>
        <button
          type="button"
          onClick={toggleRightSideBar}
          className="p-1 cursor-pointer relative z-10"
          aria-label="Chat help"
          title={
            showRightSideBar ? "Close details panel" : "Open details panel"
          }>
          <img src={assets.help_icon} alt="" className="max-w-5" />
        </button>
      </div>

      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 gap-2 pb-24">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}>
            {msg.image ? (
              <img
                src={msg.image}
                alt="message pic"
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 mb-3 max-w-[200px] md:text-sm font-light rounded-lg md:8 break-all bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                } `}>
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs flex flex-col items-center gap-1">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <p className="text-gray-500 text-[10px]">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      <div className="absolute left-0 bottom-0 right-0 flex items-center gap-3 p-3">
        {selectedImage && (
          <div className="relative mr-2">
            <img
              src={selectedImage}
              alt="Selected preview"
              className="w-25 h-25 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedImage("")}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] leading-none"
              aria-label="Remove selected image">
              x
            </button>
          </div>
        )}
        <div className="flex flex-1 items-center bg-[#282142] px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png , image/jpeg , image/jpg, image/webp, image/gif, image/svg+xml, image/apng"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="upload"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSendMessage}
          className="w-7 cursor-pointer"
          aria-label="Send message">
          <img src={assets.send_button} alt="" className="w-7" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-white text-lg font-medium">
        Select a user to start chat
      </p>
    </div>
  );
};

ChatContainer.propTypes = {
  showRightSideBar: PropTypes.bool.isRequired,
  toggleRightSideBar: PropTypes.func.isRequired,
};

export default ChatContainer;
