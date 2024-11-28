import React,{useContext} from "react";
import loginImage from "../images/loginBackground.png";
import kpmgWhite from "../images/kpmgWhite.png";
import symbol from "../images/symbol.png";

import SignInSide from "../Pages/Login";
import Grid from "@mui/material/Grid";

import "../styles/testStyles.css";
import Chatbot from "./Chatbot";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import Stack from "@mui/joy/Stack";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import "../styles/general.css";
import { InputAdornment, InputBase, InputLabel } from "@mui/material";
import { Form } from "react-bootstrap";
import { DynamicCutoutInput } from "./DynamicCutoutInput";
import PdfCard from "./PDF Generation/PdfCard";
import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";

function Test() {
  const defaultTheme = createTheme();
    const value = useContext(AuthContext);
    console.log("Inside Test: ",value)

  return (
    <div>
      <h2 style={{textAlign:'center'}}>List of invoices</h2>
      <div >
        <PdfCard title="Oasic ltd Invoice" pdfData={value}/>
        {/* <PdfCard title="Libra ltd Invoice"/>
        <PdfCard title="Xpress ltd Invoice"/>
        <PdfCard title="Cardic ltd Invoice"/> */}
      </div>
    </div>
    // <ThemeProvider theme={defaultTheme}>
    // <Grid container component="main" style={{ display: "flex" }}>
    //   <Grid
    //     item
    //     xs={8}
    //     sm={8}
    //     md={8}
    //     container
    //     component="main"
    //     style={{ zIndex: -1 }}
    //   >
    //     <Card className="generalView" style={{ width: "100%" }}>
    //       {/* <Box sx={{ mb: 1 }}>
    //       <Typography level="title-md">Personal info</Typography>
    //       <Typography level="body-sm">
    //         Customize how your profile information will apper to the networks.
    //       </Typography>
    //     </Box> */}
    //       <Divider />
    //       <Card>
    //         <Stack
    //           direction="row"
    //           spacing={3}
    //           sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
    //         >
    //           {/* <Stack direction="column" spacing={1}>
    //         <AspectRatio
    //           ratio="1"
    //           maxHeight={200}
    //           sx={{ flex: 1, minWidth: 120, borderRadius: '100%' }}
    //         >
    //           <img
    //             src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
    //             srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
    //             loading="lazy"
    //             alt=""
    //           />
    //         </AspectRatio>
    //         <IconButton
    //           aria-label="upload new picture"
    //           size="sm"
    //           variant="outlined"
    //           color="neutral"
    //           sx={{
    //             bgcolor: 'background.body',
    //             position: 'absolute',
    //             zIndex: 2,
    //             borderRadius: '50%',
    //             left: 100,
    //             top: 170,
    //             boxShadow: 'sm',
    //           }}
    //         >
    //           <EditRoundedIcon />
    //         </IconButton>
    //       </Stack> */}
    //           <Stack spacing={2} sx={{ flexGrow: 1 }}>
    //             <Stack spacing={1}>
    //               <FormLabel>Name</FormLabel>
    //               <FormControl
    //                 sx={{
    //                   display: { sm: "flex-column", md: "flex-row" },
    //                   gap: 2,
    //                 }}
    //               >
    //                 <Input size="sm" placeholder="First name" label="hi" />
    //                 <Input
    //                   size="sm"
    //                   placeholder="Last name"
    //                   sx={{ flexGrow: 1 }}
    //                 />
    //               </FormControl>
    //             </Stack>
    //             <Stack direction="row" spacing={2}>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Role</FormLabel>
    //                 <Input size="sm" defaultValue="UI Developer" />
    //               </FormControl>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Email</FormLabel>
    //                 <Input
    //                   size="sm"
    //                   type="email"
    //                   startDecorator={<EmailRoundedIcon />}
    //                   placeholder="email"
    //                   defaultValue="siriwatk@test.com"
    //                   sx={{ flexGrow: 1 }}
    //                 />
    //               </FormControl>
    //             </Stack>
    //             <Stack direction="row" spacing={2}>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Role</FormLabel>
    //                 <Input size="sm" defaultValue="UI Developer" />
    //               </FormControl>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Email</FormLabel>
    //                 <Input
    //                   size="sm"
    //                   type="email"
    //                   startDecorator={<EmailRoundedIcon />}
    //                   placeholder="email"
    //                   defaultValue="siriwatk@test.com"
    //                   sx={{ flexGrow: 1 }}
    //                 />
    //               </FormControl>
    //             </Stack>
    //             <Stack direction="row" spacing={2}>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Role</FormLabel>
    //                 <Input size="sm" defaultValue="UI Developer" />
    //               </FormControl>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Email</FormLabel>
    //                 <Input
    //                   size="sm"
    //                   type="email"
    //                   startDecorator={<EmailRoundedIcon />}
    //                   placeholder="email"
    //                   defaultValue="siriwatk@test.com"
    //                   sx={{ flexGrow: 1 }}
    //                 />
    //               </FormControl>
    //             </Stack>
    //             <Form.Group
    //               controlId="formBasicEmail"
    //               style={{ display: "flex", flex: 1 }}
    //             >
    //               <Form.Label className="top-label">Email address</Form.Label>
    //               <Form.Control type="email" placeholder="Enter email" />
    //             </Form.Group>
    //             <Form.Group className="mb-3 position-relative">
    //               <Form.Label className="position-absolute top-0 start-0 translate-middle text-secondary bg-white px-2">
    //                 Email
    //               </Form.Label>
    //               <Form.Control type="text"  />
    //             </Form.Group>
    //             <DynamicCutoutInput label="Username" required={true} placeholder="Enter your username" />
    //             <Stack direction="row" spacing={2}>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Role</FormLabel>
    //                 <Input size="sm" defaultValue="UI Developer" />
    //               </FormControl>
    //               <FormControl sx={{ flex: 1 }}>
    //                 <FormLabel>Email</FormLabel>
    //                 {/* <Input
    //               size="sm"
    //               type="email"
    //               startDecorator={<EmailRoundedIcon />}
    //               // placeholder="email"
    //               // defaultValue="siriwatk@test.com"
    //               label='ooo'
    //               sx={{ flexGrow: 1 }}
    //             /> */}

    //                 {/* <InputBase
    //                 style={{border:'1px solid #ccc',borderRadius:4,padding:5,width:'100%'}}
    //                   startAdornment={
    //                     <InputAdornment
    //                       position="start"
    //                       style={{ zindex: 1 }}
    //                       htmlFor="inputPl"
    //                     >
    //                       Placeholder
    //                     </InputAdornment>
    //                   }
    //                 /> */}
    //                 {/* <Form.Group controlId="formBasicEmail">
    //                   <Form.Label className="custom-placeholder">
    //                     Placeholder
    //                   </Form.Label>
    //                   <Form.Control
    //                     type="text"
    //                     placeholder=" "
    //                     className="custom-input"
    //                   />
    //                 </Form.Group> */}
    //               </FormControl>
    //             </Stack>
    //             <div>{/* <CountrySelector /> */}</div>
    //             <div>
    //               <FormControl sx={{ display: { sm: "contents" } }}>
    //                 <FormLabel>Timezone</FormLabel>
    //                 <Select
    //                   size="sm"
    //                   startDecorator={<AccessTimeFilledRoundedIcon />}
    //                   defaultValue="1"
    //                 >
    //                   <Option value="1">
    //                     Indochina Time (Bangkok){" "}
    //                     <Typography textColor="text.tertiary" ml={0.5}>
    //                       — GMT+07:00
    //                     </Typography>
    //                   </Option>
    //                   <Option value="2">
    //                     Indochina Time (Ho Chi Minh City){" "}
    //                     <Typography textColor="text.tertiary" ml={0.5}>
    //                       — GMT+07:00
    //                     </Typography>
    //                   </Option>
    //                 </Select>
    //               </FormControl>
    //             </div>
    //           </Stack>
    //         </Stack>
    //         <Stack
    //           direction="column"
    //           spacing={2}
    //           sx={{ display: { xs: "flex", md: "none" }, my: 1 }}
    //         >
    //           <Stack direction="row" spacing={2}>
    //             <Stack direction="column" spacing={1}>
    //               <AspectRatio
    //                 ratio="1"
    //                 maxHeight={108}
    //                 sx={{ flex: 1, minWidth: 108, borderRadius: "100%" }}
    //               >
    //                 <img
    //                   src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
    //                   srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
    //                   loading="lazy"
    //                   alt=""
    //                 />
    //               </AspectRatio>
    //               <IconButton
    //                 aria-label="upload new picture"
    //                 size="sm"
    //                 variant="outlined"
    //                 color="neutral"
    //                 sx={{
    //                   bgcolor: "background.body",
    //                   position: "absolute",
    //                   zIndex: 2,
    //                   borderRadius: "50%",
    //                   left: 85,
    //                   top: 180,
    //                   boxShadow: "sm",
    //                 }}
    //               >
    //                 <EditRoundedIcon />
    //               </IconButton>
    //             </Stack>
    //             <Stack spacing={1} sx={{ flexGrow: 1 }}>
    //               <FormLabel>Name</FormLabel>
    //               <FormControl
    //                 sx={{
    //                   display: {
    //                     sm: "flex-column",
    //                     md: "flex-row",
    //                   },
    //                   gap: 2,
    //                 }}
    //               >
    //                 <Input size="sm" placeholder="First name" />
    //                 <Input size="sm" placeholder="Last name" />
    //               </FormControl>
    //             </Stack>
    //           </Stack>
    //           <FormControl>
    //             <FormLabel>Role</FormLabel>
    //             <Input size="sm" defaultValue="UI Developer" />
    //           </FormControl>
    //           <FormControl sx={{ flexGrow: 1 }}>
    //             <FormLabel>Email</FormLabel>
    //             <Input
    //               size="sm"
    //               type="email"
    //               startDecorator={<EmailRoundedIcon />}
    //               placeholder="email"
    //               defaultValue="siriwatk@test.com"
    //               sx={{ flexGrow: 1 }}
    //             />
    //           </FormControl>
    //           <div>{/* <CountrySelector /> */}</div>
    //           <div>
    //             <FormControl sx={{ display: { sm: "contents" } }}>
    //               <FormLabel>Timezone</FormLabel>
    //               <Select
    //                 size="sm"
    //                 startDecorator={<AccessTimeFilledRoundedIcon />}
    //                 defaultValue="1"
    //               >
    //                 <Option value="1">
    //                   Indochina Time (Bangkok){" "}
    //                   <Typography textColor="text.tertiary" ml={0.5}>
    //                     — GMT+07:00
    //                   </Typography>
    //                 </Option>
    //                 <Option value="2">
    //                   Indochina Time (Ho Chi Minh City){" "}
    //                   <Typography textColor="text.tertiary" ml={0.5}>
    //                     — GMT+07:00
    //                   </Typography>
    //                 </Option>
    //               </Select>
    //             </FormControl>
    //           </div>
    //         </Stack>
    //       </Card>
    //       <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
    //         <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
    //           <Button size="sm" variant="outlined" color="neutral">
    //             Cancel
    //           </Button>
    //           <Button size="sm" variant="solid">
    //             Save
    //           </Button>
    //         </CardActions>
    //       </CardOverflow>
    //     </Card>
    //   </Grid>
    //   <Chatbot />
    // </Grid>
    // <div className="mainView">
    //   <SignInSide/>
    //   <div className="loginView">
    //     <div className="textContainer">
    //       <div className="header">
    //         <div style={{ }}>
    //           {/* <img
    //             src={symbol}
    //             style={{}}
    //             alt="img"
    //           /> */}
    //         </div>
    //         {/* <div>
    //           <img src={kpmgWhite} alt="img"   />
    //         </div> */}
    //       </div>

    //       {/* <div className="textStyle">Welcome to KPMG's </div>
    //       <div className="textStyle">
    //         Exp.
    //         <div className="X">X</div>
    //       </div> */}
    //     </div>
    //   </div>
    //   <div className="imageContainer">

    //     <img src={loginImage} alt="img" />
    //   </div>
    // </div>
    // <div>Test</div>
  );
}

export default Test;


