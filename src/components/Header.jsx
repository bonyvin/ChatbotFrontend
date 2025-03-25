import React from "react";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import kpmgWhite from "../images/kpmgWhite.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Header() {
  const defaultTheme = createTheme();
  return (
    <ThemeProvider theme={defaultTheme}>
      <div style={{ position: "fixed",zIndex:5 }}>
        <Grid
          item
          xs={4}
          sm={4}
          md={4}
          style={{
            height: "10vh",
            backgroundColor: "#1C244B",
            width: "100vw",
            justifyContent: "space-between",
            display: "flex",
            flexDirection: "row",
          }}
          fontStyle={{ color: "white" }}
        >
          <div
            className=""
            style={{
              alignItems: "center",
              display: "flex",
              width: "8%",
              justifyContent:'center'
            }}
          >
            <img
              src={kpmgWhite}
              style={{
                display: "flex",
                width: "90%",
                // padding: "1%",

                // marginTop: "5%",
              }}
            />
          </div>
          <div
            className=""
            style={{ alignItems:'center',display:'flex' }}
          >
            <div className="textContainer">
              <div className="textStyle">
                Exp.
                <div className="X">X</div>
              </div>
            </div>
          </div>
          <div
            className=""
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "8%",
              justifyContent:'space-evenly'

            }}
          >
            <AccountCircleIcon sx={{ width: "1.25em", height: "1.25em" }} />
            <NotificationsIcon sx={{ width: "1.25em", height: "1.25em" }} />
          </div>
        </Grid>
        <div
          style={{ display:'flex',flexGrow:1, backgroundColor: "#1C244B", width: "2%" }}
        ></div>
      </div>
    </ThemeProvider>
  );
}
