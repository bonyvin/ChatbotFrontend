import React from "react";
import typingIndicator from "../../images/typing-indicator-1.gif";
import ChatMessage from "../ChatMessage/ChatMessage";
import "../../styles/chatbot.css";
import "../../styles/general.css";


const TypingIndicatorComponent = ({ scrollToBottom }) => {
  scrollToBottom();
  return (
    <div className="bot-message">
      <ChatMessage
        text={
          <img
            src={typingIndicator}
            style={{
              width: "2rem",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
            }}
            alt="typing indicator"
          />
        }
        fromUser={false}
      />
    </div>
  );
};
export default TypingIndicatorComponent;
