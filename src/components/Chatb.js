import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import "../styles/chatbot.css";
import "../styles/general.css";
import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
import Add from "@mui/icons-material/AddCircle";
import SendIcon from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const Chatb = () => {
  const [messages, setMessages] = useState(["Hi, how can I hjelp you"]);
  const [input, setInput] = useState("");
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const botReply = data.reply;
      setMessages([...newMessages, { text: botReply, fromUser: false }]);
    } catch (error) {
      const botReply = "Hello,user";
      setMessages([...newMessages, { text: botReply, fromUser: false }]);
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    const newMessages = [
      ...messages,
      { text: "Hi, how can I help you?", fromUser: false },
    ];
    setMessages(newMessages);
  });
  const defaultTheme = createTheme();
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid item xs={4} sm={4} md={4} className="chatbot-container" style={{}}>
        {" "}
        <div className="chatbot">
          <div className="chatbot-messages" style={{}}>
            {messages.map((message, index) => (
              <div
                style={{
                  display: "flex",
                  alignItems: message.fromUser ? "flex-end" : "flex-start",
                  flexDirection: "column",
                }}
              >
                <ChatMessage
                  key={index}
                  text={message.text}
                  fromUser={message.fromUser}
                />
              </div>
            ))}
          </div>
          <form
            onSubmit={handleMessageSubmit}
            className="chatbot-input-form"
            style={{ display: "flex" }}
          >
            <Add style={{ color: "white" }} />
            <Smiley style={{ color: "white" }} />

            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ margin: "0.5rem", height: "2rem" }}
            />
            <SendIcon style={{ color: "white" }} />
            <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
          </form>
        </div>{" "}
      </Grid>
    </ThemeProvider>
  );
};
export default Chatb;
