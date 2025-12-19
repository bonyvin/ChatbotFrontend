import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import * as React from "react";
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { purple } from "@mui/material/colors";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";
import kpmgWhite from "../../images/kpmg-white.png";
import loginImage from "../../images/login-background.png";
import symbol from "../../images/symbol.png";
import "../../styles/login-page.css";


// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const theme = createTheme({
  palette: {
    ochre: {
      main: "#E3D026",
      light: "#E9DB5D",
      dark: "#A29415",
      contrastText: "#242105",
    },
    blueColor: {
      dark: "#1C244B",
    },
    white: "#FFFFFF",
  },
});
export default function SignInSide() {
  // const CssTextField = makeStyles({
  //   root: {
  //     '& label': {
  //       color: 'red',
  //     },
  //     '& label.Mui-focused': {
  //       color: 'white',
  //     },
  //     '& .MuiInput-underline:after': {
  //       borderBottomColor: 'yellow',
  //     },
  //     '& .MuiOutlinedInput-root': {
  //       '& fieldset': {
  //         borderColor: 'white',
  //       },
  //       '&:hover fieldset': {
  //         borderColor: 'white',
  //       },
  //       '&.Mui-focused fieldset': {
  //         borderColor: 'yellow',
  //       },
  //     },
  //   },
  // })(TextField);
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };
  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
    "&:hover": {
      backgroundColor: purple[700],
    },
    fontSize: "5 rem",
    fontWeight: "700",
    fontFamily: ["OpenSans", "sans-serif"],
  }));
  const navigate = useNavigate();


  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ minHeight: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            backgroundColor: "var(--primary-color)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: "2rem", md: "4rem" },
          }}
        >
          <div className="img-div">
            <img className="img-div1" src={symbol} alt="symbol" />
            <img className="img-div2" src={kpmgWhite} alt="kpmg" />
          </div>

          <Box
            sx={{
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div className="textContainer">
              <div className="textStyle">Welcome to KPMG's </div>
              <div className="expContainerHeader">
                <div className="textStyleHeader">{"Experience"}</div>
                <div className="xHeader">{"X"}</div>
              </div>
            </div>

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <div className="signIn-div">
                <div className="signIn-heading">SIGN IN</div>
                <div className="signIn-sub-heading">
                  Sign in to your supplier portal
                </div>
              </div>

              <div className="form-details">
                <div className="input-heading">USERNAME</div>
                <InputGroup className="mb-3">
                  <Form.Control
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "var(--border-grey)",
                      borderRadius: 0,
                      borderWidth: 0,
                      borderBottomWidth: "1px",
                      color: "var(--white)",
                    }}
                  />
                  <InputGroup.Text
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      borderRadius: 0,
                      borderBottomWidth: "1px",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <PersonIcon style={{ color: "var(--white)" }} />
                  </InputGroup.Text>
                </InputGroup>

                <div className="input-heading">PASSWORD</div>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="password"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "var(--border-grey)",
                      borderRadius: 0,
                      borderWidth: 0,
                      borderBottomWidth: "1px",
                      color: "var(--white)",
                    }}
                  />
                  <InputGroup.Text
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      borderRadius: 0,
                      borderBottomWidth: "1px",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <LockIcon style={{ color: "var(--white)" }} />
                  </InputGroup.Text>
                </InputGroup>

                <div className="footer-div">
                  <input type="checkbox" className="checkboxStyle" />
                  I agree to the&nbsp;
                  <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                    terms & conditions.
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "var(--white)",
                  color: "var(--primary-color)",
                  fontWeight: "700",
                  padding: "0.8rem",
                  "&:hover": {
                    backgroundColor: "var(--text-light-grey)",
                  },
                  mb: 2,
                }}
                onClick={() => navigate("/chatbot")}
              >
                LOGIN
              </Button>

              <Grid container>
                <Grid item xs>
                  <Link
                    href="#"
                    className="openSans"
                    variant="body2"
                    sx={{
                      textDecoration: "none",
                      color: "var(--text-light-grey)",
                      fontSize: "0.7rem",
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={false}
          md={4}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--white)",
          }}
        >
          <div className="imageContainer">
            <img src={loginImage} alt="login splash" />
          </div>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
