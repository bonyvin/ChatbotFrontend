// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import Button from "@mui/joy/Button";
// import Card from "@mui/joy/Card";
// import CardActions from "@mui/joy/CardActions";
// import CardOverflow from "@mui/joy/CardOverflow";
// import FormControl from "@mui/joy/FormControl";
// import IconButton from "@mui/joy/IconButton";
// import Stack from "@mui/joy/Stack";
// import { Dialog } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import Paper from "@mui/material/Paper";
// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Typography from "@mui/material/Typography";
// import { PDFViewer } from "@react-pdf/renderer";
// import React, { useContext, useEffect, useRef, useState } from "react";
// import { Form } from "react-bootstrap";
// import { BsFillInfoCircleFill } from "react-icons/bs";
// import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
// import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
// import CustomButton from "../../components/CustomButton/CustomButton";
// import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
// import FormSubmissionStatusPopUp from "../../components/PopupMessage/FormSubmissionStatusPopUp";
// import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";
// import { AuthContext } from "../../context/ContextsMasterFile";
// import "../../styles/general.css";
// import "../../styles/testStyles.css";
// import "../../styles/general.css";
// import InvoiceChatbot from "./InvoiceChatbot";
// import EmailPdf from "../../components/PDF Generation/EmailPdf";

// function InvoiceDetailsSide() {
//   const messagesEndRef = useRef(null);
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
//   const [supplierPopupStatus, setSupplierPopupStatus] = useState(false);
//   const [itemPopupStatus, setItemPopupStatus] = useState(false);
//   const [tableToggle, setTableToggle] = useState(false);
//   const [invoicePreview, setInvoicePreview] = useState(false);

//   const handleTableExpand = () => {
//     setTableToggle(!tableToggle);
//   };
//   useEffect(() => {
//     scrollToBottom();
//   }, [tableToggle]);
//   const value = useContext(AuthContext);
//   useEffect(() => {}, [value.poDetailsData.length]);
//   const showForm = value.isActive;
//   function sumQuantities(input) {
//     if (!input) return input;

//     const quantitiesArray = Array.isArray(input)
//       ? input
//       : input.split(",").map((num) => parseInt(num.trim(), 10));

//     return quantitiesArray.reduce((sum, current) => sum + current, 0);
//   }
//   const handleRadioChange = (type) => {
//     value.setTypeOfInvoice({
//       merchandise: type === "merchandise",
//       nonMerchandise: type === "nonMerchandise",
//       debitNote: type === "debitNote",
//       creditNote: type === "creditNote",
//     });
//     value.setInvoiceData({ ...value.invoiceData, invoiceType: type });
//   };

//   const handleItemAndQuantity = (itemId, qty, invCost) => {
//     if (value.poDetailsData.length === 1) {
//       value.setItemDetailsInput(() => ({
//         items: [itemId],
//         quantity: [qty],
//         invoiceCost: [invCost],
//       }));
//     } else if (value.poDetailsData.length > 1) {
//       value.setItemDetailsInput((prevState) => {
//         const itemIndex = prevState.items.indexOf(itemId);

//         if (itemIndex > -1) {
//           // Update quantity and invoiceCost for existing item
//           const updatedQuantities = [...prevState.quantity];
//           const updatedInvoiceCosts = [...prevState.invoiceCost];
//           updatedQuantities[itemIndex] = qty;
//           updatedInvoiceCosts[itemIndex] = invCost;

//           return {
//             items: [...prevState.items],
//             quantity: updatedQuantities,
//             invoiceCost: updatedInvoiceCosts,
//           };
//         } else {
//           // Add new item, quantity, and invoiceCost
//           return {
//             items: [...prevState.items, itemId],
//             quantity: [...prevState.quantity, qty],
//             invoiceCost: [...prevState.invoiceCost, invCost],
//           };
//         }
//       });
//     } else {
//       console.log("poDetailsData length <= 0, handleItemAndQuantity");
//     }
//   };
  
//     const sendEmail = async ({ emailUsed, documentId }) => {
//       // await EmailPdf({
//       //   emailUsed: emailUsed,
//       //   bodyUsed: { "documentType": "Invoice" },
//       //   invoice: true,
//       //   documentId: documentId
//       // });
//       const emailStatus = await EmailPdf({
//         emailUsed: emailUsed,
//         bodyUsed: { documentType: "Invoice" },
//         invoice: true,
//         documentId: documentId,
//       });
  
//       if (emailStatus && emailStatus.success) {
//         console.log("Email sending was successful! Now calling another function...");
//       } else {
//         console.log("Email sending failed or returned no status.");
//         console.error("Error message:", emailStatus?.message || "Unknown error");
//       }
//     }
//   // console.log("pod:",value.poDetailsData)
//   return (
//     <Grid container component="main" style={{ backgroundColor: "#e9ecef" }}>
//       <Grid
//         item
//         xs={8}
//         sm={8}
//         md={8}
//         container
//         component="main"
//         style={{ padding: "1rem", paddingLeft: "0.25rem" }}
//         // className="imageBackground"
//         ref={messagesEndRef}
//       >
//         <div style={{ position: "absolute" }}>
//           <FormSubmissionStatusPopUp {...value.modalDetails} />
//           <ItemInfoPopup
//             visible={itemPopupStatus}
//             setVisible={setItemPopupStatus}
//           />
//           <SupplierInfoPopUp
//             visible={supplierPopupStatus}
//             setVisible={setSupplierPopupStatus}
//             data={value.supplierDetails.supplierInsights}
//           />
//           <Dialog className="invoice-preview"
//             open={invoicePreview}
//             onClose={() => setInvoicePreview(false)}
//             aria-labelledby="responsive-dialog-title"
//             // style={{
//             //   width: "90%",
//             //   height: "90%",
//             //   margin: "auto",
//             // }}
//             PaperProps={{
//               style: {
//                 width: "100%",
//                 height: "100%",
//                 maxWidth: "unset",
//                 maxHeight: "unset",
//                 margin: 0,
//               },
//             }}
//           >
//             <div className="dialog-container">
//               {/* Use PDFViewer to allow for real-time updates */}
//               <PDFViewer className="pdf-viewer"
//                 // style={{
//                 //   flex: 1,
//                 //   width: "100%",
//                 //   height: "100%",
//                 //   border: "none",
//                 //   overflow: "hidden",
//                 // }}
//               >
//                 <PreviewDocs
//                   invoicePreview={true}
//                   promoPreview={false}
//                   poPreview={false}
//                   value={value}
//                 />
//               </PDFViewer>
//             </div>
//           </Dialog>
//           {/* <PopUp visible={value.modalVisible} text={value.modalText} /> */}
//         </div>

//         {/* {!showForm ? (
//           <Card
//             className="generalView"
//             style={{ width: "100%", padding: "2rem" }}
            
//           >
//             <img src={symbolBlue} style={{ width: "4.2rem" }}></img>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "flex-start",
//                 width: "60%",
//               }}
//             >
//               <Typography
//                 className="OpenSans"
//                 style={{
//                   fontSize: "2rem",
//                   fontWeight: "700",
//                   color: "#00338D",
//                   marginBottom: "1.5rem",
//                   marginTop: "1.5rem",
//                 }}
//               >
//                 Welcome Charles !
//               </Typography>
//               <Typography
//                 style={{
//                   fontSize: "1rem",
//                   fontWeight: "500",
//                   color: "#00338D",
//                   textAlign: "left",
//                 }}
//               >
//                 Need help with purchase orders, invoices, payments, ASNs,
//                 promotions or more? I've got you covered - happy to assist!
//               </Typography>
//             </div>
//           </Card>
//         ) : ( */}

//         <Card
//           className="generalView"
//           style={{ width: "100%" }}
//           ref={messagesEndRef}
//         >
//           <Card ref={messagesEndRef}>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "flex-start",
//               }}
//             >
//               <Typography
//                 style={{
//                   fontSize: "1rem",
//                   fontWeight: "700",
//                   fontFamily: "Poppins,sans-sherif",
//                 }}
//               >
//                 Invoice Details
//               </Typography>
//               <Typography style={{ fontSize: "0.6rem", color: "#7C7C7C" }}>
//                 Fields marked as <span style={{ color: "red" }}>*</span> are
//                 mandatory
//               </Typography>
//             </div>

//             <Form className="generalRadio">
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <div
//                   // className="mb-3"
//                   style={{
//                     display: "flex",
//                     flexDirection: "row",
//                     justifyContent: "flex-start",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Form.Check
//                     inline
//                     label="Merchandise"
//                     name="group1"
//                     type={"radio"}
//                     id={`inline- -1`}
//                     className="labelText"
//                     checked={value.typeOfInvoice.merchandise}
//                     onChange={() => handleRadioChange("merchandise")}
//                     // checked={value.invoiceData.invoiceType.match(/merchandise/i) }
//                   />
//                   <Form.Check
//                     inline
//                     label="Non - Merchandise"
//                     name="group1"
//                     type={"radio"}
//                     id={`inline- -2`}
//                     className="labelText"
//                     checked={value.typeOfInvoice.nonMerchandise}
//                     onChange={() => handleRadioChange("nonMerchandise")}
//                     // checked={value.invoiceData.invoiceType === "Non - Merchandise"}
//                   />
//                   <Form.Check
//                     inline
//                     label="Debit Note"
//                     name="group1"
//                     type={"radio"}
//                     id={`inline- -3`}
//                     className="labelText"
//                     checked={value.typeOfInvoice.debitNote}
//                     onChange={() => handleRadioChange("debitNote")}
//                     // checked={value.invoiceData.invoiceType.match(/debit\s*-\s*\s*note\s*: ?(.*?)(?:,|$)/i) }
//                   />
//                   <Form.Check
//                     inline
//                     label="Credit Note"
//                     name="group1"
//                     type={"radio"}
//                     id={`inline- -4`}
//                     className="labelText"
//                     // checked={value.invoiceData.invoiceType === "Credit Note"}
//                     checked={value.typeOfInvoice.creditNote}
//                     onChange={() => handleRadioChange("creditNote")}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "0.75rem",
//                     fontFamily: "Poppins,sans-sherif",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <span>{`System Document ID:  `}</span>
//                   <span
//                     style={{
//                       backgroundColor: "#e8e8e8",
//                       marginLeft: "0.5rem",
//                       // padding: "0.15rem",
//                       paddingLeft: "1rem",
//                       paddingRight: "1rem",
//                       borderRadius: "4rem",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {value.systemDocumentId}
//                   </span>
//                 </div>
//               </div>
//             </Form>
//             <CardOverflow sx={{ p: 0 }} style={{ backgroundColor: "#F5F6F8" }}>
//               <Stack
//                 direction="row"
//                 spacing={3}
//                 // sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
//                 style={{ margin: "1rem", display: "flex" }}
//               >
//                 <Stack spacing={2} sx={{ flexGrow: 1 }}>
//                   <Stack direction="row" spacing={2}>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Invoice Date"
//                         required={true}
//                         type="date"
//                         placeholder="Enter your Invoice Date"
//                         value={value.invoiceData?.invoiceDate} // Use raw yyyy-mm-dd format
//                         fun={(text) => {
//                           console.log("Date selected:", text);
//                           value.setInvoiceData({
//                             ...value.invoiceData,
//                             invoiceDate: text, // Save in yyyy-mm-dd format
//                           });
//                         }}
//                       />
//                     </FormControl>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Supplier ID"
//                         required={true}
//                         placeholder="Supplier ID"
//                         value={value.poDetailsData[0]?.supplierId || ""}
//                         // fun={(text) =>
//                         //   value.setInvoiceData({
//                         //     ...value.invoiceData,
//                         //     supplierId: text,
//                         //   })
//                         // }
//                         fun={(text) =>
//                           value.setPoDetailsData({
//                             ...value.poDetailsData,
//                             supplierId: text,
//                           })
//                         }
//                         editable={true}
//                         // style={{ backgroundColor: "#e8e8e8" }}
//                         EndComponent={
//                           value.poDetailsData[0]?.supplierId ? (
//                             <BsFillInfoCircleFill
//                               onClick={() => setSupplierPopupStatus(true)}
//                             />
//                           ) : null
//                         }
//                         // value={value.invoiceData.invoiceDate}
//                         // fun={(text) => value.setInvoiceData({ ...value.invoiceData, invoiceDate: text })}
//                       />
//                     </FormControl>
//                   </Stack>
//                   <Stack direction="row" spacing={2}>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="PO No."
//                         required={true}
//                         placeholder="Enter your PO No."
//                         value={value.invoiceData?.poNumber}
//                         fun={(text) =>
//                           value.setInvoiceData({
//                             ...value.invoiceData,
//                             poNumber: text,
//                           })
//                         }
//                       />
//                     </FormControl>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Invoice No."
//                         required={true}
//                         placeholder="Enter your Invoice No."
//                         value={value.invoiceData?.userInvNo}
//                         fun={(text) =>
//                           value.setInvoiceData({
//                             ...value.invoiceData,
//                             userInvNo: text,
//                           })
//                         }
//                         // editable={true}
//                         // style={{ backgroundColor: "#e8e8e8" }}
//                       />
//                     </FormControl>
//                   </Stack>
//                   <Stack direction="row" spacing={2}>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Payment Terms"
//                         required={true}
//                         placeholder="Payment Terms"
//                         value={value?.poHeaderData?.paymentTerm}
//                         fun={(text) =>
//                           value.setPoHeaderData({
//                             ...value.poHeaderData,
//                             paymentTerm: text,
//                           })
//                         }
//                         editable={true}
//                         // style={{ backgroundColor: "#e8e8e8" }}
//                       />
//                     </FormControl>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Total Amount"
//                         required={true}
//                         type="number"
//                         placeholder="Total Amount"
//                         value={value.invoiceData?.totalAmount}
//                         fun={(text) =>
//                           value.setInvoiceData({
//                             ...value.invoiceData,
//                             totalAmount: text,
//                           })
//                         }
//                         editable={true}
//                       />
//                     </FormControl>
//                   </Stack>
//                   <Stack direction="row" spacing={2}>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Total Tax"
//                         required={true}
//                         type="number"
//                         placeholder="Total Tax"
//                         value={value.invoiceData?.totalTax}
//                         fun={(text) =>
//                           value.setInvoiceData({
//                             ...value.invoiceData,
//                             totalTax: text,
//                           })
//                         }
//                         editable={true}
//                       />
//                     </FormControl>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Total Quantity"
//                         required={true}
//                         placeholder="Enter your Total Quantity"
//                         value={sumQuantities(value.itemDetails?.quantity)}
//                         // value={value.itemDetails.quantity}
//                         fun={(text) =>
//                           value.setItemDetails({
//                             ...value.itemDetails,
//                             quantity: text,
//                           })
//                         }
//                         editable={true}
//                       />
//                     </FormControl>
//                   </Stack>
//                   <Stack direction="row" spacing={2}>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Currency"
//                         required={true}
//                         placeholder="Currency"
//                         value={value.poHeaderData?.currency}
//                         fun={(text) =>
//                           value.setPoHeaderData({
//                             ...value.poHeaderData,
//                             currency: text,
//                           })
//                         }
//                         editable={true}
//                         // style={{ backgroundColor: "#e8e8e8" }}
//                       />
//                     </FormControl>
//                     <FormControl sx={{ flex: 1 }}>
//                       <DynamicCutoutInput
//                         label="Currency Exchange Rate"
//                         required={false}
//                         placeholder="Currency Exchange Rate"
//                         value={value.poHeaderData?.exchangeRate}
//                         fun={(text) =>
//                           value.setPoHeaderData({
//                             ...value.poHeaderData,
//                             exchangeRate: text,
//                           })
//                         }
//                         editable={true}
//                         // style={{ backgroundColor: "#e8e8e8" }}
//                       />
//                     </FormControl>
//                   </Stack>
//                 </Stack>
//               </Stack>
//             </CardOverflow>
//           </Card>
//           <Card>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//               }}
//             >
//               <Typography
//                 className="poppins"
//                 style={{
//                   fontSize: "1rem",
//                   fontWeight: "700",
//                   fontFamily: "Poppins,sans-sherif",
//                 }}
//               >
//                 Item Details
//               </Typography>
//               <IconButton aria-label="exp" onClick={handleTableExpand}>
//                 {tableToggle ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             </div>
//             {tableToggle && (
//               <Paper sx={{ width: "100%" }}>
//                 <TableContainer sx={{}}>
//                   <Table stickyHeader aria-label="sticky table">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           Item ID
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           Item Description
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           Invoice Quantity
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           PO Quantity
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           Invoice Cost
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           PO Cost
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           Inv. Amount
//                         </TableCell>
//                         <TableCell
//                           align="center"
//                           colSpan={0.5}
//                           style={{
//                             fontFamily: "Poppins,sans-serif",
//                             fontSize: "0.6rem",
//                             color: "#575F6E",
//                             backgroundColor: "#F5F6F8",
//                           }}
//                         >
//                           PO Amount
//                         </TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody ref={messagesEndRef}>
//                       {value.poDetailsData.length > 0 ? (
//                         value.poDetailsData.map((item, index) => (
//                           <TableRow hover role="checkbox">
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               <BsFillInfoCircleFill
//                                 onClick={() => setItemPopupStatus(true)}
//                                 style={{
//                                   position: "absolute",
//                                   left: "1.5rem",
//                                   fontSize: "0.6rem",
//                                   margin: "0.1rem",
//                                 }}
//                               />
//                               {item.itemId}
//                             </TableCell>
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               {item.itemDescription}
//                             </TableCell>
//                             {/* <TableCell align="center"
//                               colSpan={0.5}>
//                                 <input value={item.invQty} style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }} onChange={(e) =>
//                                 handleItemAndQuantity(
//                                   item.itemId,
//                                   e.target.value
//                                 )
//                               }></input>
//                               </TableCell> */}

//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins, sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                                 outline: "none",

//                                 // border:'solid'
//                               }}
//                               contentEditable
//                               suppressContentEditableWarning={true} // Suppress the warning
//                               onInput={(e) =>
//                                 handleItemAndQuantity(
//                                   item.itemId,
//                                   e.target.innerText,
//                                   null
//                                 )
//                               }
//                             >
//                               <div
//                                 style={{
//                                   borderWidth: 1.5,
//                                   // margin: 2,
//                                   borderRadius: 12,
//                                   padding: 5,
//                                   border: "1px solid black",
//                                 }}
//                               >
//                                 {item.invQty}
//                               </div>
//                             </TableCell>
//                             {/* <TableCell align="center" colSpan={0.5}>
//                               <input
//                                 type="text"
//                                 value={item.invQty}
//                                 onChange={(e) =>
//                                   handleItemAndQuantity(
//                                     item.itemId,
//                                     e.target.value
//                                   )
//                                 }
//                                 style={{
//                                   fontFamily: "Poppins, sans-serif",
//                                   fontSize: "0.6rem",
//                                   color: "#454B54",
//                                   border: "none",
//                                   width: "100%",
//                                   textAlign: "center",
//                                   backgroundColor: "transparent",
//                                 }}
//                               />
//                             </TableCell> */}
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               {item.itemQuantity}
//                             </TableCell>
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins, sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                                 outline: "none",

//                                 // border:'solid'
//                               }}
//                               contentEditable
//                               suppressContentEditableWarning={true} // Suppress the warning
//                               onInput={(e) =>
//                                 handleItemAndQuantity(
//                                   item.itemId,
//                                   null,
//                                   e.target.innerText
//                                 )
//                               }
//                             >
//                               {" "}
//                               <div
//                                 style={{
//                                   borderWidth: 1.5,
//                                   // margin: 2,
//                                   borderRadius: 12,
//                                   padding: 5,
//                                   border: "1px solid black",
//                                 }}
//                               >
//                                 {item.invCost}
//                               </div>
//                             </TableCell>
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               {item.itemCost}
//                             </TableCell>
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               {item.invAmt}
//                             </TableCell>
//                             <TableCell
//                               align="center"
//                               colSpan={0.5}
//                               style={{
//                                 fontFamily: "Poppins,sans-serif",
//                                 fontSize: "0.6rem",
//                                 color: "#454B54",
//                               }}
//                             >
//                               {(
//                                 parseFloat(item.itemCost) *
//                                 parseFloat(item.itemQuantity)
//                               ).toFixed(2)}
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow hover role="checkbox">
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                           <TableCell
//                             align="center"
//                             colSpan={0.5}
//                             style={{
//                               fontFamily: "Poppins,sans-serif",
//                               fontSize: "0.6rem",
//                               color: "#454B54",
//                             }}
//                           >
//                             No data
//                           </TableCell>
//                         </TableRow>
//                       )}
//                       <div ref={messagesEndRef} />
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             )}
//           </Card>
//           <CardOverflow
//             sx={{ borderTop: "1px solid", borderColor: "divider" }}
//             style={{
//               flexGrow: 1,
//               display: "flex",
//               justifyContent: "flex-end",
//               paddingBottom: "0.75rem",
//             }}
//           >
//             <CardActions
//               style={{
//                 justifyContent: "space-between",
//                 marginLeft: "1rem",
//                 marginRight: "1rem",
//               }}
//             >
//               {/* <CardActions sx={{ justifyContent: "space-evenly" }}> */}
//               <CustomButton
//                 onClick={() => value.setFormSave((prevState) => !prevState)}
//               >
//                 SAVE
//               </CustomButton>

//               <CustomButton
//                 onClick={() => setInvoicePreview(true)}
//               >
//                 PREVIEW
//               </CustomButton>

//               <CustomButton
//                 // onClick={() => sendEmail({emailUsed: "experiencex.team@gmail.com",documentId:"INV164"})}
//                 onClick={() => value.setFormSubmit((prevState) => !prevState)}
//               >
//                 SUBMIT
//               </CustomButton>
//             </CardActions>
//           </CardOverflow>
//         </Card>
//         {/* )}  */}
//       </Grid>
//       <Grid
//         item
//         xs={4}
//         sm={4}
//         md={4}
//         // className="imageBackground"
//         style={{
//           marginTop: "7.25vh", //margin-all
//           width: "100%",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//        <InvoiceChatbot />
//       </Grid>
//     </Grid>
//   );
// }

// export default InvoiceDetailsSide;
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
import React, { useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { Box } from '@mui/material';
import { BsFillInfoCircleFill } from "react-icons/bs";
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PublishIcon from '@mui/icons-material/Publish';
import InputFieldComponent from "../../components/InputFieldComponent";
import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
import CustomButton from "../../components/CustomButton/CustomButton";
import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
import FormSubmissionStatusPopUp from "../../components/PopupMessage/FormSubmissionStatusPopUp";
import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";
import { AuthContext } from "../../context/ContextsMasterFile";
import "../../styles/general.css";
import "../../styles/testStyles.css";
import "../../styles/general.css";
import InvoiceChatbot from "./InvoiceChatbot";
import EmailPdf from "../../components/PDF Generation/EmailPdf";

function InvoiceDetailsSide() {
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
  
    const sendEmail = async ({ emailUsed, documentId }) => {
      // await EmailPdf({
      //   emailUsed: emailUsed,
      //   bodyUsed: { "documentType": "Invoice" },
      //   invoice: true,
      //   documentId: documentId
      // });
      const emailStatus = await EmailPdf({
        emailUsed: emailUsed,
        bodyUsed: { documentType: "Invoice" },
        invoice: true,
        documentId: documentId,
      });
  
      if (emailStatus && emailStatus.success) {
        console.log("Email sending was successful! Now calling another function...");
      } else {
        console.log("Email sending failed or returned no status.");
        console.error("Error message:", emailStatus?.message || "Unknown error");
      }
    }
  // console.log("pod:",value.poDetailsData)
  return (
    <Grid container component="main" style={{ height: "100vh", backgroundColor: "#384B70" }}>
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
          <FormSubmissionStatusPopUp {...value.modalDetails} />
          <ItemInfoPopup
            visible={itemPopupStatus}
            setVisible={setItemPopupStatus}
          />
          <SupplierInfoPopUp
            visible={supplierPopupStatus}
            setVisible={setSupplierPopupStatus}
            data={value.supplierDetails.supplierInsights}
          />
          <Dialog className="invoice-preview"
            open={invoicePreview}
            onClose={() => setInvoicePreview(false)}
            aria-labelledby="responsive-dialog-title"
            // style={{
            //   width: "90%",
            //   height: "90%",
            //   margin: "auto",
            // }}
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
            <div className="dialog-container">
              {/* Use PDFViewer to allow for real-time updates */}
              <PDFViewer className="pdf-viewer"
                // style={{
                //   flex: 1,
                //   width: "100%",
                //   height: "100%",
                //   border: "none",
                //   overflow: "hidden",
                // }}
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

        <Card
          className="generalView"
          style={{ width: "100%", backgroundColor: "#73809A", borderRadius: "3%", borderColor: "#73809A", marginLeft: "4%", boxShadow: "2px 2px 8px rgba(66, 57, 57, 0.75)",marginTop:"2.95rem"}}
          ref={messagesEndRef}
        >
          
              <div
            style={{
              marginLeft: "2%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                fontFamily: "Montserrat,sans-sherif",
              }}
            >
              Invoice Details
            </Typography>
            <Typography
              style={{
                fontSize: "0.6rem",
                color: "white",
                fontFamily: "Montserrat,sans-sherif",
              }}>
              Fields marked as * are mandatory
            </Typography>
          </div>

            <Form className="generalRadio">
              <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "0.8rem",width: "96%"}}>
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
                    fontFamily: "Montserrat,sans-sherif",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{`System Document ID:  `}</span>
                  <span
                    style={{
                      backgroundColor: "white",
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
            <CardOverflow sx={{ p: 0 }}>
              <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                rowGap: 1,
                columnGap: 3,
                px: 4,
                marginBottom: "1rem"
              }}
            >
                    <FormControl>
                      <InputFieldComponent
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
                    <FormControl >
                      <InputFieldComponent
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
                    value.supplierDetails.supplierStatus === true ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                                  {" "}
                        <BsFillInfoCircleFill
                          onClick={() => setSupplierPopupStatus(true)}
                          style={{ cursor: "pointer" }}
                        />
                                  {" "}
                      </div>
                    ) : null
                  }

                  />
                    </FormControl>
                
                    <FormControl >
                      <InputFieldComponent
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
                    <FormControl >
                      <InputFieldComponent
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
                  
                  
                    <FormControl>
                      <InputFieldComponent
                        label="Payment Terms"
                        required={true}
                        placeholder="Payment Terms"
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
                    <FormControl >
                      <InputFieldComponent
                        label="Total Amount"
                        required={true}
                        type="number"
                        placeholder="Total Amount"
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
                 
                  
                    <FormControl >
                      <InputFieldComponent
                        label="Total Tax"
                        required={true}
                        type="number"
                        placeholder="Total Tax"
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
                    <FormControl >
                      <InputFieldComponent
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
              
                    <FormControl >
                      <InputFieldComponent
                        label="Currency"
                        required={true}
                        placeholder="Currency"
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
                      <InputFieldComponent
                        label="Currency Exchange Rate"
                        required={false}
                        placeholder="Currency Exchange Rate"
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
                 </Box>
            </CardOverflow>
          
          {/* <Card> */}
            <div
              style={{
              marginLeft: "2%",
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
                color: "white",
                fontFamily: "Montserrat,sans-sherif",
              }}
              >
                Item Details
              </Typography>
              <IconButton sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: '#a0b3d8',
                color: 'white',
              },
            }} onClick={handleTableExpand} className="expandIcon">
              {tableToggle ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            </div>
            {tableToggle && (
            <div style={{
              marginLeft: "2%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",

            }}>
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
              </div>
            )}
          {/* </Card> */}
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
                justifyContent: "center",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              {/* <CardActions sx={{ justifyContent: "space-evenly" }}> */}
              <CustomButton
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                <SaveIcon style={{ color: "2E333E" }}></SaveIcon>
                SAVE
              </CustomButton>

              <CustomButton
                onClick={() => setInvoicePreview(true)}
              >
                <PreviewIcon style={{ color: "2E333E" }}></PreviewIcon>
                PREVIEW
              </CustomButton>

              <CustomButton
                // onClick={() => sendEmail({emailUsed: "experiencex.team@gmail.com",documentId:"INV164"})}
                onClick={() => value.setFormSubmit((prevState) => !prevState)}
              >
                <PublishIcon style={{ color: "2E333E" }}></PublishIcon>
                SUBMIT
              </CustomButton>
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
       <InvoiceChatbot />
      </Grid>
    </Grid>
  );
}

export default InvoiceDetailsSide;
