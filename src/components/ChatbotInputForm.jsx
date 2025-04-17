import React from "react";
import Add from "@mui/icons-material/AddCircle";
import Smiley from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import "../styles/ChatbotInputForm.css"; // Optional external styling

const ChatbotInputForm = ({
  input,
  setInput,
  handleMessageSubmit,
  uploadInvoice,
  isPickerVisible,
  setPickerVisible,
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleMessageSubmit(input);
  };

  return (
    <form onSubmit={handleFormSubmit} id="form1" className="chatbot-input-form">
      <label>
        <input
          type="file"
          style={{ display: "none" }}
          onChange={uploadInvoice}
          onClick={(e) => (e.target.value = "")}
        />
        <Add className="paneIcon" />
      </label>
      <label>
        <Smiley
          className="paneIcon"
          onClick={() => setPickerVisible(!isPickerVisible)}
        />
      </label>
      <div class="wrapper">
        <input
          id="inputValue"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chatInput"
        />
        <MicIcon
          className="micIcon"
          onClick={() => {
            console.log("Mic icon clicked");
          }}
        />
      </div>
      {/* <div className="inputWrapper">
        <input
          id="inputValue"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chatInput"
        />
        <MicIcon
          className="micIcon"
          onClick={() => {
            console.log("Mic icon clicked");
          }}
        />
      </div> */}
      <label>
        <SendIcon
          className="paneIcon"
          onClick={() => handleMessageSubmit(input)}
        />
      </label>
    </form>
  );
};

export default ChatbotInputForm;
