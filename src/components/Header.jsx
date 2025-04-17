import React from "react";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import kpmgWhite from "../images/kpmgWhite.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "../styles/general.css"

export default function Header() {
  const defaultTheme = createTheme();
  return (
    <ThemeProvider theme={defaultTheme}>
      <div className="fixedContainer">
        <Grid item xs={4} sm={4} md={4} className="headerGrid">
          <div className="logoContainer">
            <img src={kpmgWhite} className="logoImage" />
          </div>
          <div className="expContainer">
            <div className="textContainer">
              <div className="textStyle">
                Exp.
                <div className="X">X</div>
              </div>
            </div>
          </div>
          <div className="iconContainer">
            <AccountCircleIcon sx={{ width: "1.25em", height: "1.25em" }} />
            <NotificationsIcon sx={{ width: "1.25em", height: "1.25em" }} />
          </div>
        </Grid>
        <div className="sideSpacer"></div>
      </div>
    </ThemeProvider>
  );
}
