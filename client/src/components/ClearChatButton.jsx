import { useContext } from "react";
import PropTypes from "prop-types";
import ChatContext from "../../context/ChatContext.js";

const ClearChatButton = ({ className = "" }) => {
  const { clearChatHistory, selectedUser } = useContext(ChatContext);

  const handleClearChat = async () => {
    if (!selectedUser) return;

    const shouldClear = window.confirm(
      `Clear chat history with ${selectedUser.fullName}?`,
    );

    if (!shouldClear) return;

    await clearChatHistory();
  };

  return (
    <button
      type="button"
      onClick={handleClearChat}
      className={`w-full py-3 rounded bg-red-500/80 text-white text-sm transition hover:bg-red-500 ${className}`}>
      Clear chat history
    </button>
  );
};

ClearChatButton.propTypes = {
  className: PropTypes.string,
};

export default ClearChatButton;
