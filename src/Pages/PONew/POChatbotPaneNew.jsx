import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Card } from "@mui/joy";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import { Backdrop, CircularProgress } from "@mui/material";
import axios from "axios";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatbotInputForm from "../../components/ChatMessage/ChatbotInputForm";
import PdfCard from "../../components/PDF Generation/PdfCard";
import TypingIndicatorComponent from "../../components/ChatMessage/TypingIndicatorComponent";
import { AuthContext } from "../../context/ContextsMasterFile";
import "../../styles/chatbot.css";
import "../../styles/general.css";
import "../../styles/chatbot.css";
import { ADD_PO_DETAILS, CHAT, CLEAR_DATA, FETCH_SUPPLIER_BYID, PO_CREATION, UPLOAD_PO } from "../../const/ApiConst";
import EmailPdf from "../../components/PDF Generation/EmailPdf";
import { BorderColor } from "@mui/icons-material";

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
    let savedData = `
      ${value.supplierDetails.supplierId
        ? `Supplier Id: ${value.supplierDetails.supplierId},`
        : ""
      }

      ${purchaseOrderData.estDeliveryDate
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
  }, [value.poCounter]);
  const submitFormData = async () => {
    // await handleMessageSubmit("Please submit the data provided");
  };
  //clear
  const clearFormData = () => {
    value.setSupplierDetails({
      apiResponse: "",
      supplierId: "",
      leadTime: "",
      supplierStatus: false,
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
  }, [messages, typingTimeoutRef]);
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
          supplierStatus: false,
        });
      }
      prevIdRef.current = id;

      try {
        const response = await axios.get(
          FETCH_SUPPLIER_BYID(id)
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
            supplierStatus: true,
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
          supplierStatus: false,
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
    [value.purchaseItemDetails]
    // [value.purchaseItemDetails, value.invoiceDatafromConversation]
  );

  //EXTRACTING FIELD DATA FROM BACKEND
  const poCheck2 = useCallback(
    async (poObject) => {
      let updatedPurchaseOrderData = { ...value.purchaseOrderData };
      let supplierStatus = false;
      for (const key of Object.keys(poObject)) {
        console.log("Obect  : ", poObject);
        if (poObject[key] !== null) {
          switch (key) {
            // case "PO Number":
            //   updatedPurchaseOrderData.poNumber = poObject[key];
            //   break;
            case "Estimated Delivery Date":
              updatedPurchaseOrderData.estDeliveryDate = formatDate(
                poObject[key]
              );
              break;
            case "Total Quantity":
              updatedPurchaseOrderData.totalQuantity = poObject[key];
              break;
            case "Total Cost":
              updatedPurchaseOrderData.totalCost = poObject[key];
              break;
            case "Total Tax":
              updatedPurchaseOrderData.totalTax = poObject[key];
              break;
            case "Items":
              updatedPurchaseOrderData.items = poObject[key];
              updateItemDetails(poObject[key]);
              break;
            case "Supplier ID":
              // updatedPurchaseOrderData.supplierId = poObject[key];
              // supplierStatus = await getSupplierDetails(poObject[key]); // Get true/false status
              // console.log("Supplier Status:", supplierStatus);
              // break;
              supplierStatus = await getSupplierDetails(poObject[key]); // Wait for the update
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
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(true);
    }, 1500);

    try {
      const response = await axios.post(
        CHAT, // API endpoint
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
        const poCheckStatus = await poCheck2(response.data.po_json);
        console.log("Inv check status: ", poCheckStatus);
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
          response.data.po_json["Supplier ID"] === undefined ||
          response.data.po_json["Supplier ID"] === "" ||
          response.data.po_json["Supplier ID"] === null
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
            await poHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
          if (response.data.po_json["Email"] != "") {
            console.log("Inside Email: ", response.data.po_json["Email"], value.poCounter - 1)
            await sendEmail({ emailUsed: response.data.po_json["Email"], documentId: `PO${value.poCounter - 1}` })

          }
        } else {
          if (poCheckStatus) {
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
              await poHeaderCreation();
              // }
            } else {
              value.setModalVisible(false);
            }
            if (response.data.po_json["Email"] != "") {
              console.log("Inside Email: ", response.data.po_json["Email"], value.poCounter - 1)
              await sendEmail({ emailUsed: response.data.po_json["Email"], documentId: `PO${value.poCounter - 1}` })
  
            }
          } else {
            console.log("poCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
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
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
    }
  };
  //create invoice details
  const poDetailsCreation = async () => {
    try {
      const updatedPoItems = value.purchaseItemDetails.map((item) => ({
        ...item,
        poId: value.poCounterId,
        supplierId: value.supplierDetails.supplierId,
        totalItemCost:
          parseFloat(item.itemCost) * parseFloat(item.itemQuantity),
      }));
      console.log("updated invoice items: ", updatedPoItems);

      const response = await axios({
        method: "post",
        url: ADD_PO_DETAILS,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedPoItems,
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
  const poHeaderCreation = async () => {
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
      payment_term: "Credit Card",
      currency: "USD",
      poNumber: value.poCounterId,
    };
    console.log("PO data:", poData);
    try {
      const response = await axios({
        method: "post",
        url: PO_CREATION,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: poData,
      });
      // console.log("invoice Creation Response:", response.data);
      await poDetailsCreation();
      setPdfData(value);
      let poFileDetails = { poStatus: true, poNumber: value.poCounterId };
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Purchase Order ID: " + value.poCounterId}
              poFile={poFileDetails}
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
                          .replace(/\b\w/g, (char) => char.toUpperCase())}: ${subValue ?? "N/A"
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
            .replace(/\b\w/g, (char) => char.toUpperCase())}: ${value ?? "N/A"
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
        url: UPLOAD_PO,
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
          setUploadLoading(false);
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
      setUploadLoading(false);
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
        url: CLEAR_DATA,
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

  const sendEmail = async ({ emailUsed, documentId }) => {
    await EmailPdf({
      emailUsed: emailUsed,
      bodyUsed: { "documentType": "Purchase Order" },
      purchaseOrder: true,
      documentId: documentId
    });
  }


  console.log("checkConsole", value);
  return (
    <div className="chatbot-card">
      <div
        className="chatbot-area imageBackground"
        ref={messageEl}
      >
        {" "}
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
                // isFile={pdfCardVisible}
                isFile={message.isFile}
              />
            </div>
          ))}{" "}
          {typing && (
            <TypingIndicatorComponent scrollToBottom={scrollToBottom} />
          )}
        </Box>
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
      </div>
    </div>
  );
}
