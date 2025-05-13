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
import kpmgWhite from "../../images/kpmgWhite.png";
import loginImage from "../../images/loginBackground.png";
import symbol from "../../images/symbol.png";
import "../../styles/testStyles.css";


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
      <Grid container component="main" style={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item xs={8} sm={8} md={8}
          style={{ backgroundColor: "rgba(28, 36, 75, 1)" }}>
          <div className="img-div"
            // style={{
            //   padding: "2%",
            //   flex: 1,
            //   display: "flex",
            //   flexDirection: "column",
            // }}
          >
            <img className="img-div1"
              src={symbol}
            />
            <img className="img-div2"
              src={kpmgWhite}
              // style={{width: "15%",display: "flex",alignSelf: "center",marginTop: "5%"}}
              />
          </div>

          <Box style={{my: 8, mx: 15,display: "flex",flexDirection: "column",alignItems: "center"}}>

            <div className="textContainer">
              <div className="textStyle">Welcome to KPMG's </div>
              <div className="expContainerHeader">
                <div className="textStyleHeader">{"Experience"}</div>
                <div className="xHeader">{"X"}</div>
              </div>
            </div>
            <Box component="form" noValidate onSubmit={handleSubmit}
              style={{ marginLeft: "10%", marginRight: "10%", width: "90%" }}>
             
              <div className="signIn-div"
              // style={{ alignItems: "flex-start",display: "flex",flexDirection: "column"}}
              >
                <div className="signIn-heading"
                  // style={{fontSize: "1.5 rem",color: "white",fontWeight: "700",marginBottom: "0.5%"}}
                  >
                  SIGN IN
                </div>
                <div className="signIn-sub-heading"
                // style={{color: "#CBCBCB",fontSize: "0.5rem",fontWeight: "600",marginBottom: "2%"}}
                >
                  Sign in to your supplier portal
                </div>
              </div>
              <div className="form-details" 
              // style={{alignItems: "flex-start",display: "flex",flexDirection: "column"}}
              >
                <div className="input-heading" 
                // style={{color: "white",fontSize: "0.75rem",fontWeight: "600"}}
                >
                  USERNAME
                </div>
                <Grid item xs={12} sm={12} md={12} style={{display: "flex",width: "100%"}}>
                  <InputGroup>
                    <Form.Control
                      aria-label="Dollar amount (with dot and two decimal places)"
                      style={{backgroundColor: "transparent",borderColor: "#CECCCC",borderRadius: 0,borderWidth: 0,borderBottomWidth: 1,color: "white",}}/>
                    <InputGroup.Text
                      style={{backgroundColor: "transparent",borderWidth: 0,borderRadius: 0,borderBottomWidth: 1,display: "flex",justifyContent: "flex-end",alignItems: "flex-end"}}>
                      <PersonIcon style={{ color: "white" }} />
                    </InputGroup.Text>
                  </InputGroup>
                  
                </Grid>
                <div className="input-heading" 
                // style={{color: "white",fontSize: "0.75rem",fontWeight: "600"}}
                >
                  PASSWORD
                </div>
                <InputGroup>
                  <Form.Control
                    aria-label="Dollar amount (with dot and two decimal places)"
                    style={{backgroundColor: "transparent",borderColor: "#CECCCC",borderRadius: 0,borderWidth: 0,borderBottomWidth: 1,color: "white",}}/>
                  <InputGroup.Text
                    style={{backgroundColor: "transparent",borderWidth: 0,borderRadius: 0, borderBottomWidth: 1,display: "flex", justifyContent: "flex-end",alignItems: "flex-end"}}>
                    <LockIcon style={{ color: "white" }} />
                  </InputGroup.Text>
                </InputGroup>
                
                <div className="footer-div" 
                style={{color: "#CBCBCB",fontSize: "0.6rem",fontWeight: "600",
                    display: "flex", alignItems: "center", marginBottom: "4%", marginTop: "2%"}}
                    >

                  
                  <div style={{backgroundColor: "black",display: "flex",alignContent: "flex-start"}}>
                    <input type="checkbox" className="checkboxStyle"
                      style={{}}></input>
                  </div>

                  I agree to the&nbsp;
                  <div style={{ textDecoration: "underline" }}>
                    terms & conditions.
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="3rem"
                sx={{
                  color: "blueColor.dark",fontSize: "1.5 rem",fontWeight: "700",backgroundColor: "#fff",
                  "&:hover": {
                    backgroundColor: "",
                  },}}
                onClick={() => navigate("/chatbot")}>
                <div
                  className="openSans" 
                  id="textID"
                  style={{color: "#1C244B",fontSize: "1rem",fontWeight: "750",
                  "&:hover": {color: "#1C244B",fontSize: "1.5 rem",fontWeight: "700",},}}>
                  LOGIN
                </div>
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                    href="#"
                    className="openSans"
                    variant="body2"
                    style={{textDecoration: "none",color: "#E3E5E8",fontSize: "0.7rem",fontWeight: "500"}}>
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={4} sm={4}md={4}
          style={{flex: 1,display: "flex",bgcolor: "white",justifyContent: "center"}}>
          <Box
            style={{display: "flex",flexDirection: "column",alignItems: "center",backgroundColor: "white",justifyContent: "center" }}>
            <div className="imageContainer">
              <img src={loginImage} alt="img"/>
            </div>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
