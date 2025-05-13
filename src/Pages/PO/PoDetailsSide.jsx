import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import FormControl from "@mui/joy/FormControl";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import { Dialog } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { PDFViewer } from "@react-pdf/renderer";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
import PopUp from "../../components/PopupMessage/FormSubmissionStatusPopUp";
import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";
import CustomButton from "../../components/CustomButton/CustomButton";
import { AuthContext } from "../../context/ContextsMasterFile";
import "../../styles/general.css";
import "../../styles/testStyles.css";
import "../../styles/general.css";
import POChatbotPane from "./POChatbotPane";
import { SUPPLIER_RISK_INSIGHT } from "../../const/ApiConst";

function PoDetailsSide() {
  const messagesEndRef = useRef(null);
  const [supplierInsights,setSupplierInsights]=useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [supplierPopupStatus, setSupplierPopupStatus] = useState(false);
  const [itemPopupStatus, setItemPopupStatus] = useState(false);

  const [tableToggle, setTableToggle] = useState(false);
  const [poPreview, setPoPreview] = useState(false);

  const handleTableExpand = () => {
    setTableToggle(!tableToggle);
  };
  useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);
  const value = useContext(AuthContext);
  const { purchaseOrderData, dispatch } = useContext(AuthContext);
  // useEffect(() => {}, [value.poDetailsData.length]);
  // console.log("Po details:",value.poDetailsData.length,value.poDetailsData)
  const showForm = value.isActive;
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
  //   const handleRadioChange = (type) => {
  //     value.setTypeOfInvoice({
  //       merchandise: type === "merchandise",
  //       nonMerchandise: type === "nonMerchandise",
  //       debitNote: type === "debitNote",
  //       creditNote: type === "creditNote",
  //     });
  //     value.setInvoiceData({ ...value.invoiceData, invoiceType: type });
  //   };

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
  // console.log("value:", value);
  useEffect(() => {
    value.setPoCounterId(`PO${value.poCounter}`);
    // dispatch({
    //   type: "UPDATE_FIELD",
    //   field: "poNumber",
    //   value: `PO${value.poCounter}`,
    // });
  }, [value.poCounter]);

    const supplierRiskApi=async(supplierId)=>{
      try {
        // console.log("clearDataApi");
        const response = await axios({
          method: "get",
          url: SUPPLIER_RISK_INSIGHT(supplierId),
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
        setSupplierInsights(response.data)
        // console.log("invoice Clear Response:", response.data);
      } catch (error) {
        console.log("Supplier Risk Error:", error, error.data);
      }
    };

    
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
            data={supplierInsights}
          />
          <Dialog
            open={poPreview}
            onClose={() => setPoPreview(false)}
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
              // style={{
              //   width: "100%",
              //   height: "100%",
              //   display: "flex",
              //   overflow: "hidden",
              // }}
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
                  poPreview={true}
                  invoicePreview={false}
                  promoPreview={false}
                  value={value}
                />
              </PDFViewer>
            </div>
          </Dialog>
        </div>

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
                PO Details
              </Typography>
              <Typography style={{ fontSize: "0.6rem" }}>
                Fields marked as * are mandatory
              </Typography>
            </div>
            <CardOverflow sx={{ p: 0 }} style={{ backgroundColor: "#F5F6F8" }}>
              <Stack
                direction="row"
                spacing={3}
                style={{ margin: "1rem", display: "flex" }}
              >
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="PO Number"
                        required={true}
                        //   type="date"
                        placeholder="Purchase Order No."
                        value={`PO${value.poCounter}`}
                        editable={true}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Supplier ID"
                        required={true}
                        //   type="date"
                        placeholder="Enter Supplier ID"
                        value={value.supplierDetails.supplierId}
                        fun={(text) =>
                          value.setSupplierDetails({
                            ...value.supplierDetails,
                            supplierId: text,
                          })
                        }
                        EndComponent={
                          value.supplierDetails.supplierStatus == true ? (
                            <BsFillInfoCircleFill
                              onClick={() => setSupplierPopupStatus(true)}
                            />
                          ) : null
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Lead Time"
                        required={true}
                        //   type="date"
                        placeholder="Lead Time"
                        value={value.supplierDetails.leadTime}
                        fun={(text) =>
                          value.setSupplierDetails({
                            ...value.supplierDetails,
                            leadTime: text,
                          })
                        }
                        editable={true}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Est. Delivery Date"
                        required={true}
                        type="date"
                        placeholder="Estimated Delivery Date"
                        inputValue={purchaseOrderData.estDeliveryDate}
                        fun={(text) => {
                          // console.log("Date selected:", text);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "estDeliveryDate",
                            value: text,
                          });
                        }}
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Quantity"
                        required={true}
                        type="number"
                        placeholder="Total Quantity"
                        inputValue={purchaseOrderData.totalQuantity}
                        fun={(text) => {
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "totalQuantity",
                            value: text,
                          });
                        }}
                        editable={true}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Total Cost"
                        required={true}
                        type="number"
                        placeholder="Total Cost"
                        inputValue={purchaseOrderData.totalCost}
                        fun={(text) => {
                          // console.log("Date selected:", text);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "totalCost",
                            value: text,
                          });
                        }}
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
                        placeholder="Total Tax"
                        inputValue={purchaseOrderData.totalTax}
                        fun={(text) => {
                          // console.log("Date selected:", text);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "totalTax",
                            value: text,
                          });
                        }}
                        editable={true}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Comments(if any)"
                        //   required={true}
                        //   type="date"
                        placeholder="Enter Comments(if any)"
                        inputValue={purchaseOrderData.comments}
                        fun={(text) => {
                          // console.log("Date selected:", text);
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "comments",
                            value: text,
                          });
                        }}
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
                          Item Quantity
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
                          Item Cost
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
                          Total Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody ref={messagesEndRef}>
                      {value.purchaseItemDetails.length > 0 ? (
                        value.purchaseItemDetails.map((item, index) => (
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
                                  left: "2.5rem",
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
                            {/* <TableCell
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
                            {/* <TableCell
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
              sx={{
                justifyContent: "space-between",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              <CustomButton
                size="md"
                variant="solid"
                style={{
                  backgroundColor: "#1C244B",
                  fontFamily: "Poppins,sans-serif",
                }}
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                SAVE
              </CustomButton>
              <CustomButton
                onClick={() => setPoPreview(true)}
              >
                PREVIEW
              </CustomButton>
              <CustomButton
                
                onClick={() =>(supplierRiskApi('SUP130'),setSupplierPopupStatus(true))}
                // onClick={() => value.setFormSubmit((prevState) => !prevState)}
              >
                SUBMIT
              </CustomButton>
            </CardActions>
          </CardOverflow>
        </Card>
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
        <POChatbotPane />
      </Grid>
    </Grid>
  );
}

export default PoDetailsSide;
