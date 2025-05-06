import React, { useContext, useEffect, useRef } from "react";
import loginImage from "../images/loginBackground.png";
import kpmgWhite from "../images/kpmgWhite.png";
import symbolBlue from "../images/symbolBlue.png";
import SignInSide from "../Pages/Login";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import "../styles/testStyles.css";
import "../styles/general.css";
import Chatbot from "../../components/Chatbot";
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
import { Dialog, InputAdornment, InputBase, InputLabel } from "@mui/material";
import { Form } from "react-bootstrap";
import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
import Chatb from "../../components/Chatb";
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
import ChatbotPane from "./InvoiceChatbot";
import { AuthContext } from "../../context/ContextsMasterFile";
import PopUp from "../../components/PopupMessage/PopUp";
import { BlobProvider, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import Invoice from "../../components/PDF Generation/Invoice";
import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";
import { BsFillInfoCircleFill } from "react-icons/bs";
import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
import { Troubleshoot } from "@mui/icons-material";

function DetailsSide() {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [supplierPopupStatus, setSupplierPopupStatus] = useState(false);
  const [itemPopupStatus, setItemPopupStatus] = useState(false);
  const [tableToggle, setTableToggle] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(false);

  const handleTableExpand = () => {
    setTableToggle(!tableToggle);
  };
  useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);
  const value = useContext(AuthContext);
  useEffect(() => {}, [value.poDetailsData.length]);
  const showForm = value.isActive;
  function sumQuantities(input) {
    if (!input) return input;

    const quantitiesArray = Array.isArray(input)
      ? input
      : input.split(",").map((num) => parseInt(num.trim(), 10));

    return quantitiesArray.reduce((sum, current) => sum + current, 0);
  }
  const handleRadioChange = (type) => {
    value.setTypeOfInvoice({
      merchandise: type === "merchandise",
      nonMerchandise: type === "nonMerchandise",
      debitNote: type === "debitNote",
      creditNote: type === "creditNote",
    });
    value.setInvoiceData({ ...value.invoiceData, invoiceType: type });
  };

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
  // console.log("pod:",value.poDetailsData)
  return (
    <Grid container component="main" style={{ backgroundColor: "#e9ecef" }}>
      <Grid
        item
        xs={8}
        sm={8}
        md={8}
        container
        component="main"
        style={{ padding: "1rem", paddingLeft: "0.25rem" }}
        // className="imageBackground"
        ref={messagesEndRef}
      >
        <div style={{ position: "absolute" }}>
          <PopUp {...value.modalDetails} />
          <ItemInfoPopup
            visible={itemPopupStatus}
            setVisible={setItemPopupStatus}
          />
          <SupplierInfoPopUp
            visible={supplierPopupStatus}
            setVisible={setSupplierPopupStatus}
          />
          <Dialog
            open={invoicePreview}
            onClose={() => setInvoicePreview(false)}
            aria-labelledby="responsive-dialog-title"
            style={{
              width: "90%",
              height: "90%",
              margin: "auto",
            }}
            PaperProps={{
              style: {
                width: "100%",
                height: "100%",
                maxWidth: "unset",
                maxHeight: "unset",
                margin: 0,
              },
            }}
          >
            <div
              className="dialog-container"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                overflow: "hidden",
              }}
            >
              {/* Use PDFViewer to allow for real-time updates */}
              <PDFViewer
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  overflow: "hidden",
                }}
              >
                <PreviewDocs
                  invoicePreview={true}
                  promoPreview={false}
                  poPreview={false}
                  value={value}
                />
              </PDFViewer>
            </div>
          </Dialog>
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
              <Typography style={{ fontSize: "0.6rem", color: "#7C7C7C" }}>
                Fields marked as <span style={{ color: "red" }}>*</span> are
                mandatory
              </Typography>
            </div>

            <Form className="generalRadio">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  // className="mb-3"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
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
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "Poppins,sans-sherif",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{`System Document ID:  `}</span>
                  <span
                    style={{
                      backgroundColor: "#e8e8e8",
                      marginLeft: "0.5rem",
                      // padding: "0.15rem",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      borderRadius: "4rem",
                      fontWeight: "600",
                    }}
                  >
                    {value.systemDocumentId}
                  </span>
                </div>
              </div>
            </Form>
            <CardOverflow sx={{ p: 0 }} style={{ backgroundColor: "#F5F6F8" }}>
              <Stack
                direction="row"
                spacing={3}
                // sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
                style={{ margin: "1rem", display: "flex" }}
              >
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Invoice Date"
                        required={true}
                        type="date"
                        placeholder="Enter your Invoice Date"
                        value={value.invoiceData?.invoiceDate} // Use raw yyyy-mm-dd format
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
                        value={value.poDetailsData[0]?.supplierId || ""}
                        // fun={(text) =>
                        //   value.setInvoiceData({
                        //     ...value.invoiceData,
                        //     supplierId: text,
                        //   })
                        // }
                        fun={(text) =>
                          value.setPoDetailsData({
                            ...value.poDetailsData,
                            supplierId: text,
                          })
                        }
                        editable={true}
                        // style={{ backgroundColor: "#e8e8e8" }}
                        EndComponent={
                          value.poDetailsData[0]?.supplierId ? (
                            <BsFillInfoCircleFill
                              onClick={() => setSupplierPopupStatus(true)}
                            />
                          ) : null
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
                        value={value.invoiceData?.poNumber}
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
                        value={value.invoiceData?.userInvNo}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            userInvNo: text,
                          })
                        }
                        // editable={true}
                        // style={{ backgroundColor: "#e8e8e8" }}
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Payment Terms"
                        required={true}
                        placeholder="Enter your Payment Terms"
                        value={value?.poHeaderData?.paymentTerm}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            paymentTerm: text,
                          })
                        }
                        editable={true}
                        // style={{ backgroundColor: "#e8e8e8" }}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Amount"
                        required={true}
                        type="number"
                        placeholder="Enter your Total Amount"
                        value={value.invoiceData?.totalAmount}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            totalAmount: text,
                          })
                        }
                        editable={true}
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
                        value={value.invoiceData?.totalTax}
                        fun={(text) =>
                          value.setInvoiceData({
                            ...value.invoiceData,
                            totalTax: text,
                          })
                        }
                        editable={true}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Quantity"
                        required={true}
                        placeholder="Enter your Total Quantity"
                        value={sumQuantities(value.itemDetails?.quantity)}
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
                        value={value.poHeaderData?.currency}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            currency: text,
                          })
                        }
                        editable={true}
                        // style={{ backgroundColor: "#e8e8e8" }}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Currency Exchange Rate"
                        required={false}
                        placeholder="Enter your Currency Exchange Rate"
                        value={value.poHeaderData?.exchangeRate}
                        fun={(text) =>
                          value.setPoHeaderData({
                            ...value.poHeaderData,
                            exchangeRate: text,
                          })
                        }
                        editable={true}
                        // style={{ backgroundColor: "#e8e8e8" }}
                      />
                    </FormControl>
                  </Stack>
                </Stack>
              </Stack>
            </CardOverflow>
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
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  fontFamily: "Poppins,sans-sherif",
                }}
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                            backgroundColor: "#F5F6F8",
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
                              <BsFillInfoCircleFill
                                onClick={() => setItemPopupStatus(true)}
                                style={{
                                  position: "absolute",
                                  left: "1.5rem",
                                  fontSize: "0.6rem",
                                  margin: "0.1rem",
                                }}
                              />
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
                                  e.target.innerText,
                                  null
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
                                  null,
                                  e.target.innerText
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
                              {(
                                parseFloat(item.itemCost) *
                                parseFloat(item.itemQuantity)
                              ).toFixed(2)}
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
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "0.75rem",
            }}
          >
            <CardActions
              style={{
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
                  backgroundColor: "#1C244B",
                  fontFamily: "Poppins,sans-serif",
                }}
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                SAVE
              </Button>
              <Button
                size="md"
                variant="solid"
                style={{
                  backgroundColor: "#1C244B",
                  fontFamily: "Poppins,sans-serif",
                  color: "white",
                }}
                onClick={() => setInvoicePreview(true)}
              >
                PREVIEW
              </Button>

              <Button
                size="md"
                variant="solid"
                style={{
                  backgroundColor: "#1C244B",
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
          marginTop: "7.25vh", //margin-all
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatbotPane />
      </Grid>
    </Grid>
  );
}

export default DetailsSide;
