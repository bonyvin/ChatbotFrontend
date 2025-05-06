import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import symbol from "../images/symbol.png";
import "../styles/testStyles.css";

export default function Header() {
  const defaultTheme = createTheme();
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
            <AccountCircleIcon
              style={{
                width: "1.25em",
                height: "1.25em",
                marginLeft: "1rem",
                marginRight: "0.5rem",
              }}
              className="headerIcons"
            />
            <NotificationsIcon
              style={{
                width: "1.25em",
                height: "1.25em",
                marginLeft: "0.5rem",
                marginRight: "1rem",
              }}
              className="headerIcons"
            />
          </div>
        </Grid>
        <div className="sideSpacer"></div>
      </div>
    </ThemeProvider>
  );
}
