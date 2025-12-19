
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useState } from 'react';
import symbol from "../images/symbol.png";
import LogoutRounded from "../images/logout-rounded.png";
import GoogleAlerts from "../images/google-alerts.png";
// import "../styles/test-styles.css";
import { Button,Nav } from "react-bootstrap";
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
// import { LogoutRounded } from "@mui/icons-material";


export default function Header() {
  const defaultTheme = createTheme();

 const [showSideMenu, setShowSideMenu] = useState(false);

  const handleSideMenu = () => {
    setShowSideMenu(!showSideMenu);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <div className="fixedContainer">
        <Grid item xs={4} sm={4} md={4} className="headerGrid">
          <div className="logoContainer">
            <img src={symbol} className="logoImage" />
          </div>
          <div className="expContainerHeader">
            <div className="textStyleHeader">{"Experience"}</div>
            <div className="xHeader">{"X"}</div>
          </div>
          <div className="iconContainer">
            <img src={GoogleAlerts}
              style={{
                width: "1.5625rem",
                height: "1.5625rem",
                marginLeft: "1rem",
                marginRight: "0.5rem",
              }}
              className="headerIcons"
            />
            {/* <NotificationsIcon
              style={{
                width: "1.25em",
                height: "1.25em",
                marginLeft: "0.5rem",
                marginRight: "1rem",
              }}
              className="headerIcons"
            /> */}
              <img src={LogoutRounded}
              style={{
                width: "1.5625rem",
                height: "1.5625rem",
                marginLeft: "0.5rem",
                marginRight: "1rem",
              }}
              className="headerIcons"
            />
          </div>
        </Grid>
        <div className="curved"></div>
        
        {/* <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebarToggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
          </div>
          {isSidebarOpen && (
            <div className="sidebarContent">
            </div>
          )}
        </div> */}
         <Nav className={`flex-column sideMenu ${showSideMenu ? "open" : ""}`}>
            {/* <MenuBar showSideMenu={showSideMenu} /> */}
          </Nav>
         <Button
            onClick={handleSideMenu}
            style={{
              position: "fixed",
              width:"1.1rem",
              marginLeft: showSideMenu ? "5vw" : "1vw",
              marginTop: "43vh",
              display: "flex",
              height: "fit-content",
              background: "#2E333E",
              border: 0,
              backgroundColor:"#2E333E ",
              transform: "translateY(-50%)",
            }}
          >
            {showSideMenu ? (
              <ArrowBackIos
                style={{ fontSize: "1rem", color: "rgb(255, 255, 255)" }}
              ></ArrowBackIos>
            ) : (
              <ArrowForwardIos
                style={{ fontSize: "1rem", color: "rgb(255, 255, 255)" }}
              ></ArrowForwardIos>
            )}
          </Button>

          <div className="borderBar"></div>
      </div>
    </ThemeProvider>
  );
}


