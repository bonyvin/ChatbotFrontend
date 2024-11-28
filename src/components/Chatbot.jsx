import React from "react";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import symbol from "../images/symbol.png";

export default function Chatbot() {
  const defaultTheme = createTheme();
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        item
        xs={4}
        sm={4}
        md={4}
        style={{
          height: "90vh",
          backgroundColor: "white",
          marginTop: "10vh",
          display:'flex',
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            flex: 1,
            alignItems: "flex-end",
            backgroundColor: "red",
            margin: "2vw",
          }}
        >
          <div style={{ flexDirection: "row", display: "flex" }}>
            <img
              src={symbol}
              style={{
                // alignSelf: "flex-start",

                width: "2.5vw",
                // position: "absolute",
                backgroundColor: "blue",
              }}
            />
            ExpX
          </div>
        </div>
      </Grid>
    </ThemeProvider>
  );
}
