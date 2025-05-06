import React from "react";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import kpmgWhite from "../images/kpmgWhite.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "../styles/testStyles.css";
import symbol from "../images/symbol.png";

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
