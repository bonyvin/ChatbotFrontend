import React from "react";
import user from "../images/user.png";
import symbol from "../images/symbol.png";
import symbolBlue from "../images/symbolBlue.png";

import "../styles/general.css";

const ChatMessage = ({ text, fromUser, isFile = false }) => {
  return (
    <>
      {fromUser === true ? (
        <div style={{ marginBottom: "1rem" }}>
          <div
            className="container openSans"
            style={{
              // width: "100%",
              fontWeight: "700",
              fontSize: "0.75rem",
              alignItems: "center",
            }}
          >
            You
            <img src={user} style={{ width: "2rem", marginLeft: "0.3rem" }} />
          </div>
          {/* <div className="container">
            <div className={`message-bubble ${fromUser ? "user" : "bot"}`}>
              {text}
            </div>
          </div> */}
          <div className={isFile ? "" : "container"}>
            {isFile ? (
              <div className="containerUserUpload">{text}</div>
            ) : (
              <div
                className={`message-bubble user`}
              >
                {text}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "1rem" }}>
          <div
            className="container openSans"
            style={{
              width: "100%",
              fontWeight: "700",
              fontSize: "0.75rem",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <img
              src={symbolBlue}
              style={{ width: "2rem", marginRight: "0.3rem" }}
            />
            ExpX
          </div>
          <div className={isFile ? "" : "containerBot"}>
            {isFile ? (
              <div>{text}</div>
            ) : (
              <div
                className={`message-bubble-bot bot`}
              >
                {text}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default ChatMessage;
