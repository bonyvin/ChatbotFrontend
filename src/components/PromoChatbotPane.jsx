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
import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import TypingIndicatorComponent from "./TypingIndicatorComponent";
import MicIcon from "@mui/icons-material/Mic";
import ChatbotInputForm from "./ChatbotInputForm";

export default function PromoChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [invoiceCostArray, setInvoiceCostArray] = useState();
  const [pdfData, setPdfData] = useState();
  const { input, setInput } = value;
  const prevPoDetailsDataRef = useRef(value.poDetailsData);
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const messageEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  //FORM ACTIONS
  //save
  const saveFormData = async () => {
    const getTrueValueKey = (obj) => {
      return Object.keys(obj).find((key) => obj[key] === true);
    };
    let promotionType = getTrueValueKey(value.typeOfPromotion);
    let savedData = `
      ${promotionType ? `Promotion Type: ${promotionType},` : ""}

      ${
        value.promotionData.hierarchyType
          ? `Hierarchy Type: ${value.promotionData.hierarchyType},`
          : ""
      }
      ${
        value.promotionData.hierarchyValue
          ? `Hierarchy Value: ${value.promotionData.hierarchyValue},`
          : ""
      }
      ${
        value.promotionData.brand
          ? `Hierarchy Brand: ${value.promotionData.brand},`
          : ""
      }
      ${
        value.promotionData.itemList
          ? `Item List: ${value.promotionData.itemList},`
          : ""
      }
      ${
        value.promotionData.excludedItemList
          ? `Excluded Item List: ${value.promotionData.excludedItemList},`
          : ""
      }
      ${
        value.promotionData.discountType
          ? `Discount Type: ${value.promotionData.discountType},`
          : ""
      }
      ${
        value.promotionData.discountValue
          ? `Discount Value: ${value.promotionData.discountValue},`
          : ""
      }
      ${
        value.promotionData.startDate
          ? `Start Date: ${value.promotionData.startDate},`
          : ""
      }
      ${
        value.promotionData.endDate
          ? `End Date: ${value.promotionData.endDate},`
          : ""
      }
      ${
        value.promotionData.discountValue
          ? `Discount Value: ${value.promotionData.discountValue},`
          : ""
      }
      ${
        value.promotionData.locationList
          ? `Location List: ${value.promotionData.locationList},`
          : ""
      }
      ${
        value.promotionData.excludedLocationList
          ? `Excluded Location List: ${value.promotionData.excludedLocationList},`
          : ""
      }
     
    `;

    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  //submit
  useEffect(() => {
    value.setPromotionCounterId(`PROMO${value.promotionCounter}`);
  }, [value.promotionCounter]);
  const submitFormData = async () => {
    // await handleMessageSubmit("Please submit the data provided");
    await promotionHeaderCreation();
  };
  //clear
  const clearFormData = () => {
    value.setPromoTotalItemsArray([]);
    value.setTypeOfPromotion({
      simple: false,
      buyXGetY: false,
      threshold: false,
      giftWithPurchase: false,
    });
    value.setPromotionData({
      promotionType: "",
      hierarchyType: "",
      hierarchyValue: "",
      brand: "",
      itemList: [],
      excludedItemList: [],
      discountType: "",
      discountValue: "",
      startDate: "",
      endDate: "",
      locationList: [],
      excludedLocationList: [],
      totalItemsArray: [],
    });
    setTimeout(() => {
      value.setModalDetails({
        visible: false,
        text: "Data cleared",
        isSuccessful: false,
      });
    }, 10000);
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
  const prevItemUpload = useRef(value.itemUpload);
  const prevStoreUpload = useRef(value.storeUpload);

  useEffect(() => {
    const hasChanged =
      prevItemUpload.current.items !== value.itemUpload.items ||
      prevItemUpload.current.excludedItems !== value.itemUpload.excludedItems;

    const hasChangedStore =
      prevStoreUpload.current.stores != value.storeUpload.stores ||
      prevStoreUpload.current.excludedStores !=
        value.storeUpload.excludedStores;
    if (
      hasChanged &&
      (value.itemUpload.eventItems != null ||
        value.itemUpload.eventExcludedItems != null)
    ) {
      console.log("Here", { ...value.itemUpload });
      if (value.itemUpload.items) {
        uploadInvoice(value.itemUpload.eventItems);
      } else if (value.itemUpload.excludedItems) {
        uploadInvoice(value.itemUpload.eventExcludedItems);
      }

      prevItemUpload.current = value.itemUpload; // Update the reference to the latest itemUpload
    } else {
      console.log("Not");
    }
    if (
      hasChangedStore &&
      (value.storeUpload.eventStores != null ||
        value.storeUpload.eventExcludedStores != null)
    ) {
      console.log("Here", { ...value.storeUpload });
      if (value.storeUpload.stores) {
        uploadInvoice(value.storeUpload.eventStores);
      } else if (value.storeUpload.excludedStores) {
        uploadInvoice(value.storeUpload.eventExcludedStores);
      }
      prevStoreUpload.current = value.storeUpload;
    }
  }, [value.itemUpload, value.storeUpload]);
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
  const promotionTypeRegex =
    /(\bsimple\b)|(\bBuy\s+\d+\s*,\s*Get\s+\d+\b)|(\bthreshold\s+\d+\b)|(\bGWP\b|\bGift\s+with\s+Purchase\b)/i;

  const typeSelection = async (data) => {
    if (typeof data === "string") {
      const match = data.match(promotionTypeRegex);
      if (match) {
        const [_, simple, buyXGetY, threshold, giftWithPurchase] = match;

        const newTypeOfPromotion = {
          simple: !!simple,
          buyXGetY: !!buyXGetY,
          threshold: !!threshold,
          giftWithPurchase: !!giftWithPurchase,
        };

        console.log(newTypeOfPromotion);
        value.setTypeOfPromotion(newTypeOfPromotion);
      }
    }
  };
  // console.log("Type select:",typeSelection("Simple"))
  //EXTRACTING FIELD DATA FROM BACKEND
  const promotionCheck = useCallback(
    async (invoiceObject) => {
      let updatedPromotionData = { ...value.promotionData };
      let supplierStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        console.log("Obect  : ", invoiceObject);
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "Hierarchy Type":
              updatedPromotionData.hierarchyType = invoiceObject[key];
              break;
            case "Hierarchy Value":
              updatedPromotionData.hierarchyValue = invoiceObject[key];
              break;
            case "Brand":
              updatedPromotionData.brand = invoiceObject[key];
              break;
            case "Items":
              // Check if the value is an array, if not, convert it to one
              updatedPromotionData.itemList = Array.isArray(invoiceObject[key])
                ? invoiceObject[key]
                : [invoiceObject[key]];
              break;

            case "Excluded Items":
              // Check if the value is an array, if not, convert it to one
              updatedPromotionData.excludedItemList = Array.isArray(
                invoiceObject[key]
              )
                ? invoiceObject[key]
                : [invoiceObject[key]];
              break;
            case "Discount Type":
              updatedPromotionData.discountType = invoiceObject[key];
              break;
            case "Discount Value":
              updatedPromotionData.discountValue = invoiceObject[key];
              break;
            case "Start Date":
              updatedPromotionData.startDate = formatDate(invoiceObject[key]);
              break;
            case "End Date":
              updatedPromotionData.endDate = formatDate(invoiceObject[key]);
              break;
            case "Stores":
              updatedPromotionData.locationList = Array.isArray(
                invoiceObject[key]
              )
                ? invoiceObject[key]
                : [invoiceObject[key]];
              break;
            case "Excluded Stores":
              updatedPromotionData.excludedLocationList = Array.isArray(
                invoiceObject[key]
              )
                ? invoiceObject[key]
                : [invoiceObject[key]];
              break;
            case "Promotion Type":
              updatedPromotionData.promotionType = invoiceObject[key];
              await typeSelection(invoiceObject[key]);
              console.log("Type Selection parameter: ", invoiceObject[key]);
              break;
            // case "Supplier ID":
            //   supplierStatus = await getSupplierDetails(invoiceObject[key]); // Wait for the update
          }
        }
      }
      //   dispatch({
      //     type: "UPDATE_PO_DATA",
      //     payload: updatedPromotionData,
      //   });
      value.setPromotionData(updatedPromotionData);
      console.log("Final Invoice Data:  ", updatedPromotionData);
      return true; // Return true or false for further processing
      //   return supplierStatus; // Return true or false for further processing
    },
    [
      //   updateItemDetails,
      // purchaseOrderData,
      value.promotionData,
    ]
  );
  //API CALLS
  const handleMessageSubmit = async (input, inputFromUpload) => {
    console.log("Input: ", input);
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
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(true);
    }, 1500);
    try {
      const response = await axios.post(
        "http://localhost:8000/promo-chat", // API endpoint
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
        const invoiceCheckStatus = await promotionCheck(
          response.data.promo_json
        );
        console.log("Inv check status: ", invoiceCheckStatus);
        // value.setPurchaseOrderApiRes(response.data);
        console.log("Data response", response.data);
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
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
            value.setPromotionCounter((prevCounter) => prevCounter + 1);
            await promotionHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setTyping(false);
      }
      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getpromotionDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }
    } catch (error) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
      console.error("Error fetching data:", error);
    }
  };
  const getItemDetails = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/items`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      let allItems = response.data.map((item) => item.itemId);
      value.setPromoTotalItemsArray(allItems);
      console.log("ITem details REsponse: ", response);
    } catch (error) {
      console.log("ITem details Error: ", error);
    }
  };
  const getStoreDetails = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/storeList`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      let storeList = response.data.map((item) => item.storeId);
      value.setPromoStoreListArray(storeList);
      console.log("Store details REsponse: ", response);
    } catch (error) {
      console.log("Store details Error: ", error);
    }
  };
  useEffect(() => {
    getItemDetails();
    getStoreDetails();
  }, []);
  //create invoice details
  const promotionDetailsCreation = async () => {
    try {
      const promoDataDetails = value.promotionData.itemList.map((item) => ({
        promotionId: value.promotionCounterId,
        componentId: `COMP${value.promotionCounter}`,
        itemId: item,
        discountType: value.promotionData.discountType,
        discountValue: parseFloat(value.promotionData.discountValue),
      }));
      console.log("updated invoice items: ", promoDataDetails);

      const response = await axios({
        method: "post",
        url: `http://localhost:8000/promotionDetails/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: promoDataDetails,
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
  const promotionHeaderCreation = async () => {
    console.log("Invoice Header Creation");
    const promoDataHeader = {
      promotionId: value.promotionCounterId,
      componentId: `COMP${value.promotionCounter}`,
      startDate: formatDate(value.promotionData.startDate),
      endDate: formatDate(value.promotionData.endDate),
      promotionType: value.promotionData.promotionType,
      storeIds: value.promotionData.locationList,
      // storeIds: value.promotionData.locationList.toString(),
    };
    console.log("PO data:", promoDataHeader);
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/promotionHeader/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: promoDataHeader,
      });
      // console.log("invoice Creation Response:", response.data);
      await promotionDetailsCreation();
      setPdfData(value);
      let promoFileDetails = {
        status: true,
        promoId: value.promotionCounterId,
      };
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Promotion ID: " + value.promotionCounterId}
              promoFile={promoFileDetails}
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
        text: "An Error occured while creating Promotion",
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
  const [uploadLoading, setUploadLoading] = useState(false);

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
    setUploadLoading(true);
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/uploadPromo/`,
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
          setUploadLoading(false);
          value.setModalDetails({
            visible: true,
            text: "File uploaded successfully!",
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
          // await handleMessageSubmit(
          //   value.itemUpload.items && value.itemUpload.items
          //     ? `Items ${JSON.stringify(
          //         response.data.structured_data["Items"]
          //       )}`
          //     : value.itemUpload.excludedItems && value.itemUpload.excludedItems
          //     ? `Excluded Items ${JSON.stringify(
          //         response.data.structured_data["Items"]
          //       )}`
          //     : response.data.structured_data["Items"],
          //   true
          // );
          // value.setItemUpload({
          //   items: items,
          //   excludedItems: excludedItems,
          //   event: value.itemUpload.event,
          // });
        } else if (
          file &&
          (file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel")
        ) {
          value.setUploadedFile(fileDetails);
          setUploadLoading(false);
          value.setModalDetails({
            visible: true,
            text: "Excel file uploaded successfully!",
            isSuccessful: true,
          });
          console.log("items", response.data.structured_data["Items"]);
          console.log("stores", response.data.structured_data["Stores"]);
          if (
            value.itemUpload.items ||
            value.itemUpload.excludedItems ||
            value.storeUpload.stores ||
            value.storeUpload.excludedStores
          ) {
            await handleMessageSubmit(
              value.itemUpload.items &&
                response.data.structured_data["Items"].length > 0
                ? `Items ${JSON.stringify(
                    response.data.structured_data["Items"]
                  )}`
                : value.itemUpload.excludedItems &&
                  response.data.structured_data["Items"].length > 0
                ? `Excluded Items ${JSON.stringify(
                    response.data.structured_data["Items"]
                  )}`
                : value.storeUpload.stores &&
                  response.data.structured_data["Stores"].length > 0
                ? `Stores ${JSON.stringify(
                    response.data.structured_data["Stores"]
                  )}`
                : value.storeUpload.excludedStores &&
                  response.data.structured_data["Stores"].length > 0
                ? `Excluded Stores ${JSON.stringify(
                    response.data.structured_data["Stores"]
                  )}`
                : null,
              true
            );
          }
          //  else if (
          //   value.storeUpload.stores ||
          //   value.storeUpload.excludedStores
          // ) {
          //   await handleMessageSubmit(
          //     value.storeUpload.stores
          //       ? `Stores ${JSON.stringify(
          //           response.data.structured_data["Stores"]
          //         )}`
          //       : value.storeUpload.excludedStores
          //       ? `Excluded Stores ${JSON.stringify(
          //           response.data.structured_data["Stores"]
          //         )}`
          //       : response.data.structured_data["Stores"],
          //     true
          //   );
          // }

          // value.setItemUpload({
          //   items: items,
          //   excludedItems: excludedItems,
          //   event: value.itemUpload.event,
          // });
        } else {
          alert("Please upload a valid PDF file.");
          // await clearDataApi();
          value.setItemUpload({
            ...value.itemUpload,
            event: null,
          });
        }
      }
    } catch (error) {
      setUploadLoading(false);
      console.log("Upload Error:", error, error.data);
      value.setModalDetails({
        visible: true,
        text: "An error occured while uploading file",
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
  console.log("checkConsole  ", value);
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
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={uploadLoading}
        onClick={() => setUploadLoading(false)}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
              isFile={message.isFile}
            />
          </div>
        ))}
        {typing && <TypingIndicatorComponent scrollToBottom={scrollToBottom} />}
      </Box>

      {/* <form
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
                    <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                <input
                  id="inputValue"
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => {
                    e.preventDefault();
                    setInput(e.target.value);
                  }}
                  style={{
                    margin: "0.5rem",
                    height: "2rem",
                    paddingRight: "3rem", // Ensure there's space for the mic icon
                    width: "90%", // Ensure the input fills the container
                  }}
                />
                      <MicIcon
                  style={{
                    position: "absolute",
                    right: "2rem", // Position it at the very end
                    top: "50%",
                    transform: "translateY(-50%)", // Center the icon vertically
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // Handle microphone click event, like starting a recording
                    console.log("Mic icon clicked");
                  }}
                />
              </div>
      
              <SendIcon 
                className="paneIcon"
                onClick={() => handleMessageSubmit(input)}
              />
              <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
            </form>  */}
      <ChatbotInputForm
        input={input}
        setInput={setInput}
        handleMessageSubmit={handleMessageSubmit}
        uploadInvoice={uploadInvoice}
        isPickerVisible={isPickerVisible}
        setPickerVisible={setPickerVisible}
      />
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
