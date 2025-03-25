//08-03-2025
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import ChatMessage from "./ChatMessage";
import "../styles/chatbot.css";
import "../styles/general.css";
import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
import Add from "@mui/icons-material/AddCircle";
import SendIcon from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import bgImage from "../images/bgImage.png";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";
import axios from "axios";
import { StyledModalRoot } from "@mui/joy/Modal/Modal";
import PdfCard from "./PDF Generation/PdfCard";
import ReactMarkdown from "react-markdown";
import "../styles/chatbot.css";
import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import typingIndicator from "../images/typingIndicator1.gif";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function POChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [invoiceCostArray, setInvoiceCostArray] = useState();
  const [pdfData, setPdfData] = useState();
  const { input, setInput } = value;
  const prevPoDetailsDataRef = useRef(value.poDetailsData);
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const messageEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef(null);
  const { purchaseOrderData, dispatch } = useContext(AuthContext);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  //FORM ACTIONS
  //save
  const saveFormData = async () => {
    // value.setItemDetails(value.itemDetailsInput);
    // const getTrueValueKey = (obj) => {
    //   return Object.keys(obj).find((key) => obj[key] === true);
    // };
    // const itemsPresent = Object.values(value.itemDetailsInput.items).length > 0;
    // const quantitiesPresent =
    //   Object.values(value.itemDetailsInput.quantity).length > 0;

    // const filteredQuantities =
    //   quantitiesPresent &&
    //   value.itemDetailsInput.quantity.filter((quantity, index) => {
    //     const matchingPoDetail = value.poDetailsData.find(
    //       (poItem) => poItem.itemId === value.itemDetailsInput.items[index]
    //     );
    //     return matchingPoDetail !== undefined;
    //   });
    let savedData = `
      ${
        value.supplierDetails.supplierId
          ? `Supplier Id: ${value.supplierDetails.supplierId},`
          : ""
      }

      ${
        purchaseOrderData.estDeliveryDate
          ? `Estimated Delivery Date: ${purchaseOrderData.estDeliveryDate},`
          : ""
      }
     
    `;
    // ${value.poCounterId ? `PO number: ${value.poCounterId},` : ""}
    // ${
    //   value.purchaseItemDetails?.map(item=>item.itemId)
    //     ? `Items: ${value.purchaseItemDetails.map(item=>item.itemId)},`
    //     : ""
    // }
    // ${
    //   value.purchaseItemDetails?.map(item=>item.itemQuantity)
    //     ? `Quantity: ${value.purchaseItemDetails?.map(item=>item.itemQuantity)}`
    //     : ""
    // ${
    //   purchaseOrderData.totalQuantity
    //     ? `Total Quantity: ${purchaseOrderData.totalQuantity},`
    //     : ""
    // }
    // ${
    //   purchaseOrderData.totalCost
    //     ? `Total Cost: ${purchaseOrderData.totalCost},`
    //     : ""
    // }
    // ${
    //   purchaseOrderData.totalTax
    //     ? `Total Tax: ${purchaseOrderData.totalTax},`
    //     : ""
    // }
    // ${
    //   purchaseOrderData.comments
    //     ? `Comments: ${purchaseOrderData.comments},`
    //     : ""
    // }

    // }
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  //submit
  useEffect(() => {
    value.setPoCounterId(`PO${value.poCounter}`); 
    // dispatch({
    //   type: "UPDATE_FIELD",
    //   field: "poNumber",
    //   value: `PO${value.poCounter}`,
    // });
  }, [value.poCounter]);
  // console.log("PO counter: ",value)
  const submitFormData = async () => {
    await handleMessageSubmit("Please submit the data provided");
    // value.setFormSubmit((prevState) => !prevState);
    // value.setPoCounter((prevCounter) => prevCounter + 1);;
    // console.log("Submit",value.poCounter,value.poCounterId)
    // await invoiceDetailsCreation();
    // await invoiceHeaderCreation();
    // value.setPoCounter((prevCounter) => {
    //   const numericPart = parseInt(prevCounter.replace("PO", ""), 10);
    //   return `PO${numericPart + 1}`;
    // });
    // value.setPoCounter((prevCounter) => prevCounter + 1);
    // value.setPoCounter((prevCounter) => {
    //   const newCounter = prevCounter + 1; // Increment the counter
    //   value.setPoCounterId(`PO${newCounter}`); // Immediately update PO ID
    //   dispatch({
    //     type: "UPDATE_FIELD",
    //     field: "poNumber",
    //     value: `PO${newCounter}`,
    //   });
    //   return newCounter;
    // });
  };
  //clear
  const clearFormData = () => {
    value.setSupplierDetails({
      apiResponse: "",
      supplierId: "",
      leadTime: "",
      supplierStatus:false
    });
    let poEmptyData = {
      poNumber: "",
      supplierId: "",
      leadTime: "",
      estDeliveryDate: "",
      totalQuantity: "",
      totalCost: "",
      totalTax: "",
      comments: "",
    };
    dispatch({
      type: "UPDATE_PO_DATA",
      payload: poEmptyData,
    });
    value.setPurchaseItemDetails([]);
  };
  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);
  //SCROLLING FUNCTIONALITY
  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  //EMOJI PICKER
  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji.native);
    setPickerVisible(false);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!pickerRef.current?.contains(e.target)) setPickerVisible(false);
    };
    if (isPickerVisible)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPickerVisible]);
  //DATE FORMATTING
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date,returning date as it is", date);
      return date;
    }
  }
  const getSupplierDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setSupplierDetails({
          apiResponse: "",
          supplierId: "",
          leadTime: "",
          supplierStatus:false
        });
      }
      prevIdRef.current = id;

      try {
        const response = await axios.get(
          `http://localhost:8000/suppliers/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          console.log( 
            "Supplier Response: ",
            response.data,
            response.data.lead_time
          );
          value.setSupplierDetails({ 
            apiResponse: response.data,
            supplierId: id,
            leadTime: response.data.lead_time,
            supplierStatus:true
          });

          return true; // Return boolean for further processing
        } else {
          console.log("False Supplier Details");
          return false;
        }
      } catch (error) {
        console.log("False Supplier Details");

        value.setSupplierDetails({
          apiResponse: "",
          supplierId: "",
          leadTime: "",
          supplierStatus:false
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Supplier Id in our database, please try another Supplier Id",
            fromUser: false,
          },
        ]);
        console.error("Error fetching Supplier details:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.supplierDetails]
  );
  //ITEM AND QUANTITY UPDATES
  const itemQuantityValidation = async () => {
    //if po items and given items do not match set custom message. and return true if validated and false if not.
    let itemsMismatchMsg = `The items provided: ${itemsArray} do not match the items retrieved by the PO: ${value.itemListPo}. Please review the items again.`;
    let qtyMismatchMsg = `The quantity length ${quantitiesArray}  (${quantitiesArray?.length} items) does not match the number of items ${value.itemListPo} (${value.itemListPo.length} items). Please review and ensure the quantities and items are properly aligned.`;
    console.log(
      "items array: ",
      itemsArray,
      "List from PO",
      value.itemListPo,
      "types: ",
      typeof itemsArray,
      typeof value.itemListPo
    );
    if (JSON.stringify(value.itemListPo) !== JSON.stringify(itemsArray)) {
      setMessages([...messages, { text: itemsMismatchMsg, fromUser: false }]);

      return false;
    } else if (quantitiesArray?.length != value.itemListPo.length) {
      setMessages([...messages, { text: qtyMismatchMsg, fromUser: false }]);
      return false;
    } else {
      return true;
    }

    //check for single items.
  };
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (!invoiceDatafromConversation) {
        console.log("Nothing");
        return;
      }
      console.log("Here");

      const itemsArray = invoiceDatafromConversation.map((item) => ({
        itemId: item["Item ID"] || "",
        itemQuantity: parseInt(item["Quantity"] || "0"),
        itemDescription: item["Item Description"] || "",
        itemCost: parseFloat(item["Cost Per Unit"] || "0"),
      })); 

      // Extracting separate arrays for state updates
      const itemIds = itemsArray.map((item) => item.itemId);
      const itemQuantities = itemsArray.map((item) => item.itemQuantity);
      const itemCosts = itemsArray.map((item) => item.itemCost);
      const itemDescriptions = itemsArray.map((item) => item.itemDescription);
      const tempDictionary = {};

      itemsArray.forEach((item) => {
        tempDictionary[item.itemId] = {
          itemQuantity: item.itemQuantity || 0,
          itemCost: item.itemCost || 0,
          // itemDescription: item.itemDescription || "",
        };
      });
      const newItems = Object.keys(tempDictionary).map((itemId) => ({
        itemId,
        itemQuantity: tempDictionary[itemId].itemQuantity,
        itemCost: tempDictionary[itemId].itemCost,
        itemDescription: `Item ${itemId}`,
        // itemDescription: tempDictionary[itemId].itemDescription,
      }));
      console.log(
        "item array,tempdict,newitems: ",
        itemsArray,
        tempDictionary,
        newItems
      );
      // Merge updates and new items
      // value.setPurchaseItemDetails([...newItems]);
      value.setPurchaseItemDetails([...newItems]);
    },
    [value.purchaseItemDetails, value.invoiceDatafromConversation]
  );

  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject) => {
      let updatedPurchaseOrderData = { ...value.purchaseOrderData };
      let supplierStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        console.log("Obect  : ", invoiceObject);
        if (invoiceObject[key] !== null) {
          switch (key) {
            // case "PO Number":
            //   updatedPurchaseOrderData.poNumber = invoiceObject[key];
            //   break;
            case "Estimated Delivery Date":
              updatedPurchaseOrderData.estDeliveryDate = formatDate(
                invoiceObject[key]
              );
              break;
            case "Total Quantity":
              updatedPurchaseOrderData.totalQuantity = invoiceObject[key];
              break;
            case "Total Cost":
              updatedPurchaseOrderData.totalCost = invoiceObject[key];
              break;
            case "Total Tax":
              updatedPurchaseOrderData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedPurchaseOrderData.items = invoiceObject[key];
              updateItemDetails(invoiceObject[key]);
              break;
            case "Supplier ID":
              // updatedPurchaseOrderData.supplierId = invoiceObject[key];
              // supplierStatus = await getSupplierDetails(invoiceObject[key]); // Get true/false status
              // console.log("Supplier Status:", supplierStatus);
              // break;
              supplierStatus = await getSupplierDetails(invoiceObject[key]); // Wait for the update
            // await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for state update
            // console.log("Updated Supplier ID (After Await):", value.supplierDetails.supplierId);
            // break;
          }
        }
      }
      dispatch({
        type: "UPDATE_PO_DATA",
        payload: updatedPurchaseOrderData,
      });

      console.log("Final Invoice Data:  ", updatedPurchaseOrderData);
      return supplierStatus; // Return true or false for further processing
    },
    [
      getSupplierDetails,
      updateItemDetails,
      purchaseOrderData,
      value.supplierDetails,
    ]
  );
  //API CALLS
  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;
    setMessages((prevMessages) => {
      const newMessages = inputFromUpload
        ? [...prevMessages] // Do not add any new message for inputFromUpload
        : [...prevMessages, { text: input, fromUser: true }];

      if (!inputFromUpload) {
        setInput(""); // Clear input if it's not from an upload
      }
      return newMessages;
    });
    setInput("");
    value.setModalDetails({
      visible: false,
      text: "",
      isSuccessful: true,
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/chat", // API endpoint
        {
          user_id: "admin", // The user_id value
          message: input, // The message value
        },
        {
          headers: { "Content-Type": "application/json" }, // Content-Type header
        }
      );
      const uploadText =
        "Here is what I could extract from the uploaded document: \n";
      if (response.status === 200 || response.status === 201) {
        const invoiceCheckStatus = await invoiceCheck2(response.data.po_json);
        console.log("Inv check status: ", invoiceCheckStatus);
        value.setPurchaseOrderApiRes(response.data);
        console.log("Data response", response.data);
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        console.log(
          "response.data.po_json",
          response.data.po_json["Supplier ID"]
        );
        if (
          // value.supplierDetails.supplierId === "" &&
          (response.data.po_json["Supplier ID"] === undefined ||
            response.data.po_json["Supplier ID"] === ""||response.data.po_json["Supplier ID"] === null)
        ) {
          console.log("Empty Supplier Id");
          const formattedConversation = response.data.chat_history["admin"]
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          console.log(
            "Submission Status inside HMS",
            response.data.submissionStatus
          );
          if (response.data.submissionStatus == "submitted") {
            // let newPoCounter=value.PoCounter+1
            // value.setPoCounter(newPoCounter);
            // value.setPoCounterId(`PO${newPoCounter}`);
            value.setPoCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const formattedConversation = response.data.chat_history["admin"]
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            console.log(
              "Submission Status inside HMS",
              response.data.submissionStatus
            );
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedConversation, fromUser: false },
            ]);
            if (response.data.submissionStatus == "submitted") {
              // let newPoCounter=value.PoCounter+1
              // value.setPoCounter(newPoCounter);
              // value.setPoCounterId(`PO${newPoCounter}`);
              value.setPoCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
              // }
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.purchaseItemDetails.map((item) => ({
        ...item,
        poId: value.poCounterId,
        supplierId: value.supplierDetails.supplierId,
        totalItemCost:
          parseFloat(item.itemCost) * parseFloat(item.itemQuantity),
      }));
      console.log("updated invoice items: ", updatedInvoiceItems);

      const response = await axios({
        method: "post",
        url: `http://localhost:8000/poDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      setPdfCardVisible(true);
      value.setModalDetails({
        visible: true,
        text: "PO Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating PO",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating PO", fromUser: false },
      ]);
      console.log("PO DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    console.log("Invoice Header Creation");
    const poData = {
      // "poNumber": "string",
      // "leadTime": 0,
      // "totalQuantity": 0,
      // "totalCost": 0,
      // "totalTax": 0,
      ...purchaseOrderData,
      leadTime: value.supplierDetails.leadTime,
      estimatedDeliveryDate: purchaseOrderData.estDeliveryDate,
      shipByDate: "2025-02-10",
      payment_term: "string",
      currency: "string",
      poNumber: value.poCounterId,
    };
    console.log("PO data:", poData);
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/poCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: poData,
      });
      // console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      let poFileDetals = { poStatus: true, poNumber: value.poCounterId };
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Purchase Order ID: " + value.poCounterId}
              poFile={poFileDetals}
            />
          ),
          fromUser: false,
          isFile: true,
        },
      ]);

      // value.setModalText("Invoice created successfully!");
      await clearDataApi();

      // Set pdfCardVisible to true to ensure it stays visible
      setPdfCardVisible(false);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Purchase Order",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating PO", fromUser: false },
      ]);
      console.log("PO Creation Error:", error, error.data);
    }
  };

  // const formatInvoice = (jsonData) => {
  //   console.log("JSON data: ", jsonData.date);
  //   let modifiedDate = "";
  //   try {
  //     const dateObject = new Date(jsonData.date);
  //     if (!isNaN(dateObject)) {
  //       modifiedDate =
  //         `${(dateObject.getMonth() + 1).toString().padStart(2, "0")}/` +
  //         `${dateObject.getDate().toString().padStart(2, "0")}/` +
  //         `${dateObject.getFullYear()}`;
  //     } else {
  //       console.log("Invalid date");
  //     }
  //   } catch (error) {
  //     console.log("Error parsing date:", error);
  //   }

  //   const modifiedJsonData = { ...jsonData, date: modifiedDate };
  //   console.log("mod", modifiedJsonData);
  //   return Object.entries(jsonData)
  //     .map(
  //       ([key, value]) =>
  //         `${key
  //           .replace(/_/g, " ") // Replace underscores with spaces
  //           .replace(/\b\w/g, (char) => char.toUpperCase())}: ${value ?? "N/A"}`
  //     )
  //     .join("\n");
  // };
  const formatInvoice = (jsonData) => {
    console.log("JSON data: ", jsonData.date);
    let modifiedDate = "";

    // Format the date field
    try {
      const dateObject = new Date(jsonData.date);
      if (!isNaN(dateObject)) {
        modifiedDate =
          `${(dateObject.getMonth() + 1).toString().padStart(2, "0")}/` +
          `${dateObject.getDate().toString().padStart(2, "0")}/` +
          `${dateObject.getFullYear()}`;
      } else {
        console.log("Invalid date");
      }
    } catch (error) {
      console.log("Error parsing date:", error);
    }

    // Update the date field in JSON
    const modifiedJsonData = { ...jsonData, date: modifiedDate };

    return Object.entries(modifiedJsonData)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle arrays (e.g., Items array)
          return (
            `${key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}:\n` +
            value
              .map(
                (item, index) =>
                  `  ${index + 1}. ` +
                  Object.entries(item)
                    .map(
                      ([subKey, subValue]) =>
                        `${subKey
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}: ${
                          subValue ?? "N/A"
                        }`
                    )
                    .join(", ")
              )
              .join("\n")
          );
        } else {
          // Handle normal key-value pairs
          return `${key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}: ${
            value ?? "N/A"
          }`;
        }
      })
      .join("\n");
  };

  const uploadInvoice = async (event) => {
    let file = event.target.files[0];
    console.log("Event:", event.target.files);
    const formData = new FormData();
    formData.append("file", file);
    let fileDetails = {
      status: true,
      name: file?.name,
      file: file,
    };
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/uploadPo/`,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });
      console.log("upload response: ", response.data);
      if (response.status === 200 || response.status === 201) {
        // await clearDataApi();
        //PDF VIEW
        if (file && file.type === "application/pdf") {
          value.setUploadedFile(fileDetails);

          // value.setModalText("Invoice uploaded successfully!");
          value.setModalDetails({
            visible: true,
            text: "Invoice uploaded successfully!",
            isSuccessful: true,
          });

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              component: <PdfCard uploadedFile={fileDetails} />,
              fromUser: true,
              isFile: true,
            },
          ]);
          await handleMessageSubmit(
            formatInvoice(response.data.structured_data),
            true
          );
        } else {
          alert("Please upload a valid PDF file.");
          await clearDataApi();
        }
      }
    } catch (error) {
      console.log("Upload Error:", error, error.data);
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
    }
  };
  //clear data
  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      // console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      // console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      // console.log("Invoice Clear Error:", error, error.data);
    }
  };
  console.log("checkConsole", value);
  return (
    <Sheet
      className="imageBackground"
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFAF3",
        overflowY: "auto",
        flexGrow: 1,
      }}
      ref={messageEl}
    >
      <Box
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column ",
          padding: 2,
          justifyContent: "flex-end",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.fromUser ? "user-message" : "bot-message"}
          >
            <ChatMessage
              key={index}
              text={message.text ? message.text : message.component}
              fromUser={message.fromUser}
              // isFile={pdfCardVisible}
              isFile={message.isFile}
            />
          </div>
        ))}
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSubmit(input);
        }}
        id="form1"
        className="chatbot-input-form"
      >
        <label className="paneIcon">
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => uploadInvoice(e)}
            onClick={(event) => (event.target.value = "")}
          />
          <Add className="paneIcon" />
        </label>
        <Smiley
          className="paneIcon"
          onClick={() => setPickerVisible(!isPickerVisible)} // Toggle emoji picker visibility
        />
        <input
          id="inputValue"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            e.preventDefault();
            setInput(e.target.value);
          }}
          style={{ margin: "0.5rem", height: "2rem" }}
        />
        <SendIcon
          className="paneIcon"
          onClick={() => handleMessageSubmit(input)}
        />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
      {isPickerVisible && (
        <div
          style={{ position: "absolute", zIndex: 1000, bottom: "4rem" }}
          ref={pickerRef}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </Sheet>
  );
}

//08-03-2025
const handleMessageSubmit = async (input, inputFromUpload) => {
  if (!input.trim()) return;
  setMessages((prevMessages) => {
    const newMessages = inputFromUpload
      ? [...prevMessages] // Do not add any new message for inputFromUpload
      : [...prevMessages, { text: input, fromUser: true }];

    if (!inputFromUpload) {
      setInput(""); // Clear input if it's not from an upload
    }
    return newMessages;
  });
  setInput("");
  try {
    const response = await axios.post(
      "http://localhost:8000/chat", // API endpoint
      { 
        user_id: "string", // The user_id value
        message: input, // The message value
      },
      {
        headers: { "Content-Type": "application/json" }, // Content-Type header
      }
    );
    const uploadText =
      "Here is what I could extract from the uploaded document: \n";
    if (response.status === 200 || response.status === 201) {
      const invoiceCheckStatus = await invoiceCheck2(response.data.po_json);
      console.log("Inv check status: ", invoiceCheckStatus);
      value.setPurchaseOrderApiRes(response.data);
      console.log("Data response", response.data);
      const uploadText =
        "Here is what I could extract from the uploaded document: \n";
      if (value.supplierDetails.supplierId === "") {
        const formattedConversation = response.data.chat_history["string"]
          .slice(-1)
          .map((text, index) => (
            <ReactMarkdown key={index} className={"botText"}>
              {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
            </ReactMarkdown>
          ));
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: formattedConversation, fromUser: false },
        ]);
        // }
        if (response.data.submission_status == "submitted") {
          value.setPoCounter((prevCounter) => prevCounter + 1);
          await invoiceHeaderCreation();
          // }
        } else {
          value.setModalVisible(false);
        }
      } else {
        if (invoiceCheckStatus) {
          const formattedConversation = response.data.chat_history["string"]
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          if (response.data.submission_status == "submitted") {
            value.setPoCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
        }
      }
    }

    if (response.data.test_model_reply === "Creation") {
      value.setIsActive(true);
    } else if (response.data.test_model_reply === "Fetch") {
      value.setIsActive(false);
      // await getInvoiceDetails("INV498");
    } else if (response.data.submission_status === "submitted") {
      value.setIsActive(false);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
//create invoice details
const invoiceDetailsCreation = async () => {
  try {
    const updatedInvoiceItems = value.purchaseItemDetails.map((item) => ({
      ...item,
      poId: value.poCounterId,
      supplierId: value.supplierDetails.supplierId,
      totalItemCost: purchaseOrderData.totalCost,
    }));

    const response = await axios({
      method: "post",
      url: `http://localhost:8000/poDetailsAdd/`,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      data: updatedInvoiceItems,
    });
    setPdfCardVisible(true);
    value.setModalDetails({
      visible: true,
      text: "PO Created Successfully",
      isSuccessful: true,
    });

    // console.log("invoice Details Creation Response:", response.data);
  } catch (error) {
    value.setModalDetails({
      visible: true,
      text: "An Error occured while creating PO",
      isSuccessful: false,
    });
    setMessages([
      ...messages,
      { text: "An Error occured while creating PO", fromUser: false },
    ]);
    console.log("PO DEtails Creation Error:", error, error.data);
  }
};
//create invoice header
const invoiceHeaderCreation = async () => {
  const poData = {
    // "poNumber": "string",
    // "leadTime": 0,
    // "totalQuantity": 0,
    // "totalCost": 0,
    // "totalTax": 0,
    ...purchaseOrderData,
    leadTime: value.supplierDetails.leadTime,
    estimatedDeliveryDate: purchaseOrderData.estDeliveryDate,
    shipByDate: "2025-02-10",
    payment_term: "string",
    currency: "string",
  };

  try {
    const response = await axios({
      method: "post",
      url: `http://localhost:8000/poCreation/`,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      data: poData,
    });
    // console.log("invoice Creation Response:", response.data);
    await invoiceDetailsCreation();
    setPdfData(value);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        component: (
          <PdfCard
            title={"Invoice Number: " + value.invoiceData.userInvNo}
            invoiceID={value.invoiceData.userInvNo}
            systemDocId={value.systemDocumentId}
          />
        ),
        fromUser: false,
        isFile: true,
      },
    ]);

    // value.setModalText("Invoice created successfully!");
    await clearDataApi();

    // Set pdfCardVisible to true to ensure it stays visible
    setPdfCardVisible(false);
  } catch (error) {
    value.setModalDetails({
      visible: true,
      text: "An Error occured while creating Purchase Order",
      isSuccessful: false,
    });
    setMessages([
      ...messages,
      { text: "An Error occured while creating PO", fromUser: false },
    ]);
    console.log("PO Creation Error:", error, error.data);
  }
};


import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import ChatMessage from "./ChatMessage";
import "../styles/chatbot.css";
import "../styles/general.css";
import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
import Add from "@mui/icons-material/AddCircle";
import SendIcon from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import bgImage from "../images/bgImage.png";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";
import axios from "axios";
import { StyledModalRoot } from "@mui/joy/Modal/Modal";
import PdfCard from "./PDF Generation/PdfCard";
import ReactMarkdown from "react-markdown";
import "../styles/chatbot.css";
import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
// import { Picker } from "emoji-mart";
// import "emoji-mart/css/emoji-mart.css";
// import data from '@emoji-mart/data'
// import { init } from 'emoji-mart'

// init({ data })
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function POChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [invoiceCostArray, setInvoiceCostArray] = useState();
  const [pdfData, setPdfData] = useState();
  const { input, setInput } = value;
  const prevPoDetailsDataRef = useRef(value.poDetailsData);
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const messageEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef(null);
  const { purchaseOrderData, dispatch } = useContext(AuthContext);
  //FORM ACTIONS
  //save
  const saveFormData = async () => {
    value.setItemDetails(value.itemDetailsInput);
    const getTrueValueKey = (obj) => {
      return Object.keys(obj).find((key) => obj[key] === true);
    };
    const itemsPresent = Object.values(value.itemDetailsInput.items).length > 0;
    const quantitiesPresent =
      Object.values(value.itemDetailsInput.quantity).length > 0;

    const trueValueKey = getTrueValueKey(value.typeOfInvoice);
    const filteredItems =
      itemsPresent &&
      value.itemDetailsInput.items.filter((item, index) => {
        const matchingPoDetail = value.poDetailsData.find(
          (poItem) => poItem.itemId === item
        );
        return matchingPoDetail !== undefined;
      });

    const filteredQuantities =
      quantitiesPresent &&
      value.itemDetailsInput.quantity.filter((quantity, index) => {
        const matchingPoDetail = value.poDetailsData.find(
          (poItem) => poItem.itemId === value.itemDetailsInput.items[index]
        );
        return matchingPoDetail !== undefined;
      });
    let savedData = `
    ${trueValueKey ? `Type of Invoice: ${trueValueKey},` : ""}
    ${
      value.invoiceData.invoiceDate
        ? `Date: ${value.invoiceData.invoiceDate},`
        : ""
    }
    ${
      value.invoiceData.poNumber
        ? `PO number: ${value.invoiceData.poNumber},`
        : ""
    }
    ${
      value.invoiceData.supplierId
        ? `Supplier Id: ${value.invoiceData.supplierId},`
        : ""
    }
    ${
      value.invoiceData.totalAmount
        ? `Total amount: ${value.invoiceData.totalAmount},`
        : ""
    }
    ${
      value.invoiceData.totalTax
        ? `Total tax: ${value.invoiceData.totalTax},`
        : ""
    }
    ${
      // value.itemDetailsInput.items
      itemsPresent
        ? `Items: ${filteredItems},`
        : // ? `Items: ${value.itemDetailsInput.items},`
          ""
    }
    ${
      // value.itemDetailsInput.quantity
      quantitiesPresent ? `Quantity: ${filteredQuantities}` : ""
    }
    `;
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  //submit
  useEffect(() => {
    value.setPoCounterId(`PO${value.poCounter}`);
    dispatch({
      type: "UPDATE_FIELD",
      field: "poNumber",
      value: `PO${value.poCounter}`,
    });
  }, [value.poCounter]);
  // console.log("PO counter: ",value)
  const submitFormData = async () => {
    // await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);
    // await invoiceHeaderCreation();
    // value.setPoCounter((prevCounter) => {
    //   const numericPart = parseInt(prevCounter.replace("PO", ""), 10);
    //   return `PO${numericPart + 1}`;
    // });
    value.setPoCounter((prevCounter) => prevCounter + 1);
    // value.setPoCounter((prevCounter) => {
    //   const newCounter = prevCounter + 1; // Increment the counter
    //   value.setPoCounterId(`PO${newCounter}`); // Immediately update PO ID
    //   dispatch({
    //     type: "UPDATE_FIELD",
    //     field: "poNumber",
    //     value: `PO${newCounter}`,
    //   });
    //   return newCounter;
    // });
  };
  //clear
  const clearFormData = () => {
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      userInvNo: "",
    });
    // getSupplierDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      totalCost: "",
      exchangeRate: "",
    });

    value.setTypeOfInvoice({
      merchandise: false,
      nonMerchandise: false,
      debitNote: false,
      creditNote: false,
    });
    value.setItemDetails({
      items: "",
      quantity: "",
      invoiceCost: "",
    });
    value.setItemDetailsInput({
      items: "",
      quantity: "",
      invoiceCost: "",
    });
    value.setinvoiceDatafromConversation({});
  };
  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);
  //SCROLLING FUNCTIONALITY
  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  //EMOJI PICKER
  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji.native);
    setPickerVisible(false);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!pickerRef.current?.contains(e.target)) setPickerVisible(false);
    };
    if (isPickerVisible)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPickerVisible]);
  //DATE FORMATTING
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date,returning date as it is", date);
      return date;
    }
  }
  //TYPE OF INVOICE
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
  const typeSelection = useCallback(
    (invoiceDatafromConversation) => {
      const invoiceVal = invoiceDatafromConversation;
      const invoiceValFromJson = value.invoiceData.invoiceType;
      let newTypeOfInvoice = {
        nonMerchandise: false,
        merchandise: false,
        creditNote: false,
        debitNote: false,
      };
      if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
        const invoiceType = invoiceVal["invoice type"];
        // const invoiceType = invoiceVal["invoiceType"];
        if (invoiceType) {
          const match = invoiceType.match(regexPattern);
          if (match) {
            const [_, nonMerchandise, merchandise, creditNote, debitNote] =
              match;
            newTypeOfInvoice = {
              nonMerchandise: !!nonMerchandise,
              merchandise: !!merchandise,
              creditNote: !!creditNote,
              debitNote: !!debitNote,
            };
          }
        }
        // Only update the state if it's different from the current state
        if (
          JSON.stringify(newTypeOfInvoice) !==
          JSON.stringify(value.typeOfInvoice)
        ) {
          value.setTypeOfInvoice(newTypeOfInvoice);
        }
      }
      if (value.invoiceData.invoiceType) {
        if (value.invoiceData.invoiceType) {
          const match = value.invoiceData.invoiceType.match(regexPattern);
          if (match) {
            const [_, nonMerchandise, merchandise, creditNote, debitNote] =
              match;
            value.setTypeOfInvoice({
              nonMerchandise: !!nonMerchandise,
              merchandise: !!merchandise,
              creditNote: !!creditNote,
              debitNote: !!debitNote,
            });
          } else {
            value.setTypeOfInvoice({
              nonMerchandise: false,
              merchandise: false,
              creditNote: false,
              debitNote: false,
            });
          }
        }
      }
    },
    [value.invoiceDatafromConversation, value.invoiceData.invoiceType]
  );
  //SUM OF QUANTITIES
  function sumQuantities(input) {
    if (!input) return input;

    const quantitiesArray = Array.isArray(input)
      ? input
      : input.split(",").map((num) => parseInt(num.trim(), 10));

    return quantitiesArray.reduce((sum, current) => sum + current, 0);
  }
  //PO DETAILS
  // const getSupplierDetails = useCallback(
  //   async (id) => {
  //     if (prevIdRef.current && prevIdRef.current !== id) {
  //       console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
  //       const resetFieldsPayload = {
  //         ...purchaseOrderData, // Preserve existing fields
  //         supplierId: "", // Reset supplierId
  //         leadTime: "", // Reset leadTime
  //       };
  //       dispatch({
  //         type: "UPDATE_PO_DATA",
  //         payload: resetFieldsPayload, // Dispatch to update the state with reset fields
  //       });
  //     }
  //     prevIdRef.current = id; // Update the previous ID
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8000/suppliers/${id}`
  //       );
  //       if (response.status === 200 || response.status === 201) {
  //         // const updatedPayload = {
  //         //   ...purchaseOrderData,
  //         //   leadTime: response.data.lead_time, // Add leadTime fetched from API
  //         // };

  //         // dispatch({
  //         //   type: "UPDATE_FIELD",
  //         //   payload: updatedPayload, // Dispatch the updated state
  //         // });
  //         console.log("Supplier Response: ", response.data,response.data.lead_time,);
  //         // dispatch({
  //         //   type: "UPDATE_FIELD",
  //         //   field: "leadTime",
  //         //   value:response.data.lead_time,
  //         // });
  //         const errorPayload = {
  //           ...purchaseOrderData,
  //           supplierId: id, // Reset the supplierId
  //           leadTime: response.data.lead_time, // Reset the leadTime
  //         };
  //         dispatch({
  //           type: "UPDATE_PO_DATA",
  //           payload: errorPayload, // Dispatch the error state update
  //         });
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } catch (error) {
  //       const errorPayload = {
  //         ...purchaseOrderData,
  //         supplierId: "", // Reset the supplierId
  //         leadTime: "", // Reset the leadTime
  //       };

  //       dispatch({
  //         type: "UPDATE_PO_DATA",
  //         payload: errorPayload, // Dispatch the error state update
  //       });
  //       console.error("Error fetching Supplier details:", error);
  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         {
  //           text: "Sorry, we couldn't find this Supplier Id in our database, please try another Supplier Id",
  //           fromUser: false,
  //         },
  //       ]);
  //       return false;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [value.invoiceDatafromConversation]
  // );
  const getSupplierDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        // dispatch({
        //   type: "UPDATE_PO_DATA",
        //   payload: {
        //     ...purchaseOrderData,
        //     supplierId: "",
        //     leadTime: "",
        //   },
        // });
        value.setSupplierDetails({
          apiResponse: "",
          supplierId: "",
          leadTime: "",
        });
      }
      prevIdRef.current = id;

      try {
        const response = await axios.get(
          `http://localhost:8000/suppliers/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          console.log(
            "Supplier Response: ",
            response.data,
            response.data.lead_time
          );

          // Dispatch state update
          // dispatch({
          //   type: "UPDATE_PO_DATA",
          //   payload: {
          //     ...purchaseOrderData,
          //     supplierId: id,
          //     leadTime: response.data.lead_time,
          //   },
          // });
          value.setSupplierDetails({
            apiResponse: response.data,
            supplierId: id,
            leadTime: response.data.lead_time,
          });

          return true; // Return boolean for further processing
        } else {
          return false;
        }
      } catch (error) {
        // dispatch({
        //   type: "UPDATE_PO_DATA",
        //   payload: {
        //     ...purchaseOrderData,
        //     supplierId: "",
        //     leadTime: "",
        //   },
        // });
        value.setSupplierDetails({
          apiResponse: "",
          supplierId: "",
          leadTime: "",
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Supplier Id in our database, please try another Supplier Id",
            fromUser: false,
          },
        ]);
        console.error("Error fetching Supplier details:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.supplierDetails]
  );

  //GET INV DETAILS
  const handleRadioChange = (type) => {
    value.setTypeOfInvoice({
      merchandise: type === "merchandise",
      nonMerchandise: type === "nonMerchandise",
      debitNote: type === "debitNote",
      creditNote: type === "creditNote",
    });
  };
  const getInvoiceDetails = useCallback(
    async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:8000/invoiceDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          console.log("Get invoice response", response.data);
          value.setPoDetailsData(response.data.inv_details);
          value.setPoHeaderData({
            ...value.poHeaderData,
            currency: response.data.inv_header.currency,
            paymentTerm: response.data.inv_header.payment_term,
            invoiceNo: response.data.inv_header.invoiceId,
            totalCost: response.data.inv_header.total_cost,
            // exchangeRate:  response.data.inv_header.invoicedate,
          });
          let poNumber = response.data.inv_details.map((item) => item.poId);
          // const poId = new Set(response.data.inv_details.map((item)=>item.poId))

          // let p=[...poId]
          // console.log("PO ID: ",...poId,"P",p)
          console.log(response.data.inv_details.map((item) => item.poId));
          handleRadioChange(response.data.inv_header.invoiceType);
          console.log(response.data.inv_header.invoiceType);
          // value.setTypeOfInvoice(response.data.inv_header.invoiceType)
          value.setItemDetails({
            ...value.itemDetails,
            quantity: response.data.inv_header.total_qty,
          });
          value.setInvoiceData({
            ...value.invoiceData,
            invoiceType: response.data.inv_header.invoiceType, //not updating
            invoiceDate: response.data.inv_header.invoicedate,
            poNumber: poNumber[0],
            totalAmount: response.data.inv_header.total_amount,
            totalTax: response.data.inv_header.total_tax,
            // items: "",
            // quantity: "",
            supplierId: response.data.inv_header.supplierId,
          });
        } else {
          // return false;
          console.log("Error fetching invoice details:");
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching invoice details:", error);
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   {
        //     text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
        //     fromUser: false,
        //   },
        // ]);
        // return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
  );

  //ITEM AND QUANTITY UPDATES

  const itemQuantityValidation = async () => {
    //if po items and given items do not match set custom message. and return true if validated and false if not.
    let itemsMismatchMsg = `The items provided: ${itemsArray} do not match the items retrieved by the PO: ${value.itemListPo}. Please review the items again.`;
    let qtyMismatchMsg = `The quantity length ${quantitiesArray}  (${quantitiesArray?.length} items) does not match the number of items ${value.itemListPo} (${value.itemListPo.length} items). Please review and ensure the quantities and items are properly aligned.`;
    console.log(
      "items array: ",
      itemsArray,
      "List from PO",
      value.itemListPo,
      "types: ",
      typeof itemsArray,
      typeof value.itemListPo
    );
    if (JSON.stringify(value.itemListPo) !== JSON.stringify(itemsArray)) {
      setMessages([...messages, { text: itemsMismatchMsg, fromUser: false }]);

      return false;
    } else if (quantitiesArray?.length != value.itemListPo.length) {
      setMessages([...messages, { text: qtyMismatchMsg, fromUser: false }]);
      return false;
    } else {
      return true;
    }

    //check for single items.
  };
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (!invoiceDatafromConversation) {
        console.log("Nothing");
        return;
      }
      console.log("Here");

      const itemsArray = invoiceDatafromConversation.map((item) => ({
        itemId: item["Item ID"] || "",
        itemQuantity: parseInt(item["Quantity"] || "0"),
        itemDescription: item["Item Description"] || "",
        itemCost: parseFloat(item["Cost per Unit"] || "0"),
      }));

      // Extracting separate arrays for state updates
      const itemIds = itemsArray.map((item) => item.itemId);
      const itemQuantities = itemsArray.map((item) => item.itemQuantity);
      const itemCosts = itemsArray.map((item) => item.itemCost);
      const itemDescriptions = itemsArray.map((item) => item.itemDescription);
      const tempDictionary = {};

      itemsArray.forEach((item) => {
        tempDictionary[item.itemId] = {
          itemQuantity: item.itemQuantity || 0,
          itemCost: item.itemCost || 0,
          // itemDescription: item.itemDescription || "",
        };
      });
      const newItems = Object.keys(tempDictionary).map((itemId) => ({
        itemId,
        itemQuantity: tempDictionary[itemId].itemQuantity,
        itemCost: tempDictionary[itemId].itemCost,
        itemDescription: `Item ${itemId}`,
        // itemDescription: tempDictionary[itemId].itemDescription,
      }));
      console.log(
        "item array,tempdict,newitems: ",
        itemsArray,
        tempDictionary,
        newItems
      );
      // Merge updates and new items
      // value.setPurchaseItemDetails([...newItems]);
      value.setPurchaseItemDetails((prev) => [...prev, ...newItems])
    },
    [value.purchaseItemDetails, value.invoiceDatafromConversation]
  );

 

  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedPurchaseOrderData = { ...value.purchaseOrderData };
      let supplierStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        console.log("Obect  : ",invoiceObject)
        if (invoiceObject[key] !== null) {
          switch (key) {
            // case "PO Number":
            //   updatedPurchaseOrderData.poNumber = invoiceObject[key];
            //   break;
            case "Estimated Delivery Date":
              updatedPurchaseOrderData.estDeliveryDate = formatDate(
                invoiceObject[key]
              );
              break;
            case "Total Quantity":
              updatedPurchaseOrderData.totalQuantity = invoiceObject[key];
              break;
            case "Total Cost":
              updatedPurchaseOrderData.totalCost = invoiceObject[key];
              break;
            case "Total Tax":
              updatedPurchaseOrderData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedPurchaseOrderData.items = invoiceObject[key];
              updateItemDetails(invoiceObject[key]);
              break;
            case "Supplier ID":
              // updatedPurchaseOrderData.supplierId = invoiceObject[key];
              supplierStatus = await getSupplierDetails(invoiceObject[key]); // Get true/false status
              console.log("Supplier Status:", supplierStatus);
              // break;
          }
        }
      }
      dispatch({
        type: "UPDATE_PO_DATA",
        payload: updatedPurchaseOrderData,
      });

      console.log("Final Invoice Data:  ", updatedPurchaseOrderData);
      return supplierStatus; // Return true or false for further processing
    },
    [getSupplierDetails, updateItemDetails, purchaseOrderData,value.supplierDetails]
  );

  //API CALLS
  //user input

  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;
    setMessages((prevMessages) => {
      const newMessages = inputFromUpload
        ? [...prevMessages] // Do not add any new message for inputFromUpload
        : [...prevMessages, { text: input, fromUser: true }];

      if (!inputFromUpload) {
        setInput(""); // Clear input if it's not from an upload
      }
      return newMessages;
    });
    setInput("");
    try {
      const response = await axios.post(
        "http://localhost:8000/chat", // API endpoint
        { 
          user_id: "string", // The user_id value
          message: input, // The message value
        },
        {
          headers: { "Content-Type": "application/json" }, // Content-Type header
        }
      );
      const uploadText =
        "Here is what I could extract from the uploaded document: \n";
      if (response.status === 200 || response.status === 201) {
        const invoiceCheckStatus = await invoiceCheck2(response.data.po_json);
        console.log("Inv check status: ", invoiceCheckStatus);
        value.setPurchaseOrderApiRes(response.data);
        console.log("Data response", response.data);
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        if (value.supplierDetails.supplierId === "") {
          const formattedConversation = response.data.chat_history["string"]
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submission_status == "submitted") {
            value.setPoCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const formattedConversation = response.data.chat_history["string"]
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedConversation, fromUser: false },
            ]);
            if (response.data.submission_status == "submitted") {
              value.setPoCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
              // }
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submission_status === "submitted") {
        value.setIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.purchaseItemDetails.map((item) => ({
        ...item,
        poId: value.poCounterId,
        supplierId: value.supplierDetails.supplierId,
        totalItemCost: purchaseOrderData.totalCost,
      }));

      const response = await axios({
        method: "post",
        url: `http://localhost:8000/poDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      setPdfCardVisible(true);
      value.setModalDetails({
        visible: true,
        text: "PO Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating PO",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating PO", fromUser: false },
      ]);
      console.log("PO DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    const poData = {
      // "poNumber": "string",
      // "leadTime": 0,
      // "totalQuantity": 0,
      // "totalCost": 0,
      // "totalTax": 0,
      ...purchaseOrderData,
      leadTime: value.supplierDetails.leadTime,
      estimatedDeliveryDate: purchaseOrderData.estDeliveryDate,
      shipByDate: "2025-02-10",
      payment_term: "string",
      currency: "string",
    };

    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/poCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: poData,
      });
      // console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Invoice Number: " + value.invoiceData.userInvNo}
              invoiceID={value.invoiceData.userInvNo}
              systemDocId={value.systemDocumentId}
            />
          ),
          fromUser: false,
          isFile: true,
        },
      ]);

      // value.setModalText("Invoice created successfully!");
      await clearDataApi();

      // Set pdfCardVisible to true to ensure it stays visible
      setPdfCardVisible(false);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Purchase Order",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating PO", fromUser: false },
      ]);
      console.log("PO Creation Error:", error, error.data);
    }
  };

  const formatInvoice = (jsonData) => {
    console.log("JSON data: ", jsonData.date);
    let modifiedDate = "";
    try {
      const dateObject = new Date(jsonData.date);
      if (!isNaN(dateObject)) {
        modifiedDate =
          `${(dateObject.getMonth() + 1).toString().padStart(2, "0")}/` +
          `${dateObject.getDate().toString().padStart(2, "0")}/` +
          `${dateObject.getFullYear()}`;
      } else {
        console.log("Invalid date");
      }
    } catch (error) {
      console.log("Error parsing date:", error);
    }

    const modifiedJsonData = { ...jsonData, date: modifiedDate };
    console.log("mod", modifiedJsonData);
    return Object.entries(jsonData)
      .map(
        ([key, value]) =>
          `${key
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase())}: ${value ?? "N/A"}`
      )
      .join("\n");
  };
  const uploadInvoice = async (event) => {
    let file = event.target.files[0];
    console.log("Event:", event.target.files);
    const formData = new FormData();
    formData.append("file", file);
    let fileDetails = {
      status: true,
      name: file?.name,
      file: file,
    };
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/upload/`,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });
      // const response = await axios.post(
      //   "http://localhost:8000/upload/",
      //   formData,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );
      console.log("upload response: ", response.data);
      if (response.status === 200 || response.status === 201) {
        // await clearDataApi();
        //PDF VIEW
        if (file && file.type === "application/pdf") {
          value.setUploadedFile(fileDetails);

          // value.setModalText("Invoice uploaded successfully!");
          value.setModalDetails({
            visible: true,
            text: "Invoice uploaded successfully!",
            isSuccessful: true,
          });

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              component: <PdfCard uploadedFile={fileDetails} />,
              fromUser: true,
              isFile: true,
            },
          ]);
          await handleMessageSubmit(
            formatInvoice(response.data.invoice_details),
            true
          );
        } else {
          alert("Please upload a valid PDF file.");
          await clearDataApi();
        }
      }
    } catch (error) {
      console.log("Upload Error:", error, error.data);
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
    }
  };
  //clear data
  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      // console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      // console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      // console.log("Invoice Clear Error:", error, error.data);
    }
  };
  // console.log("checkConsole  ", value);
  return (
    <Sheet
      className="imageBackground"
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFAF3",
        overflowY: "auto",
        flexGrow: 1,
      }}
      ref={messageEl}
    >
      <Box
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column ",
          padding: 2,
          justifyContent: "flex-end",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.fromUser ? "user-message" : "bot-message"}
          >
            <ChatMessage
              key={index}
              text={message.text ? message.text : message.component}
              fromUser={message.fromUser}
              // isFile={pdfCardVisible}
              isFile={message.isFile}
            />
          </div>
        ))}
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSubmit(input);
        }}
        id="form1"
        className="chatbot-input-form"
      >
        <label className="paneIcon">
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => uploadInvoice(e)}
            onClick={(event) => (event.target.value = "")}
          />
          <Add className="paneIcon" />
        </label>
        <Smiley
          className="paneIcon"
          onClick={() => setPickerVisible(!isPickerVisible)} // Toggle emoji picker visibility
        />
        <input
          id="inputValue"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            e.preventDefault();
            setInput(e.target.value);
          }}
          style={{ margin: "0.5rem", height: "2rem" }}
        />
        <SendIcon
          className="paneIcon"
          onClick={() => handleMessageSubmit(input)}
        />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
      {isPickerVisible && (
        <div
          style={{ position: "absolute", zIndex: 1000, bottom: "4rem" }}
          ref={pickerRef}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </Sheet>
  );
}
