import React from "react";
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
function DetailsTest() {
  return (
    // <DynamicCutoutInput label="Username" required={true} placeholder="Enter your username" />
    <Grid container component="main" style={{ display: "flex" }}>
 <Grid
        item
        xs={8}
        sm={8}
        md={8}
        container
        component="main"
       >
        <Card className="generalView" style={{ width: "100%" }}>
          <Card>
            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  <FormLabel>Invoice Details</FormLabel>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Invoice Date"
                      required={true}
                      placeholder="Enter your Invoice Date"
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Supplier ID"
                      required={true}
                      placeholder="Supplier ID"
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="PO No."
                      required={true}
                      placeholder="Enter your PO No."
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Invoice No."
                      required={true}
                      placeholder="Enter your Invoice No."
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Payment Terms"
                      required={true}
                      placeholder="Enter your Payment Terms"
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Amount"
                      required={true}
                      placeholder="Enter your Total Amount"
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Tax"
                      required={true}
                      placeholder="Enter your Total Tax"
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Quantity"
                      required={true}
                      placeholder="Enter your Total Quantity"
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Currency"
                      required={true}
                      placeholder="Enter your Currency"
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Currency Exchange Rate"
                      required={false}
                      placeholder="Enter your Currency Exchange Rate"
                    />
                  </FormControl>
                </Stack>
                
              </Stack>
            </Stack>
          </Card>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button size="sm" variant="outlined" color="neutral">
                Cancel
              </Button>
              <Button size="sm" variant="solid">
                Save
              </Button>
            </CardActions>
          </CardOverflow>
          
        </Card></Grid> 
      </Grid>
 
  );
}

export default DetailsTest;
