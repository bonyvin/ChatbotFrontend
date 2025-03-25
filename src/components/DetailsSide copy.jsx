//06-02-2025 Before Inv number updation and doc number addition
import React, { useContext, useEffect, useRef } from "react";
import loginImage from "../images/loginBackground.png";
import kpmgWhite from "../images/kpmgWhite.png";
import symbolBlue from "../images/symbolBlue.png";
import SignInSide from "../Pages/Login";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import "../styles/testStyles.css";
import "../styles/general.css";
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
import Chatb from "./Chatb";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChatbotPane from "./ChatbotPane";
import { AuthContext } from "../context/ContextsMasterFile";
import PopUp from "./PopUp";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import Invoice from "./PDF Generation/Invoice";

function DetailsSide() {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [tableToggle, setTableToggle] = useState(false);
  const handleTableExpand = () => {
    setTableToggle(!tableToggle);
  };
  useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);
  const value = useContext(AuthContext);
  useEffect(() => {}, [value.poDetailsData.length]);
  // console.log("Po details:",value.poDetailsData.length,value.poDetailsData)
  const showForm = value.isActive;
  // value.setInvoiceDate("@22")
  // const handleChange=(text)=>{
  //   value.setInvoiceDate(text)
  // }
  // console.log("Value:",value.invoiceData.invoiceDataType)

  // Perform regex match on invoiceType

  // if(value.invoiceData.invoiceType.match(regexPattern)){
  //   console.log("Radio",value.invoiceData.invoiceType)
  // }
  // else{
  //   console.log("Does not match")
  //   console.log("",value.invoiceDatafromConversation,)

  // }
  // if (value.invoiceDatafromConversation) {
  //   console.log("in1", value.invoiceDatafromConversation)
  //   if (
  //     value.invoiceDatafromConversation["Invoice type"].match(regexPattern)

  //   ){
  //     console.log("in2")
  //   }
  //     // return true
  // } else {
  //   console.log("dataconvofalse")
  //   // return false
  // }

  // console.log("Quantity here",value.itemDetails.quantity);
  const invoiceSuccessMsg = "Invoice Created Successfully";
  function sumQuantities(input) {
    if (!input) return input;

    const quantitiesArray = Array.isArray(input)
      ? input
      : input.split(",").map((num) => parseInt(num.trim(), 10));

    return quantitiesArray.reduce((sum, current) => sum + current, 0);
  }
  function formatDate(date) {
    // Regex to check if the date is already in dd-mm-yyyy format
    const ddMmYyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    // Regex to match yyyy-mm-dd or yyyy/mm/dd formats
    const yyyyMmDdRegex = /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/;
    // If the date is already in dd-mm-yyyy format, return it as-is
    if (ddMmYyyyRegex.test(date)) {
      return date;
    }
    console.log("Date: ", date, typeof date);
    // If the date matches yyyy-mm-dd or yyyy/mm/dd, convert it
    const match = date.match(yyyyMmDdRegex);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      console.log(`${day}-${month}-${year}`);
      return `${day}-${month}-${year}`; // Return in dd-mm-yyyy format
    }
    // If the date doesn't match any expected format, return it as-is
    console.log("Cannot format date, returning date as it is:", date);
    return date;
  }
  const parseDate = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };

  const handleRadioChange = (type) => {
    value.setTypeOfInvoice({
      merchandise: type === "merchandise",
      nonMerchandise: type === "nonMerchandise",
      debitNote: type === "debitNote",
      creditNote: type === "creditNote",
    });
    value.setInvoiceData({ ...value.invoiceData, invoiceType: type });
    //   setValue({
    //     value.typeOfInvoice: {
    //       merchandise: type === 'merchandise',
    //       nonMerchandise: type === 'nonMerchandise',
    //       debitNote: type === 'debitNote',
    //       creditNote: type === 'creditNote'
    //     }
    //   });
  };

  // const handleItemAndQuantity = (itemId, qty,invCost) => {
  //   // console.log("Inside Handle Item and Quantity");

  //   // Ensure that itemDetails object exists and has the right structure

  //   if (value.poDetailsData.length == 1) {
  //     value.setItemDetailsInput((prevState) => {
  //       return {
  //         items: [itemId],
  //         quantity: [qty],
  //         invoiceCost:[invCost]
  //       };
  //     });
  //     //
  //   } else if (value.poDetailsData.length > 1) {
  //     value.setItemDetailsInput((prevState) => {
  //       // value.setItemDetails((prevState) => {
  //       // Find index of the item if it already exists
  //       const itemIndex = prevState.items.indexOf(itemId);

  //       if (itemIndex > -1) {
  //         // Update quantity for existing item
  //         const updatedQuantities = [...prevState.quantity];
  //         updatedQuantities[itemIndex] = qty;

  //         return {
  //           items: [...prevState.items],
  //           quantity: updatedQuantities,
  //         };
  //       } else {
  //         // Add new item and quantity
  //         return {
  //           items: [...prevState.items, itemId],
  //           quantity: [...prevState.quantity, qty],
  //         };
  //       }
  //     });
  //   } else {
  //     console.log("po details length <=0, handleitemquantity");
  //   }

  //   // console.log("Updated Details:", itemId, qty);
  // };

  //   // Function to aggregate quantities based on item ID
  //   value.setItemDetails(prevState => {
  //     const itemIndex = prevState.items.indexOf(item);

  //     if (itemIndex >= 0) {
  //       // Update existing item by aggregating quantities
  //       const updatedQuantities = [...prevState.quantity];
  //       updatedQuantities[itemIndex] = (parseInt(updatedQuantities[itemIndex]) + parseInt(qty)).toString();

  //       return {
  //         items: [...prevState.items],
  //         quantity: updatedQuantities,
  //       };
  //     } else {
  //       // Add new item and quantity
  //       return {
  //         items: [...prevState.items, item],
  //         quantity: [...prevState.quantity, qty],
  //       };
  //     }
  //   });

  //   console.log("Updated Details:", item, qty);
  // };
  const handleItemAndQuantity = (itemId, qty, invCost) => {
    if (value.poDetailsData.length === 1) {
      value.setItemDetailsInput(() => ({
        items: [itemId],
        quantity: [qty],
        invoiceCost: [invCost],
      }));
    } else if (value.poDetailsData.length > 1) {
      value.setItemDetailsInput((prevState) => {
        const itemIndex = prevState.items.indexOf(itemId);
  
        if (itemIndex > -1) {
          // Update quantity and invoiceCost for existing item
          const updatedQuantities = [...prevState.quantity];
          const updatedInvoiceCosts = [...prevState.invoiceCost];
          updatedQuantities[itemIndex] = qty;
          updatedInvoiceCosts[itemIndex] = invCost;
  
          return {
            items: [...prevState.items],
            quantity: updatedQuantities,
            invoiceCost: updatedInvoiceCosts,
          };
        } else {
          // Add new item, quantity, and invoiceCost
          return {
            items: [...prevState.items, itemId],
            quantity: [...prevState.quantity, qty],
            invoiceCost: [...prevState.invoiceCost, invCost],
          };
        }
      });
    } else {
      console.log("poDetailsData length <= 0, handleItemAndQuantity");
    }
  };
  
  return (
    // <DynamicCutoutInput label="Username" required={true} placeholder="Enter your username" />
    <Grid container component="main" style={{}}>
      <Grid
        item
        xs={8}
        sm={8}
        md={8}
        container
        component="main"
        style={{ padding: "1rem" }}
        className="imageBackground"
        ref={messagesEndRef}
      >
        <div style={{ position: "absolute" }}>
          <PopUp {...value.modalDetails} />
          {/* <PopUp visible={value.modalVisible} text={value.modalText} /> */}
        </div>

        {/* {!showForm ? (
          <Card
            className="generalView"
            style={{ width: "100%", padding: "2rem" }}
            
          >
            <img src={symbolBlue} style={{ width: "4.2rem" }}></img>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "60%",
              }}
            >
              <Typography
                className="OpenSans"
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#00338D",
                  marginBottom: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                Welcome Charles !
              </Typography>
              <Typography
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#00338D",
                  textAlign: "left",
                }}
              >
                Need help with purchase orders, invoices, payments, ASNs,
                promotions or more? I've got you covered - happy to assist!
              </Typography>
            </div>
          </Card>
        ) : ( */}

        <Card
          className="generalView"
          style={{ width: "100%" }}
          ref={messagesEndRef}
        >
          <Card ref={messagesEndRef}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  fontFamily: "Poppins,sans-sherif",
                }}
              >
                Invoice Details
              </Typography>
              <Typography style={{ fontSize: "0.6rem" }}>
                Fields marked as * are mandatory
              </Typography>
            </div>
            <Typography
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                fontFamily: "Poppins,sans-sherif",
                alignSelf: "flex-start",
              }}
            >
              Invoice Details
            </Typography>
            <Form className="generalRadio">
              <div
                className="mb-3"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <Form.Check
                  inline
                  label="Merchandise"
                  name="group1"
                  type={"radio"}
                  id={`inline- -1`}
                  className="labelText"
                  checked={value.typeOfInvoice.merchandise}
                  onChange={() => handleRadioChange("merchandise")}
                  // checked={value.invoiceData.invoiceType.match(/merchandise/i) }
                />
                <Form.Check
                  inline
                  label="Non - Merchandise"
                  name="group1"
                  type={"radio"}
                  id={`inline- -2`}
                  className="labelText"
                  checked={value.typeOfInvoice.nonMerchandise}
                  onChange={() => handleRadioChange("nonMerchandise")}
                  // checked={value.invoiceData.invoiceType === "Non - Merchandise"}
                />
                <Form.Check
                  inline
                  label="Debit Note"
                  name="group1"
                  type={"radio"}
                  id={`inline- -3`}
                  className="labelText"
                  checked={value.typeOfInvoice.debitNote}
                  onChange={() => handleRadioChange("debitNote")}
                  // checked={value.invoiceData.invoiceType.match(/debit\s*-\s*\s*note\s*: ?(.*?)(?:,|$)/i) }
                />
                <Form.Check
                  inline
                  label="Credit Note"
                  name="group1"
                  type={"radio"}
                  id={`inline- -4`}
                  className="labelText"
                  // checked={value.invoiceData.invoiceType === "Credit Note"}
                  checked={value.typeOfInvoice.creditNote}
                  onChange={() => handleRadioChange("creditNote")}
                />
              </div>
            </Form>
            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Invoice Date"
                      required={true}
                      type="date"
                      placeholder="Enter your Invoice Date"
                      value={value.invoiceData.invoiceDate} // Use raw yyyy-mm-dd format
                      fun={(text) => {
                        console.log("Date selected:", text);
                        value.setInvoiceData({
                          ...value.invoiceData,
                          invoiceDate: text, // Save in yyyy-mm-dd format
                        });
                      }}
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Supplier ID"
                      required={true}
                      placeholder="Supplier ID"
                      value={value.invoiceData.supplierId}
                      fun={(text) =>
                        value.setInvoiceData({
                          ...value.invoiceData,
                          supplierId: text,
                        })
                      }

                      // value={value.invoiceData.invoiceDate}
                      // fun={(text) => value.setInvoiceData({ ...value.invoiceData, invoiceDate: text })}
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="PO No."
                      required={true}
                      placeholder="Enter your PO No."
                      value={value.invoiceData.poNumber}
                      fun={(text) =>
                        value.setInvoiceData({
                          ...value.invoiceData,
                          poNumber: text,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Invoice No."
                      required={true}
                      placeholder="Enter your Invoice No."
                      value={value.poHeaderData.invoiceNo}
                      fun={(text) =>
                        value.setPoHeaderData({
                          ...value.poHeaderData,
                          invoiceNo: text,
                        })
                      }
                      editable={true}
                      style={{ backgroundColor: "#e8e8e8" }}
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Payment Terms"
                      required={true}
                      placeholder="Enter your Payment Terms"
                      value={value.poHeaderData.paymentTerm}
                      fun={(text) =>
                        value.setPoHeaderData({
                          ...value.poHeaderData,
                          paymentTerm: text,
                        })
                      }
                      editable={true}
                      style={{ backgroundColor: "#e8e8e8" }}
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Amount"
                      required={true}
                      type="number"
                      placeholder="Enter your Total Amount"
                      value={value.invoiceData.totalAmount}
                      fun={(text) =>
                        value.setInvoiceData({
                          ...value.invoiceData,
                          totalAmount: text,
                        })
                      }
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Tax"
                      required={true}
                      type="number"
                      placeholder="Enter your Total Tax"
                      value={value.invoiceData.totalTax}
                      fun={(text) =>
                        value.setInvoiceData({
                          ...value.invoiceData,
                          totalTax: text,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Total Quantity"
                      required={true}
                      placeholder="Enter your Total Quantity"
                      value={sumQuantities(value.itemDetails.quantity)}
                      // value={value.itemDetails.quantity}
                      fun={(text) =>
                        value.setItemDetails({
                          ...value.itemDetails,
                          quantity: text,
                        })
                      }
                      editable={true}
                    />
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Currency"
                      required={true}
                      placeholder="Enter your Currency"
                      value={value.poHeaderData.currency}
                      fun={(text) =>
                        value.setPoHeaderData({
                          ...value.poHeaderData,
                          currency: text,
                        })
                      }
                      editable={true}
                      style={{ backgroundColor: "#e8e8e8" }}
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Currency Exchange Rate"
                      required={false}
                      placeholder="Enter your Currency Exchange Rate"
                      value={value.poHeaderData.exchangeRate}
                      fun={(text) =>
                        value.setPoHeaderData({
                          ...value.poHeaderData,
                          exchangeRate: text,
                        })
                      }
                      editable={true}
                      style={{ backgroundColor: "#e8e8e8" }}
                    />
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          </Card>
          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography
                className="poppins"
                style={{ fontFamily: "Poppins,sans-serif", fontSize: "1rem" }}
              >
                Item Details
              </Typography>
              <IconButton aria-label="exp" onClick={handleTableExpand}>
                {tableToggle ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </div>
            {tableToggle && (
              <Paper sx={{ width: "100%" }}>
                <TableContainer sx={{}}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          Item ID
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          Item Description
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          Invoice Quantity
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          PO Quantity
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          Invoice Cost
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          PO Cost
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          Inv. Amount
                        </TableCell>
                        <TableCell
                          align="center"
                          colSpan={0.5}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "0.6rem",
                            color: "#575F6E",
                          }}
                        >
                          PO Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody ref={messagesEndRef}>
                      {value.poDetailsData.length > 0 ? (
                        value.poDetailsData.map((item, index) => (
                          <TableRow hover role="checkbox">
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.itemId}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.itemDescription}
                            </TableCell>
                            {/* <TableCell align="center"
                              colSpan={0.5}>
                                <input value={item.invQty} style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }} onChange={(e) =>
                                handleItemAndQuantity(
                                  item.itemId,
                                  e.target.value
                                )
                              }></input>
                              </TableCell> */}

                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                                outline: "none",

                                // border:'solid'
                              }}
                              contentEditable
                              suppressContentEditableWarning={true} // Suppress the warning
                              onInput={(e) =>
                                handleItemAndQuantity(
                                  item.itemId,
                                  e.target.innerText,null
                                )
                              }
                            >
                              <div
                                style={{
                                  borderWidth: 1.5,
                                  // margin: 2,
                                  borderRadius: 12,
                                  padding: 5,
                                  border: "1px solid black",
                                }}
                              >
                                {item.invQty}
                              </div>
                            </TableCell>
                            {/* <TableCell align="center" colSpan={0.5}>
                              <input
                                type="text"
                                value={item.invQty}
                                onChange={(e) =>
                                  handleItemAndQuantity(
                                    item.itemId,
                                    e.target.value
                                  )
                                }
                                style={{
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                  border: "none",
                                  width: "100%",
                                  textAlign: "center",
                                  backgroundColor: "transparent",
                                }}
                              />
                            </TableCell> */}
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.itemQuantity}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                                outline: "none",

                                // border:'solid'
                              }}
                              contentEditable
                              suppressContentEditableWarning={true} // Suppress the warning
                              onInput={(e) =>
                                handleItemAndQuantity(
                                  item.itemId, 
                                  null,e.target.innerText
                                )
                              }
                            >
                              {" "}
                              <div
                                style={{
                                  borderWidth: 1.5,
                                  // margin: 2,
                                  borderRadius: 12,
                                  padding: 5,
                                  border: "1px solid black",
                                }}
                              >
                                {item.invCost}
                              </div>
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.itemCost}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.invAmt}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {parseFloat(item.itemCost) *
                                parseFloat(item.itemQuantity)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow hover role="checkbox">
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#454B54",
                            }}
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      )}
                      <div ref={messagesEndRef} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Card>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions
              sx={{
                justifyContent: "space-between",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              {/* <CardActions sx={{ justifyContent: "space-evenly" }}> */}
              <Button
                size="md"
                variant="solid"
                style={{
                  backgroundColor: "#283D76",
                  fontFamily: "Poppins,sans-serif",
                }}
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                SAVE
              </Button>
              {/* <BlobProvider
                document={<Invoice invoiceId={value.poHeaderData.invoiceNo} />}
              >
                {({ url, blob }) => (
                  <a href={url} target="_blank">
                    <Button
                      size="md"
                      variant="solid"
                      style={{
                        backgroundColor: "#283D76",
                        fontFamily: "Poppins,sans-serif",
                      }}
                    >
                      PREVIEW
                    </Button>
                  </a>
                )}
              </BlobProvider> */}

              <Button
                size="md"
                variant="solid"
                style={{
                  backgroundColor: "#283D76",
                  fontFamily: "Poppins,sans-serif",
                }}
                onClick={() => value.setFormSubmit((prevState) => !prevState)}
              >
                SUBMIT
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
 {/* )}  */}
      </Grid>
      <Grid
        item
        xs={4}
        sm={4}
        md={4}
        // className="imageBackground"
        style={{
          marginTop: "10vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatbotPane />
        <div id="myModal" class="modal fade">
          <div class="modal-dialog modal-confirm">
            <div class="modal-content">
              <div class="modal-header">
                <div class="icon-box">
                  <i class="material-icons">&#xE876;</i>
                </div>
                <h4 class="modal-title w-100">Awesome!</h4>
              </div>
              <div class="modal-body">
                <p class="text-center">
                  Your booking has been confirmed. Check your email for detials.
                </p>
              </div>
              <div class="modal-footer">
                <button
                  class="btn btn-success btn-block"
                  data-dismiss="modal"
                  onClick={() => value.setModalVisible(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </Grid>
      {/* <Chatbot /> */}
    </Grid>
  );
}

export default DetailsSide;

//06-02-2025 Before Inv number updation and doc number addition

import React, { useContext, useEffect,useRef } from "react";
import loginImage from "../images/loginBackground.png";
import kpmgWhite from "../images/kpmgWhite.png";
import symbolBlue from "../images/symbolBlue.png";
import SignInSide from "../Pages/Login";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import "../styles/testStyles.css";
import "../styles/general.css";
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
import Chatb from "./Chatb";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChatbotPane from "./ChatbotPane";
import { AuthContext } from "../context/ContextsMasterFile";
import PopUp from "./PopUp";

function DetailsSide() {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  
  const [tableToggle, setTableToggle] = useState(false);
  const handleTableExpand = () => {
    setTableToggle(!tableToggle);
  };
 useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);
  const rowData = [
    {
      a: "India",
      b: "IN",
      c: 1324171354,
      d: 1324171354,
      e: 1324171354,
      f: 1324171354,
      g: 1324171354,
    },
    {
      a: "India",
      b: "IN",
      c: 1324171354,
      d: 1324171354,
      e: 1324171354,
      f: 1324171354,
      g: 1324171354,
    },
  ];
  const value = useContext(AuthContext);
  useEffect(()=>{
  },[value.poDetailsData.length])
  // console.log("Po details:",value.poDetailsData.length,value.poDetailsData)
  const showForm = value.isActive;
  // value.setInvoiceDate("@22")
  // const handleChange=(text)=>{
  //   value.setInvoiceDate(text)
  // }
  // console.log("Value:",value.invoiceData.invoiceDataType)

  // Perform regex match on invoiceType

  // if(value.invoiceData.invoiceType.match(regexPattern)){
  //   console.log("Radio",value.invoiceData.invoiceType)
  // }
  // else{
  //   console.log("Does not match")
  //   console.log("",value.invoiceDatafromConversation,)

  // }
  // if (value.invoiceDatafromConversation) {
  //   console.log("in1", value.invoiceDatafromConversation)
  //   if (
  //     value.invoiceDatafromConversation["Invoice type"].match(regexPattern)

  //   ){
  //     console.log("in2")
  //   }
  //     // return true
  // } else {
  //   console.log("dataconvofalse")
  //   // return false
  // }

  // console.log("Quantity here",value.itemDetails.quantity);
   const invoiceSuccessMsg = "Invoice Created Successfully";
  function sumQuantities(str) {
    if (str) {
      const quantitiesArray = str
        .split(",")
        .map((num) => parseInt(num.trim(), 10));
      const totalQuantity = quantitiesArray.reduce(
        (sum, current) => sum + current,
        0
      );
      str = totalQuantity;
    }
    return str;
  }
  return (
    // <DynamicCutoutInput label="Username" required={true} placeholder="Enter your username" />
    <Grid container component="main" style={{}} >
      <Grid
        item
        xs={8}
        sm={8}
        md={8}
        container
        component="main"
        style={{ padding: "1rem" }}
        className="imageBackground"ref={messagesEndRef}
      >
        <div style={{ position:'absolute' }}>
          <PopUp  visible={value.modalVisible} text={invoiceSuccessMsg} />
        </div>
        {!showForm ? (
          <Card
            className="generalView"
            style={{ width: "100%", padding: "2rem" }}
            
          >
            <img src={symbolBlue} style={{ width: "4.2rem" }}></img>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "60%",
              }}
            >
              <Typography
                className="OpenSans"
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#00338D",
                  marginBottom: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                Welcome Charles !
              </Typography>
              <Typography
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#00338D",
                  textAlign: "left",
                }}
              >
                Need help with purchase orders, invoices, payments, ASNs,
                promotions or more? I've got you covered - happy to assist!
              </Typography>
            </div>
          </Card>
        ) : (
          <Card className="generalView" style={{ width: "100%" }} ref={messagesEndRef}>
            <Card  ref={messagesEndRef} >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
               >
                <Typography
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    fontFamily: "Poppins,sans-sherif",
                  }}
                >
                  Invoice Details
                </Typography>
                <Typography style={{ fontSize: "0.6rem" }}>
                  Fields marked as * are mandatory
                </Typography>
              </div>
              <Typography
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  fontFamily: "Poppins,sans-sherif",
                  alignSelf: "flex-start",
                }}
              >
                Invoice Details
              </Typography>
              <Form className="generalRadio">
                <div
                  className="mb-3"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Form.Check
                    inline
                    label="Merchandise"
                    name="group1"
                    type={"radio"}
                    id={`inline- -1`}
                    className="labelText"
                    checked={value.typeOfInvoice.merchandise}
                    // checked={value.invoiceData.invoiceType.match(/merchandise/i) }
                  />
                  <Form.Check
                    inline
                    label="Non - Merchandise"
                    name="group1"
                    type={"radio"}
                    id={`inline- -2`}
                    className="labelText"
                    checked={value.typeOfInvoice.nonMerchandise}

                    // checked={value.invoiceData.invoiceType === "Non - Merchandise"}
                  />
                  <Form.Check
                    inline
                    label="Debit Note"
                    name="group1"
                    type={"radio"}
                    id={`inline- -3`}
                    className="labelText"
                    checked={value.typeOfInvoice.debitNote}

                    // checked={value.invoiceData.invoiceType.match(/debit\s*-\s*\s*note\s*: ?(.*?)(?:,|$)/i) }
                  />
                  <Form.Check
                    inline
                    label="Credit Note"
                    name="group1"
                    type={"radio"}
                    id={`inline- -4`}
                    className="labelText"
                    // checked={value.invoiceData.invoiceType === "Credit Note"}
                    checked={value.typeOfInvoice.creditNote}
                  />
                </div>
              </Form>
              <Stack
                direction="row"
                spacing={3}
                sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
              >
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Invoice Date"
                        required={true}
                        placeholder="Enter your Invoice Date"
                        value={value.invoiceData.invoiceDate}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            invoiceDate: text,
                          })
                        } // onChangeText={(text)=>value.setInvoiceDate(text)}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Supplier ID"
                        required={true}
                        placeholder="Supplier ID"
                        value={value.invoiceData.supplierId}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            supplierId: text,
                          })
                        }

                        // value={value.invoiceData.invoiceDate}
                        // fun={(text) => value.setInvoiceData({ ...value.invoiceData, invoiceDate: text })}
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="PO No."
                        required={true}
                        placeholder="Enter your PO No."
                        value={value.invoiceData.poNumber}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            poNumber: text,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Invoice No."
                        required={true}
                        placeholder="Enter your Invoice No."
                        value={value.poHeaderData.invoiceNo}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            invoiceNo: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Payment Terms"
                        required={true}
                        placeholder="Enter your Payment Terms"
                        value={value.poHeaderData.paymentTerm}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            paymentTerm: text,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Amount"
                        required={true}
                        placeholder="Enter your Total Amount"
                        value={value.invoiceData.totalAmount}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            totalAmount: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Tax"
                        required={true}
                        placeholder="Enter your Total Tax"
                        value={value.invoiceData.totalTax}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            totalTax: text,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Quantity"
                        required={true}
                        placeholder="Enter your Total Quantity"
                        value={value.itemDetails.quantity}
                        fun={(text) =>
                          value.setItemDetails({
                            ...value.itemDetails,
                            quantity: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Currency"
                        required={true}
                        placeholder="Enter your Currency"
                        value={value.poHeaderData.currency}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            currency: text,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Currency Exchange Rate"
                        required={false}
                        placeholder="Enter your Currency Exchange Rate"
                        value={value.poHeaderData.exchangeRate}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            exchangeRate: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            {/* <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button size="sm" variant="outlined" color="neutral">
                Cancel
              </Button>
              <Button size="sm" variant="solid">
                Save
              </Button>
            </CardActions>
          </CardOverflow> */}
            <Card >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  className="poppins"
                  style={{ fontFamily: "Poppins,sans-serif", fontSize: "1rem" }}
                >
                  Item Details
                </Typography>
                <IconButton aria-label="exp" onClick={handleTableExpand}>
                  {tableToggle ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </div>
              {tableToggle && (
                <Paper sx={{ width: "100%" }}>
                  <TableContainer sx={{}}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            Item ID
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            Item Description
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            Invoice Quantity
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            PO Quantity
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            Inv. Cost
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            PO Cost
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            Inv. Amount
                          </TableCell>
                          <TableCell
                            align="center"
                            colSpan={0.5}
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "0.6rem",
                              color: "#575F6E",
                            }}
                          >
                            PO Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody ref={messagesEndRef}>
                        
                        {value.poDetailsData.length > 0 ? (
                          value.poDetailsData.map((item) => (
                            <TableRow hover role="checkbox">
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.itemId}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.itemDescription}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.invQty}
                                {/* Inv quantity */}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.itemQuantity}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.itemCost}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.itemCost}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {item.invAmt}
                              </TableCell>
                              <TableCell
                                align="center"
                                colSpan={0.5}
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "0.6rem",
                                  color: "#454B54",
                                }}
                              >
                                {parseFloat(item.itemCost) *
                                  parseFloat(item.itemQuantity)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow hover role="checkbox">
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              No data
                            </TableCell>
                          </TableRow>
                        )}
                        <div ref={messagesEndRef} />
                      </TableBody>

                      {/* <TableBody>
                        {rowData.map((item) => (
                          <TableRow hover role="checkbox">
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.a}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.b}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.c}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.d}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.e}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.f}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.g}
                            </TableCell>
                            <TableCell
                              align="center"
                              colSpan={0.5}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontSize: "0.6rem",
                                color: "#454B54",
                              }}
                            >
                              {item.g}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody> */}
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Card>

            <CardOverflow
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            >
              <CardActions sx={{ justifyContent: "space-evenly" }}>
                <Button
                  size="md"
                  variant="solid"
                  style={{
                    backgroundColor: "#283D76",
                    fontFamily: "Poppins,sans-serif",
                  }}
                  onClick={()=>value.setFormSave(true)}
                >
                  SAVE
                </Button>
                <Button
                  size="md"
                  variant="solid"
                  style={{
                    backgroundColor: "#283D76",
                    fontFamily: "Poppins,sans-serif",
                  }}
                >
                  PREVIEW
                </Button>
                <Button
                  size="md"
                  variant="solid"
                  style={{
                    backgroundColor: "#283D76",
                    fontFamily: "Poppins,sans-serif",
                  }}
                >
                  SUBMIT
                </Button>
              </CardActions>
            </CardOverflow>
          </Card>)}
        {/*  */}
      </Grid>
      <Grid
        item
        xs={4}
        sm={4}
        md={4}
        // className="imageBackground"
        style={{
          marginTop: "10vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatbotPane test={value.formSave}/>
        <div id="myModal" class="modal fade">
          <div class="modal-dialog modal-confirm">
            <div class="modal-content">
              <div class="modal-header">
                <div class="icon-box">
                  <i class="material-icons">&#xE876;</i>
                </div>
                <h4 class="modal-title w-100">Awesome!</h4>
              </div>
              <div class="modal-body">
                <p class="text-center">
                  Your booking has been confirmed. Check your email for detials.
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-success btn-block" data-dismiss="modal" onClick={()=>value.setModalVisible(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </Grid>
      {/* <Chatbot /> */}
    </Grid>
  );
}

export default DetailsSide;
