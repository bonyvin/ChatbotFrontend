import React from "react";
import user from "../../images/user.png";
import symbolBlue from "../../images/symbolBlue.png";

import "../../styles/general.css";

const ChatMessage = ({ text, fromUser, isFile = false }) => {

  
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    // <div className={`chat-message-row ${fromUser ? 'user' : 'bot'}`}>
    //   {fromUser ? (
    //     <>
    //       <div className="avatar-label user-label">
    //         You
    //         <img src={user} className="avatar" />
    //       </div>
    //       <div className="message-container">
    //         <div className={isFile ? "message-file user-file" : "message-bubble user-bubble"}>
    //           {text}
    //         </div>
    //       </div>
    //     </>
    //   ) : (
    //     <>
    //       <div className="avatar-label bot-label">
    //         <img src={symbolBlue} className="avatar" />
    //         ExpX Engine
    //       </div>
    //       <div className="message-container">
    //         <div className={isFile ? "message-file bot-file" : "message-bubble bot-bubble"}>
    //           {text}
    //         </div>
    //       </div>
    //     </>
    //   )}
    // </div>

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
            {/* You
            <img src={user} style={{ width: "2rem", marginLeft: "0.3rem" }} /> */}
            
            <div className="chatIdentity">
              <img src={user} className="chatIcon" />
              <span className="chatName">You</span>
            </div>
            <span className="chatTime">{formattedTime}</span>

            
          </div>

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
            className="container"
            // className="container openSans"
            style={{
              width: "100%",
              fontWeight: "700",
              fontSize: "0.75rem",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {/* <img
              src={symbolBlue}
              style={{ width: "2rem", marginRight: "0.3rem" }}
            />
            ExpX */}
            
              <div className="chatIdentity">
                <img src={symbolBlue} className="chatIcon" />
                <span className="chatName">ExpX</span>
              </div>
              <span className="chatTime">{formattedTime}</span>

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




