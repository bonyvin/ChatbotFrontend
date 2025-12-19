// import React from "react";
// import Add from "@mui/icons-material/AddCircle";
// import Smiley from "@mui/icons-material/EmojiEmotions";
// import MicIcon from "@mui/icons-material/Mic";
// import SendIcon from "@mui/icons-material/Send";
// import "../styles/chatbot-input-form.css"; // Optional external styling
// import { TextField } from "@mui/material";

// const ChatbotInputForm = ({
//   input,
//   setInput,
//   handleMessageSubmit,
//   uploadInvoice,
//   isPickerVisible,
//   setPickerVisible,
// }) => {
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     handleMessageSubmit(input);
//   };

//   return (
//     <form onSubmit={handleFormSubmit} id="form1" className="chatbot-input-form">
//       <label>
//         <input
//           type="file"
//           style={{ display: "none" }}
//           onChange={uploadInvoice}
//           onClick={(e) => (e.target.value = "")}
//         />
//         <Add className="paneIcon" />
//       </label>
//       <label>
//         <Smiley
//           className="paneIcon"
//           onClick={() => setPickerVisible(!isPickerVisible)}
//         />
//       </label>
//       <div class="wrapper">
//         <textarea
//           id="inputValue"
//           placeholder="Type a message..."
//           value={input}
//           rows={1}
//           onChange={(e) => {
//             setInput(e.target.value);
//             e.target.rows = 1; // Reset to 1 row before calculating
//             const lineCount = Math.min(
//               2,
//               Math.floor(e.target.scrollHeight / 24)
//             ); // 24px per line approx.
//             e.target.rows = lineCount;
//           }}
//           className="chatInputTextarea"
//         />
//         <div className="micDiv"  contentEditable>
//         <MicIcon
//           className="micIcon"
//           onClick={() => {
//             console.log("Mic icon clicked");
//           }}
//         /></div>
//       </div>

//       <label>
//         <SendIcon
//           className="paneIcon"
//           onClick={() => handleMessageSubmit(input)}
//         />
//       </label>
//     </form>
//   );
// };
 
// export default ChatbotInputForm;
import React, { useRef, useState } from "react";
import Add from "@mui/icons-material/AddCircle";
import Smiley from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import "../../styles/chatbot-input-form.css";

const ChatbotInputForm = ({
  input,
  setInput,
  handleMessageSubmit,
  uploadInvoice,
  isPickerVisible,
  setPickerVisible,
  promotion
}) => {
  // 1) Local ref for the textarea
  const textareaRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // send upstream
    handleMessageSubmit(input);
    // clear the text
    // setInput("");
    // collapse back to 1 row
    if (textareaRef.current) {
      textareaRef.current.rows = 1;
    }
  };

  const handleChange = (e) => {
    const ta = e.target;
    setInput(ta.value);

    // reset to 1, then re‑calc up to 2
    ta.rows = 1;
    const lineHeight = 24; // match your CSS
    const currentRows = Math.floor(ta.scrollHeight / lineHeight);
    ta.rows = Math.min(2, currentRows);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line
    }
    else if(e.key === 'Enter'){
      handleFormSubmit(e)
      
    }else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Handle other actions like submitting the form
      console.log('Submit action');
    }
  };

  return (

  <form onSubmit={handleFormSubmit} className="chatbot-input-form">
  <div className="inputBox">
    <textarea
      placeholder="Type your query here..."
      value={input}
      onChange={handleChange}
      className="chatInputArea"
      rows={1}
      ref={textareaRef}
      onKeyDown={handleKeyDown}
    />
    <div className="actionBar">
      {/* <Add className="actionIcon left" onClick={uploadInvoice} /> */}
      <label>
        <input
          type="file"
          style={{ display: "none" }}
          onChange={uploadInvoice}
          onClick={(e) => (e.target.value = "")}
        />
        <Add className="actionIcon left" />
      </label>
      <SendIcon className="actionIcon right" onClick={handleFormSubmit} />
    </div>
  </div>
</form>


  );
};

export default ChatbotInputForm;
