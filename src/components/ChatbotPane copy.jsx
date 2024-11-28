
//10/09/2024//
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  // const [input, setInput] = useState("");

  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);
  // }, [value.formSave, value.formSubmit, value.itemDetailsInput]);

  const saveFormData = async () => {
    console.log("Inside save form data", value.itemDetailsInput);
    value.setItemDetails(value.itemDetailsInput);
    const getTrueValueKey = (obj) => {
      return Object.keys(obj).find((key) => obj[key] === true);
    };

    const trueValueKey = getTrueValueKey(value.typeOfInvoice);

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
      value.itemDetailsInput.items
        ? `Items: ${value.itemDetailsInput.items},`
        : ""
    }
    ${
      value.itemDetailsInput.quantity
        ? `Quantity: ${value.itemDetailsInput.quantity}`
        : ""
    }
    `;

    setInput(
      "Invoice type: Debit Note,Date: 26/06/2024,Supplier Id: SUP1123,Total amount: 6700,Total tax: 342,Items: ID123, ID124, Quantity: 2, 4 ,PO number: PO123"
    );
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  const submitFormData = async () => {
    // await invoiceHeaderCreation();
    await handleMessageSubmit("Please submit the data provided");

    value.setFormSubmit((prevState) => !prevState);
  };

  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const [loading, setLoading] = useState(false);

  const getPoDetails = useCallback(
    async (id) => {
      // setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        const poHeader = response.data.po_header;

        // Update poHeaderData with fetched details
        const updatedPoHeaderData = {
          ...value.poHeaderData,
          currency: poHeader.currency,
          totalCost: poHeader.totalCost,
          invoiceNo: "INV" + value.invoiceCounter,
          exchangeRate: 1,
          paymentTerm: poHeader.payment_term,
        };
        value.setPoHeaderData(updatedPoHeaderData);

        // Prepare and set poDetailsData
        const newUpdatedData = response.data.po_details.map((item) => ({
          ...item,
          invQty: 0,
          invAmt: 0,
        }));
        value.setPoDetailsData(newUpdatedData);
        console.log(
          "PO Ids inside get po",
          id,
          response.data.po_details.map((item) => item.poId)
        );
        // After setting poDetailsData, call the updateItemDetails function
        if (newUpdatedData.length > 0) {
          updateItemDetails(value.invoiceData);
        }
      } catch (error) {
        console.error("Error fetching PO details:", error);
        let errorMsg =
          "Sorry, we couldn't find this Purchase Order in our database, please try another PO number";
        // setMessages([
        //   ...messages,
        //   { text: errorMsg, fromUser: false },
        // ]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: errorMsg, fromUser: false },
        ]);

        // Handle error appropriately, e.g., show a notification or set an error state
      } finally {
        setLoading(false);
      }
    },
    [value]
  );

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
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
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

  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    getPoDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
    value.setItemDetailsInput({
      items: "",
      quantity: "",
    });
    value.setinvoiceDatafromConversation({});
  };
  console.log("POdetailsdata", value.poDetailsData);
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      console.log("Inv creation po details:", value.poDetailsData);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.poHeaderData.invoiceNo,
      supplierId: value.invoiceData.supplierId,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "pending",
      total_cost: value.invoiceData.totalAmount,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
    };

    try {
      console.log(
        "Creation Called",
        invData,
        formatDate(value.invoiceData.invoiceDate),
        sumQuantities(value.itemDetails.quantity)
      );
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Invoice Number: " + value.poHeaderData.invoiceNo}
              invoiceID={value.poHeaderData.invoiceNo}
            />
          ),
          fromUser: false,
          isFile: true,
        },
      ]);
      await clearDataApi();

      // Set pdfCardVisible to true to ensure it stays visible
      setPdfCardVisible(false);
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };
  const [pdfCardVisible, setPdfCardVisible] = useState(false);

  const handleMessageSubmit = async (input) => {
    // e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      console.log("Context:", value);
      console.log("Extracted Data:", value.extractedData);
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
      } else if (response.data.submissionStatus == "submitted") {
        value.setIsActive(false);
      }

      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );

      invoiceCheck2(invoice_json, response.data.invoiceDatafromConversation);

      // typeSelection(response.data.invoiceDatafromConversation);
      // updateItemDetails(response.data.invoiceDatafromConversation);
      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        updateItemDetails(response.data.invoiceDatafromConversation);
        console.log(
          "submissionStatus",
          "Item Details before calling invoiceheadercreation",
          value.itemDetails
        );
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
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
        const invoiceType = invoiceVal["invoiceType"];
        // if (invoiceType) {
        //   const match = invoiceType.match(regexPattern);
        //   if (match) {
        //     const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
        //     value.setTypeOfInvoice({
        //       nonMerchandise: !!nonMerchandise,
        //       merchandise: !!merchandise,
        //       creditNote: !!creditNote,
        //       debitNote: !!debitNote,
        //     });
        //   } else {
        //     value.setTypeOfInvoice({
        //       nonMerchandise: false,
        //       merchandise: false,
        //       creditNote: false,
        //       debitNote: false,
        //     });
        //   }
        // }
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
    [
      value.invoiceData,
      value.invoiceData.invoiceType,
      value.invoiceData.invoiceType,
    ]
  );

  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      // console.log("UpdateItemDetail called","length of po:",value.poDetailsData.length)
      if (Object.keys(invoiceDatafromConversation).length > 0) {
        let updatedInvoiceData = { ...value.itemDetails };
        const items = invoiceDatafromConversation["Items"];
        const quantity = invoiceDatafromConversation["Quantity"];
        // const items = invoiceDatafromConversation["items"];
        // const quantity = invoiceDatafromConversation["quantity"];
        let arrayItems = [];
        let arrayQty = [];
        console.log("arrayitems and array qty", arrayItems, arrayQty);
        if (items && quantity) {
          updatedInvoiceData.items = items;
          arrayItems = items.split(", ").map((item) => item.trim());
          setItemsArray(arrayItems);
          updatedInvoiceData.quantity = quantity;
          arrayQty = quantity
            .split(", ")
            .map((quantity) => parseInt(quantity.trim(), 10));
          setQuantitiesArray(arrayQty);
        } else {
          value.setItemDetails({
            items: "",
            quantity: "",
          });
        }
        const tempDictionary = {};
        arrayItems.forEach((item, index) => {
          tempDictionary[item] = arrayQty[index];
        });
        setDictionary(tempDictionary);
        value.setItemDetails(updatedInvoiceData);
        // console.log(
        //   "updatedinvoicedata:",
        //   updatedInvoiceData,
        //   "Type: ",
        //   typeof updatedInvoiceData
        // );
        value.setItemDetailsInput({
          items: itemsArray,
          quantity: quantitiesArray,
        });
        updatePo();

        // if (value.poDetailsData.length > 0) {
        //   updatePo();
        // }
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }
    },
    [
      value.poDetailsData,
      value.invoiceData,
      value.invoiceData.invoiceType,
      value.invoiceData,
      value.invoiceData.invoiceType,
    ]
  );
  const [dictionary, setDictionary] = useState({});

  // useEffect(() => {
  //   typeSelection(value.invoiceDatafromConversation);
  //   updateItemDetails(value.invoiceDatafromConversation);
  // }, [value.invoiceData, value.invoiceData.invoiceType, value.poDetailsData,]);

  // useEffect(() => {
  //   if (value.invoiceDatafromConversation) {
  //     typeSelection(value.invoiceDatafromConversation);
  //     updateItemDetails(value.invoiceDatafromConversation);
  //   }
  // }, [value.invoiceData, value.invoiceData.invoiceType,value.invoiceData, value.invoiceData.invoiceType,value.poDetailsData]);

  useEffect(() => {
    if (value.invoiceDatafromConversation) {
      typeSelection(value.invoiceDatafromConversation);
      updateItemDetails(value.invoiceDatafromConversation);
    }
  }, [
    value.invoiceData.invoiceType,
    value.invoiceDatafromConversation,
    value.poDetailsData,
  ]);
  // useEffect(() => {
  //   if (value.poDetailsData && value.poDetailsData.length > 0) {
  //     updateItemDetails(value.invoiceData);
  //     typeSelection(value.invoiceDatafromConversation);

  //   }
  // }, [value.poDetailsData]);

  // useEffect(()=>{

  // },[value.poDetailsData])

  const updatePo = () => {
    const data = convertItemDetailsToData(value.itemDetails);
    console.log("Item details in update po", data);
    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (data[item.itemId] !== undefined) {
        // console.log("Inside ", dictionary[item.itemId],dictionary);
        return {
          ...item,
          invQty: data[item.itemId],
          invAmt: parseInt(data[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
        };
      }
      return item;
    });
    console.log("Updated", updatedItemsDetails);
    const hasChanges =
      JSON.stringify(updatedItemsDetails) !==
      JSON.stringify(value.poDetailsData);

    if (hasChanges) {
      value.setPoDetailsData(updatedItemsDetails);
    }
  };
  const convertItemDetailsToData = (itemDetails) => {
    const allEmpty = Object.values(itemDetails).every((value) => value === "");
    console.log("convert item details to data", itemDetails, allEmpty);
    const { items, quantity } = itemDetails;
    // if(allEmpty){
    //   const { items, quantity } = {"items":0,"quantity":0}
    // }else{
    //   const { items, quantity } = itemDetails;

    // }
    // Split items and quantities by comma without spaces

    const itemArray = items
      .toString()
      .split(",")
      .map((item) => item.trim());
    const quantityArray = quantity
      .toString()
      .split(",")
      .map((qty) => parseInt(qty.trim(), 10));

    const data = itemArray.reduce((acc, item, index) => {
      acc[item] = quantityArray[index];
      return acc;
    }, {});

    console.log("Converted Item Detail: ", data);
    return data;
  };
  useEffect(() => {
    updatePo();
  }, [value.itemDetails]);
  const invoiceCheck2 = useCallback(
    (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };

      Object.keys(invoiceObject).forEach(async (key) => {
        if (key === "invoice type" && invoiceObject[key] !== null) {
          updatedInvoiceData.invoiceType = invoiceObject[key];
        }
        if (key === "po number" && invoiceObject[key] !== null) {
          updatedInvoiceData.poNumber = invoiceObject[key];
 
          await getPoDetails(invoiceObject[key]);
        }
        if (key === "quantity" && invoiceObject[key] !== null) {
          updatedInvoiceData.quantity = invoiceObject[key];
        }
        if (key === "supplier id" && invoiceObject[key] !== null) {
          updatedInvoiceData.supplierId = invoiceObject[key];
        }
        if (key === "total amount" && invoiceObject[key] !== null) {
          updatedInvoiceData.totalAmount = invoiceObject[key];
        }
        if (key === "date" && invoiceObject[key] !== null) {
          updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
        }
        if (key === "total tax" && invoiceObject[key] !== null) {
          updatedInvoiceData.totalTax = invoiceObject[key];
        }
        if (key === "items" && invoiceObject[key] !== null) {
          updatedInvoiceData.items = invoiceObject[key];
        }
      });
      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      console.log("update item details:");
      updateItemDetails(invoiceDatafromConversation);
    },
    [getPoDetails, updateItemDetails]
  );

  console.log("PDf data:", pdfData);
  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };
  }, [dictionary, value.poDetailsData.length]);

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
        {/* {messages.map((message, index) => (
          <>
            <ChatMessage
              key={index}
              text={message.text}
              fromUser={message.fromUser}
            /></>))} */}
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
        {/* {index == messages.length - 1 && value.modalVisible && pdfData && (
              <ChatMessage
                key={index}
                text={
                  <PdfCard
                    title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
                    invoiceID={pdfData.poHeaderData.invoiceNo}
                  />
                }
                fromUser={message.fromUser}
              />
            )} */}

        {/* {value.modalVisible && pdfData && (
          <PdfCard
            title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
            invoiceID={pdfData.poHeaderData.invoiceNo} 
          />
        )} */}
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSubmit(input);
        }}
        id="form1"
        className="chatbot-input-form"
        style={{
          display: "flex",
          backgroundColor: "#283d76",
          borderRadius: "0.5rem",
        }}
      >
        <Add style={{ color: "white" }} />
        <Smiley style={{ color: "white" }} />
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
          style={{ color: "white" }}
          onClick={() => handleMessageSubmit(input)}
        />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
    </Sheet>
  );
}

//10/09/2024//

//30/08/2024
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
import React, { useEffect, useState, useContext, useRef,useCallback} from "react";
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  // const [input, setInput] = useState("");

  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);

  const saveFormData = async () => {
    console.log("Here");
    value.setItemDetails(value.itemDetailsInput);
    const getTrueValueKey = (obj) => {
      return Object.keys(obj).find((key) => obj[key] === true);
    };

    const trueValueKey = getTrueValueKey(value.typeOfInvoice);

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
      value.itemDetailsInput.items
        ? `Items: ${value.itemDetailsInput.items},`
        : ""
    }
    ${
      value.itemDetailsInput.quantity
        ? `Quantity: ${value.itemDetailsInput.quantity}`
        : ""
    }
    `;

    setInput(
      "Invoice type: Debit Note,Date: 26/06/2024,Supplier Id: SUP1123,Total amount: 6700,Total tax: 342,Items: ID123, ID124, Quantity: 2, 4 ,PO number: PO123"
    );
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  const submitFormData = async () => {
    // await invoiceHeaderCreation();
    await handleMessageSubmit("Please submit the data provided");

    value.setFormSubmit((prevState) => !prevState);
  };

  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const extractAndSave = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoicetype" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "ponumber" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        getPoDetails(invoiceObject[key]);
      }
      if (key === "supplierid" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
      }
      if (key === "totalamount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "datetime" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "totaltax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };

  const getPoDetails = async (id) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/poDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("get PO response", response.data);
      const poHeader = response.data.po_header;
      const updatedPoData = {
        ...value.poHeaderData,
        currency: poHeader.currency,
        totalCost: poHeader.totalCost,
        invoiceNo: "INV" + value.invoiceCounter,
        exchangeRate: 1,
        paymentTerm: poHeader.payment_term,
      };
      value.setPoHeaderData(updatedPoData);
      value.setPoDetailsData(response.data.po_details);
      const newUpdatedData = response.data.po_details.map((item) => ({
        ...item,
        invQty: 0,
        invAmt: 0,
      }));

      value.setPoDetailsData(newUpdatedData);
      // updateItemDetails(value.invoiceData);
    } catch (error) {
      const updatedPoData = {
        ...value.poHeaderData,
        currency: "",
        paymentTerm: "",
        invoiceNo: "",
        totalCost: "",
        exchangeRate: "",
      };
      const botReply = error.response.data.detail.slice(-1);
      const formattedConversation = error.response.data.detail
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));
      setMessages([
        ...messages,
        { text: formattedConversation, fromUser: false },
      ]);
      value.setPoHeaderData(updatedPoData);
      console.log("Get Po Error:", error);
      // value.
      value.setPoDetailsData([]);
    }
  };
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date");
    }
  }
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
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

  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    getPoDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
    value.setinvoiceDatafromConversation({});
  };
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.poHeaderData.invoiceNo,
      supplierId: value.invoiceData.supplierId,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "pending",
      total_cost: value.invoiceData.totalAmount,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
    };

    try {
      console.log("Creation Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      await clearDataApi();
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };

  const invoiceCheck2 = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoice type" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "po number" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        getPoDetails(invoiceObject[key]);
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
      }
      if (key === "supplier id" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "total amount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "date" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "total tax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };

  const handleMessageSubmit = async (input) => {
    // e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      console.log("Context:", value);
      console.log("Extracted Data:", value.extractedData);
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
      } else if (response.data.submissionStatus == "submitted") {
        value.setIsActive(false);
      }
      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );
      invoiceCheck2(invoice_json);
      typeSelection(response.data.invoiceDatafromConversation);
      updateItemDetails(response.data.invoiceDatafromConversation);
      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        console.log("submissionStatus");
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const typeSelection =  useCallback((invoiceDatafromConversation) => {
    const invoiceVal = invoiceDatafromConversation;
    const invoiceValFromJson = value.invoiceData.invoiceType;
    let newTypeOfInvoice = {
      nonMerchandise: false,
      merchandise: false,
      creditNote: false,
      debitNote: false,
    };
    if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
      const invoiceType = invoiceVal["invoiceType"];
      // if (invoiceType) {
      //   const match = invoiceType.match(regexPattern);
      //   if (match) {
      //     const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
      //     value.setTypeOfInvoice({
      //       nonMerchandise: !!nonMerchandise,
      //       merchandise: !!merchandise,
      //       creditNote: !!creditNote,
      //       debitNote: !!debitNote,
      //     });
      //   } else {
      //     value.setTypeOfInvoice({
      //       nonMerchandise: false,
      //       merchandise: false,
      //       creditNote: false,
      //       debitNote: false,
      //     });
      //   }
      // }
      if (invoiceType) {
        const match = invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
        JSON.stringify(newTypeOfInvoice) !== JSON.stringify(value.typeOfInvoice)
      ) {
        value.setTypeOfInvoice(newTypeOfInvoice);
      }
    }
    if (value.invoiceData.invoiceType) {
      if (value.invoiceData.invoiceType) {
        const match = value.invoiceData.invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
  },[value.invoiceData, value.invoiceData.invoiceType,value.invoiceData.invoiceType]);

  const updateItemDetails = useCallback((invoiceDatafromConversation) => {
    if (Object.keys(invoiceDatafromConversation).length > 0) {
      let updatedInvoiceData = { ...value.itemDetails };
      const items = invoiceDatafromConversation["Items"];
      const quantity = invoiceDatafromConversation["Quantity"];
      // const items = invoiceDatafromConversation["items"];
      // const quantity = invoiceDatafromConversation["quantity"];
      let arrayItems = [];
      let arrayQty = [];
      if (items && quantity) {
        updatedInvoiceData.items = items;
        arrayItems = items.split(", ").map((item) => item.trim());
        setItemsArray(arrayItems);
        updatedInvoiceData.quantity = quantity;
        arrayQty = quantity
          .split(", ")
          .map((quantity) => parseInt(quantity.trim(), 10));
        setQuantitiesArray(arrayQty);
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }
      const tempDictionary = {};
      arrayItems.forEach((item, index) => {
        tempDictionary[item] = arrayQty[index];
      });
      setDictionary(tempDictionary);
      value.setItemDetails(updatedInvoiceData);
      if (value.poDetailsData.length > 0) {
        updatePo();
      }
    } else {
      value.setItemDetails({
        items: "",
        quantity: "",
      });
    }
  },[value.poDetailsData,value.invoiceData, value.invoiceData.invoiceType,value.invoiceData, value.invoiceData.invoiceType,]);
  const [dictionary, setDictionary] = useState({});

  // useEffect(() => {
  //   typeSelection(value.invoiceDatafromConversation);
  //   updateItemDetails(value.invoiceDatafromConversation);
  // }, [value.invoiceData, value.invoiceData.invoiceType, value.poDetailsData,]);

  useEffect(() => {
    if (value.invoiceDatafromConversation) {
      typeSelection(value.invoiceDatafromConversation);
      updateItemDetails(value.invoiceDatafromConversation);
    }
  }, [value.invoiceData, value.invoiceData.invoiceType,value.invoiceData, value.invoiceData.invoiceType,]);
  
  // useEffect(()=>{

  // },[value.poDetailsData])

  const updatePo = () => {
    const data = convertItemDetailsToData(value.itemDetails);
    console.log("Item details in", data);
    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (data[item.itemId] !== undefined) {
        // console.log("Inside ", dictionary[item.itemId],dictionary);
        return {
          ...item,
          invQty: data[item.itemId],
          invAmt: parseInt(data[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
        };
      }
      return item;
    });
    // console.log("Updated", updatedItemsDetails);
    value.setPoDetailsData(updatedItemsDetails);
  };
  const convertItemDetailsToData = (itemDetails) => {
    // console.log("convert item details to data", itemDetails);
    const { items, quantity } = itemDetails;
    const itemArray = items
      .toString()
      .split(", ")
      .map((item) => item.trim());
    const quantityArray = quantity
      .toString()
      .split(", ")
      .map((qty) => parseInt(qty.trim(), 10));

    const data = itemArray.reduce((acc, item, index) => {
      acc[item] = quantityArray[index];
      return acc;
    }, {});

    return data;
  };
  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };
  }, [dictionary, value.poDetailsData.length]);

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
          <ChatMessage
            key={index}
            text={message.text}
            fromUser={message.fromUser}
          />
        ))}
        {value.modalVisible && pdfData && (
          <PdfCard
            title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
            invoiceID={pdfData.poHeaderData.invoiceNo}
          />
        )}
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSubmit(input);
        }}
        id="form1"
        className="chatbot-input-form"
        style={{
          display: "flex",
          backgroundColor: "#283d76",
          borderRadius: "0.5rem",
        }}
      >
        <Add style={{ color: "white" }} />
        <Smiley style={{ color: "white" }} />
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
          style={{ color: "white" }}
          onClick={() => handleMessageSubmit(input)}
        />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
    </Sheet>
  );
}

//30/08/2024


//08/07/2024
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
import React, { useEffect, useState, useContext, useRef } from "react";
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  // const [input, setInput] = useState("");

  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if(value.formSubmit){
      submitFormData();
    }
  }, [value.formSave,value.formSubmit ]);

  const saveFormData = async () => {
    console.log("Here");
    const getTrueValueKey = (obj) => {
      return Object.keys(obj).find((key) => obj[key] === true);
    };
  
    const trueValueKey = getTrueValueKey(value.typeOfInvoice);
  
    
    let savedData=`
    ${trueValueKey?`Type of Invoice: ${trueValueKey},`:""}
    ${value.invoiceData.invoiceDate?`Date: ${value.invoiceData.invoiceDate},`:""}
    ${value.invoiceData.poNumber?`PO number: ${value.invoiceData.poNumber},`:""}
    ${value.invoiceData.supplierId?`Supplier Id: ${value.invoiceData.supplierId},`:""}
    ${value.invoiceData.totalAmount?`Total amount: ${value.invoiceData.totalAmount},`:""}
    ${value.invoiceData.totalTax?`Total tax: ${value.invoiceData.totalTax},`:""}
    ${value.itemDetails.items?`Items: ${value.itemDetails.items},`:""}
    ${value.itemDetails.quantity?`Quantity: ${value.itemDetails.quantity}`:""}`
    
    setInput(
      "Invoice type: Debit Note,Date: 26/06/2024,Supplier Id: SUP1123,Total amount: 6700,Total tax: 342,Items: ID123, ID124, Quantity: 2, 4 ,PO number: PO123"
    );
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  const submitFormData=async ()=>{
    // await invoiceHeaderCreation();
    // console.log("Submit Called")
    await handleMessageSubmit("Please submit the data provided");

    value.setFormSubmit((prevState) => !prevState);

  }
  // console.log("fprm state", value.formSave);
  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const extractAndSave = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoicetype" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "ponumber" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        getPoDetails(invoiceObject[key]);
      }
      if (key === "supplierid" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
      }
      if (key === "totalamount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "datetime" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "totaltax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };
  const getPoDetails = async (id) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/poDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("PO response", response.data);
      const poHeader = response.data.po_header;
      const updatedPoData = {
        ...value.poHeaderData,
        currency: poHeader.currency,
        totalCost: poHeader.totalCost,
        invoiceNo: "INV" + value.invoiceCounter,
        exchangeRate: 1,
        paymentTerm: poHeader.payment_term,
      };
      value.setPoHeaderData(updatedPoData);
      value.setPoDetailsData(response.data.po_details);
      const newUpdatedData = response.data.po_details.map((item) => ({
        ...item,
        invQty: 0,
        invAmt: 0,
      }));

      value.setPoDetailsData(newUpdatedData);
      updateItemDetails(value.invoiceData);
    } catch (error) {
      const updatedPoData = {
        ...value.poHeaderData,
        currency: "",
        totalCost: "",
        invoiceNo: "",
        paymentTerm: "",
      };
      value.setPoHeaderData(updatedPoData);
      console.log("Get Po Error:", error);
    }
  };
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date");
    }
  }
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
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
  
 
  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    getPoDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
  };
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.poHeaderData.invoiceNo,
      supplierId: value.invoiceData.supplierId,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "pending",
      total_cost: value.invoiceData.totalAmount,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
    };

    try {

      console.log("Creation Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      await clearDataApi();
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };
  console.log("context:",value)
  const handleMessageSubmit = async (input) => {
    // e.preventDefault();
    // if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    if (value.modalVisible == true) {
      value.setModalVisible(false);
    }
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      console.log(
        "Inside Message",
        value.invoiceData,
        "itemDetails:",
        value.itemDetails,
        
      );
      if (response.data.extractor_info != null) {
        const extractedData =  response.data.extractor_info;
        // const extractedData = JSON.parse(response.data.extractor_info);
        console.log("inside if:", extractedData.invoice_detail);
        let invoiceObject = extractedData.invoice_detail;
        extractAndSave(invoiceObject);
        updateItemDetails(invoiceObject);
        getPoDetails(extractedData.invoice_detail.ponumber);
        typeSelection(invoiceObject);
      }
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
        clearDataApi();
      }
      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );

      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        console.log("submissionStatus");
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const typeSelection = (invoiceDatafromConversation) => {
    const invoiceVal = invoiceDatafromConversation;
    const invoiceValFromJson = value.invoiceData.invoiceType;

    if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
      const invoiceType = invoiceVal["invoiceType"];
      if (invoiceType) {
        const match = invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
    if (value.invoiceData.invoiceType) {
      if (value.invoiceData.invoiceType) {
        const match = value.invoiceData.invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
  };

  const updateItemDetails = (invoiceDatafromConversation) => {
    if (Object.keys(invoiceDatafromConversation).length > 0) {
      let updatedInvoiceData = { ...value.itemDetails };
      const items = invoiceDatafromConversation["items"];
      const quantity = invoiceDatafromConversation["quantity"];
      let arrayItems = [];
      let arrayQty = [];
      if (items && quantity) {
        updatedInvoiceData.items = items;
        arrayItems = items.split(", ").map((item) => item.trim());
        setItemsArray(arrayItems);
        updatedInvoiceData.quantity = quantity;
        arrayQty = quantity
          .split(", ")
          .map((quantity) => parseInt(quantity.trim(), 10));
        setQuantitiesArray(arrayQty);
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }
      const tempDictionary = {};
      arrayItems.forEach((item, index) => {
        tempDictionary[item] = arrayQty[index];
      });
      setDictionary(tempDictionary);
      value.setItemDetails(updatedInvoiceData);
      if (value.poDetailsData.length > 0) {
        updatePo();
      }
    } else {
      value.setItemDetails({
        items: "",
        quantity: "",
      });
    }
  };
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    typeSelection(value.invoiceData);
    updateItemDetails(value.invoiceData);
  }, [value.invoiceData, value.invoiceData.invoiceType, value.poDetailsData]);
  const updatePo = () => {
    const data = convertItemDetailsToData(value.itemDetails);
    // console.log("Inside update po", value.itemDetails);
    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (data[item.itemId] !== undefined) {
        // console.log("Inside ", dictionary[item.itemId]);
        return {
          ...item,
          invQty: data[item.itemId],
          invAmt: parseInt(data[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
        };
      }
      return item;
    });
    // console.log("Updated", updatedItemsDetails);
    value.setPoDetailsData(updatedItemsDetails);
  };
  const convertItemDetailsToData = (itemDetails) => {
    const { items, quantity } = itemDetails;
    const itemArray = items.split(", ").map((item) => item.trim());
    const quantityArray = quantity
      .split(", ")
      .map((qty) => parseInt(qty.trim(), 10));

    const data = itemArray.reduce((acc, item, index) => {
      acc[item] = quantityArray[index];
      return acc;
    }, {});

    return data;
  };
  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };
  }, [dictionary, value.poDetailsData.length]);

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
        <ChatMessage
          key={index}
          text={message.text}
          fromUser={message.fromUser}
        />
      ))}
      {value.modalVisible && pdfData && (
        <PdfCard
          title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
          invoiceID={pdfData.poHeaderData.invoiceNo}
        />
      )}
    </Box>
    <form
      onSubmit={(e) => { 
        e.preventDefault(); 
        handleMessageSubmit(input); 
      }}
      id="form1"
      className="chatbot-input-form"
      style={{
        display: "flex",
        backgroundColor: "#283d76",
        borderRadius: "0.5rem",
      }}
    >
      <Add style={{ color: "white" }} />
      <Smiley style={{ color: "white" }} />
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
      <SendIcon style={{ color: "white" }} onClick={() => handleMessageSubmit(input)} />
      <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
    </form>
  </Sheet>
  );
}

//08/07/2024

//27/06/2024 p-2
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
import React, { useEffect, useState, useContext, useRef } from "react";
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  // const [pdfData, setPdfData] = useState({poDetailsData:[],poHeaderData:{},invoiceData:{}});

  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function useChatScroll(dep) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [dep]);
    return ref;
  }
  const ref = useChatScroll(messages);

  const invoiceCheck = (invoiceObject) => {
    invoiceObject.split("\n").forEach((line) => {
      console.log("Line:", line);
      let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
      if (match_invoice_type) {
        console.log("Invoice type");
        value.setInvoiceData({
          ...value.invoiceData,
          invoiceType: match_invoice_type[1].trim(),
        });
      }

      let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
      if (match_datetime) {
        value.setInvoiceData({
          ...value.invoiceData,
          datetime: match_datetime[1].trim(),
        });
      }

      let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

      if (match_po_number) {
        console.log("inv");
        value.setInvoiceData({
          ...value.invoiceData,
          poNumber: match_po_number[1].trim(),
        });
      }

      let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
      if (match_total_amount) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalAmount: match_total_amount[1].trim(),
        });
      }

      let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
      if (match_total_tax) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalTax: match_total_tax[1].trim(),
        });
      }

      let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
      if (match_items) {
        value.setInvoiceData({
          ...value.invoiceData,
          items: match_items[1].trim(),
        });
      }

      let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
      if (match_quantity) {
        value.setInvoiceData({
          ...value.invoiceData,
          quantity: match_quantity[1].trim(),
        });
      }
    });
  };
  const extractAndSave = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoicetype" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "ponumber" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        getPoDetails(invoiceObject[key]);
      }
      if (key === "supplierid" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
        // updateItemDetails(invoiceObject)
        //   value.setItemDetails(
        //     ...value.itemDetails,
        //     { quantity: invoiceObject[key] }
        // );
      }
      if (key === "totalamount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "datetime" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "totaltax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
        // updateItemDetails(invoiceObject)
        //   value.setItemDetails(
        //     ...value.itemDetails,
        //     { items: invoiceObject[key] }
        // );
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };
  const invoiceTypeSelection = () => {
    const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
    const regexPatternMerchandise = /merchandise/i;
    const regexPatternCreditNote = /credit\s*-?\s*note/i;
    const regexPatternDebitNote = /debit\s*-?\s*note/i;

    const invoiceVal = value.invoiceDatafromConversation;
    if (Object.keys(invoiceVal).length !== 0) {
      if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternNonMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: true,
          merchandise: false,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: true,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternCreditNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: true,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternDebitNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: false,
          debitNote: true,
        });
      }
      console.log("regex equal");
    } else {
      console.log("regex not equal");
    }
  };
  const getPoDetails = async (id) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/poDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("PO response", response.data);
      const poHeader = response.data.po_header;
      const updatedPoData = {
        ...value.poHeaderData,
        currency: poHeader.currency,
        totalCost: poHeader.totalCost,
        invoiceNo: "INV" + value.invoiceCounter,
        exchangeRate: 1,
        paymentTerm: poHeader.payment_term,
      };
      value.setPoHeaderData(updatedPoData);
      value.setPoDetailsData(response.data.po_details);
      const newUpdatedData = response.data.po_details.map((item) => ({
        ...item,
        invQty: 0,
        invAmt: 0,
      }));

      value.setPoDetailsData(newUpdatedData);
      updateItemDetails(value.invoiceData);
      // if (Object.keys(tempDictionary).length > 0) {
      //   const updatedItemsDetails = value.poDetailsData.map((item) => {
      //     if (tempDictionary[item.itemId] !== undefined) {
      //       // console.log("Inside ", dictionary[item.itemId]);
      //       return {
      //         ...item,
      //         invQty: tempDictionary[item.itemId],
      //         invAmt:
      //           parseInt(tempDictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
      //       };
      //     }
      //     return item;
      //   });
      //   console.log("Updated", updatedItemsDetails);
      //   value.setPoDetailsData(updatedItemsDetails);
      // }
    } catch (error) {
      const updatedPoData = {
        ...value.poHeaderData,
        currency: "",
        totalCost: "",
        invoiceNo: "",
        paymentTerm: "",
      };
      value.setPoHeaderData(updatedPoData);
      console.log("Get Po Error:", error);
    }
  };
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date");
    }
  }
  function sumQuantities(str) {
    if (str) {
      const quantitiesArray = str
        .split(",")
        .map((num) => parseInt(num.trim(), 10));
      const totalQuantity = quantitiesArray.reduce(
        (sum, current) => sum + current,
        0
      );

      // Update the object with the total quantity
      str = totalQuantity;
    }
    return str;
  }
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
  // console.log("Type of invoice", typeofInv);
  const invData = {
    invoiceId: value.poHeaderData.invoiceNo,
    supplierId: value.invoiceData.supplierId,
    invoiceType: typeofInv,
    currency: value.poHeaderData.currency,
    payment_term: value.poHeaderData.paymentTerm,
    invoice_status: "pending",
    total_cost: value.invoiceData.totalAmount,
    total_tax: value.invoiceData.totalTax,
    total_amount: value.invoiceData.totalAmount,
  };
  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    getPoDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
    // setDictionary({});
    // typeSelection(value.invoiceDatafromConversation);
    // updateItemDetails(value.invoiceDatafromConversation);
    // updateItemDetails();
  };
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    try {
      console.log("Creation Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      await clearDataApi();
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };
  const [input, setInput] = useState("");
  // console.log(
  //   "Extracted Data outside fn:",
  //   value.invoiceData,
  //   "itemDetails:",
  //   value.itemDetails,
  //   "context:",
  //   value
  // );
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    if (value.modalVisible == true) {
      value.setModalVisible(false);
    }
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      // console.log("Context:", value);
      // console.log("Extracted Data:", value.extractedData);
      console.log(
        "Inside Message",
        value.invoiceData,
        "itemDetails:",
        value.itemDetails,
        "context:",
        value
      );
      if (response.data.extractor_info != null) {
        const extractedData = JSON.parse(response.data.extractor_info);
        // setResponseData(extractedData.invoice_detail)
        console.log("inside if:", extractedData.invoice_detail);
        let invoiceObject = extractedData.invoice_detail;

        extractAndSave(invoiceObject);
        updateItemDetails(invoiceObject);
        getPoDetails(extractedData.invoice_detail.ponumber);
        typeSelection(invoiceObject);
      }
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
        clearDataApi();
      }
      // else if (response.data.submissionStatus == "submitted") {
      //   value.setIsActive(false);
      // }
      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );
      // invoiceCheck2(invoice_json);
      // typeSelection(response.data.invoiceDatafromConversation);

      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        console.log("submissionStatus");
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const typeSelection = (invoiceDatafromConversation) => {
    const invoiceVal = invoiceDatafromConversation;
    const invoiceValFromJson = value.invoiceData.invoiceType;

    if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
      const invoiceType = invoiceVal["invoiceType"];
      if (invoiceType) {
        const match = invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
    if (value.invoiceData.invoiceType) {
      if (value.invoiceData.invoiceType) {
        const match = value.invoiceData.invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
  };

  const updateItemDetails = (invoiceDatafromConversation) => {
    if (Object.keys(invoiceDatafromConversation).length > 0) {
      let updatedInvoiceData = { ...value.itemDetails };
      const items = invoiceDatafromConversation["items"];
      const quantity = invoiceDatafromConversation["quantity"];
      let arrayItems = [];
      let arrayQty = [];
      if (items && quantity) {
        updatedInvoiceData.items = items;
        arrayItems = items.split(", ").map((item) => item.trim());
        setItemsArray(arrayItems);
        updatedInvoiceData.quantity = quantity;
        arrayQty = quantity
          .split(", ")
          .map((quantity) => parseInt(quantity.trim(), 10));
        setQuantitiesArray(arrayQty);
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }

      const tempDictionary = {};
      arrayItems.forEach((item, index) => {
        tempDictionary[item] = arrayQty[index];
      });
      setDictionary(tempDictionary);
      value.setItemDetails(updatedInvoiceData);
      if (value.poDetailsData.length > 0) {
        updatePo();
      }
      // if (Object.keys(tempDictionary).length > 0) {
      //   // getPoDetails(value.invoiceData.poNumber, tempDictionary);

      // }
      //  const updatedItemsDetails = value.poDetailsData.map((item) => {
      //    if (tempDictionary[item.itemId] !== undefined) {
      //      // console.log("Inside ", dictionary[item.itemId]);
      //      return {
      //        ...item,
      //        invQty: tempDictionary[item.itemId],
      //        invAmt: parseInt(tempDictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
      //      };
      //    }
      //    return item;
      //  });
      //  // console.log("Updated", updatedItemsDetails);
      //  value.setPoDetailsData(updatedItemsDetails);
      // console.log(
      //   "Inside update item details",
      //   invoiceDatafromConversation,
      //   arrayItems,
      //   arrayQty,
      //   value.poDetailsData
      // );
    } else {
      value.setItemDetails({
        items: "",
        quantity: "",
      });
    }
  };
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    typeSelection(value.invoiceData);
    updateItemDetails(value.invoiceData);
  }, [value.invoiceData, value.invoiceData.invoiceType, value.poDetailsData]);
  const updatePo = () => {
    const data = convertItemDetailsToData(value.itemDetails);
    // console.log("Inside update po", value.itemDetails);
    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (data[item.itemId] !== undefined) {
        // console.log("Inside ", dictionary[item.itemId]);
        return {
          ...item,
          invQty: data[item.itemId],
          invAmt: parseInt(data[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
        };
      }
      return item;
    });
    // console.log("Updated", updatedItemsDetails);
    value.setPoDetailsData(updatedItemsDetails);
  };
  const convertItemDetailsToData = (itemDetails) => {
    const { items, quantity } = itemDetails;
    const itemArray = items.split(", ").map((item) => item.trim());
    const quantityArray = quantity
      .split(", ")
      .map((qty) => parseInt(qty.trim(), 10));

    const data = itemArray.reduce((acc, item, index) => {
      acc[item] = quantityArray[index];
      return acc;
    }, {});

    return data;
  };
  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };
  }, [dictionary, value.poDetailsData.length]);

  return (
    <Sheet
      className="imageBackground"
      sx={{
        height: "90vh", // Set initial height
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFAF3",
        overflowY: "auto",
        flexGrow: 1, // Allow growth only on large screens
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
          // overflowX: 'hidden'
        }}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            text={message.text}
            fromUser={message.fromUser}
          />
        ))}
        {value.modalVisible && pdfData && (
          <PdfCard
            title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
            invoiceID={pdfData.poHeaderData.invoiceNo}
          />
        )}
      </Box>
      <form
        onSubmit={handleMessageSubmit}
        id="form1"
        className="chatbot-input-form"
        style={{
          display: "flex",
          backgroundColor: "#283d76",
          borderRadius: "0.5rem",
        }}
      >
        <Add style={{ color: "white" }} />
        <Smiley style={{ color: "white" }} />
        <input
          id="inputValue"
          type="text"
          // type="submit"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            e.preventDefault();
            setInput(e.target.value);
          }}
          style={{ margin: "0.5rem", height: "2rem" }}
        />
        <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
    </Sheet>
  );
}

//27/06/2024 p-2
//27/06/2024
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
import React, { useEffect, useState, useContext, useRef } from "react";
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  // const [pdfData, setPdfData] = useState({poDetailsData:[],poHeaderData:{},invoiceData:{}});

  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function useChatScroll(dep) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [dep]);
    return ref;
  }
  const ref = useChatScroll(messages);

  const invoiceCheck = (invoiceObject) => {
    invoiceObject.split("\n").forEach((line) => {
      console.log("Line:", line);
      let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
      if (match_invoice_type) {
        console.log("Invoice type");
        value.setInvoiceData({
          ...value.invoiceData,
          invoiceType: match_invoice_type[1].trim(),
        });
      }

      let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
      if (match_datetime) {
        value.setInvoiceData({
          ...value.invoiceData,
          datetime: match_datetime[1].trim(),
        });
      }

      let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

      if (match_po_number) {
        console.log("inv");
        value.setInvoiceData({
          ...value.invoiceData,
          poNumber: match_po_number[1].trim(),
        });
      }

      let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
      if (match_total_amount) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalAmount: match_total_amount[1].trim(),
        });
      }

      let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
      if (match_total_tax) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalTax: match_total_tax[1].trim(),
        });
      }

      let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
      if (match_items) {
        value.setInvoiceData({
          ...value.invoiceData,
          items: match_items[1].trim(),
        });
      }

      let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
      if (match_quantity) {
        value.setInvoiceData({
          ...value.invoiceData,
          quantity: match_quantity[1].trim(),
        });
      }
    });
  };
  const invoiceCheck2 = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoice type" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "po number" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        // getPoDetails(invoiceObject[key]);
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
      }
      if (key === "supplier id" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "total amount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "date" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "total tax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };
  const extractAndSave = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoicetype" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "ponumber" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        // getPoDetails(invoiceObject[key]);

      }
      if (key === "supplierid" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
        // updateItemDetails(invoiceObject)
      }
      if (key === "totalamount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "datetime" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "totaltax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
        // updateItemDetails(invoiceObject)
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };
  const invoiceTypeSelection = () => {
    const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
    const regexPatternMerchandise = /merchandise/i;
    const regexPatternCreditNote = /credit\s*-?\s*note/i;
    const regexPatternDebitNote = /debit\s*-?\s*note/i;

    const invoiceVal = value.invoiceDatafromConversation;
    if (Object.keys(invoiceVal).length !== 0) {
      if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternNonMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: true,
          merchandise: false,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: true,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternCreditNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: true,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternDebitNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: false,
          debitNote: true,
        });
      }
      console.log("regex equal");
    } else {
      console.log("regex not equal");
    }
  };
  const getPoDetails = async (id, tempDictionary) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/poDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("PO response", response.data, tempDictionary);
      const poHeader = response.data.po_header;
      const updatedPoData = {
        ...value.poHeaderData,
        currency: poHeader.currency,
        totalCost: poHeader.totalCost,
        invoiceNo: "INV" + value.invoiceCounter,
        exchangeRate: 1,
        paymentTerm: poHeader.payment_term,
      };
      value.setPoHeaderData(updatedPoData);
      value.setPoDetailsData(response.data.po_details);
      const newUpdatedData = response.data.po_details.map((item) => ({
        ...item,
        invQty: 0,
        invAmt: 0,
      }));

      // updateItemDetails(value.invoiceData)
      value.setPoDetailsData(newUpdatedData);
      if (Object.keys(tempDictionary).length > 0) {
        const updatedItemsDetails = value.poDetailsData.map((item) => {
          if (tempDictionary[item.itemId] !== undefined) {
            // console.log("Inside ", dictionary[item.itemId]);
            return {
              ...item,
              invQty: tempDictionary[item.itemId],
              invAmt:
                parseInt(tempDictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
            };
          }
          return item;
        });
        console.log("Updated", updatedItemsDetails);
        value.setPoDetailsData(updatedItemsDetails);
      }
    } catch (error) {
      const updatedPoData = {
        ...value.poHeaderData,
        currency: "",
        totalCost: "",
        invoiceNo: "",
        paymentTerm: "",
      };
      value.setPoHeaderData(updatedPoData);
      console.log("Get Po Error:", error);
    }
  };
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    } else {
      console.log("Cannot format date");
    }
  }
  function sumQuantities(str) {
    if (str) {
      const quantitiesArray = str
        .split(",")
        .map((num) => parseInt(num.trim(), 10));
      const totalQuantity = quantitiesArray.reduce(
        (sum, current) => sum + current,
        0
      );

      // Update the object with the total quantity
      str = totalQuantity;
    }
    return str;
  }
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
  // console.log("Type of invoice", typeofInv);
  const invData = {
    invoiceId: value.poHeaderData.invoiceNo,
    supplierId: value.invoiceData.supplierId,
    invoiceType: typeofInv,
    currency: value.poHeaderData.currency,
    payment_term: value.poHeaderData.paymentTerm,
    invoice_status: "pending",
    total_cost: value.invoiceData.totalAmount,
    total_tax: value.invoiceData.totalTax,
    total_amount: value.invoiceData.totalAmount,
  };
  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    getPoDetails("");
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
    // setDictionary({});
    // typeSelection(value.invoiceDatafromConversation);
    // updateItemDetails(value.invoiceDatafromConversation);
    // updateItemDetails();
  };
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    try {
      console.log("Creation Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      await clearDataApi();
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    value.setIsActive(false);

    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };
  const [input, setInput] = useState("");
  console.log(
    "Extracted Data outside fn:",
    value.invoiceData,
    "itemDetails:",
    value.itemDetails,
    "context:",
    value
  );
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    if (value.modalVisible == true) {
      value.setModalVisible(false);
    }
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      // console.log("Context:", value);
      // console.log("Extracted Data:", value.extractedData);

      if (response.data.extractor_info != null) {
        const extractedData = JSON.parse(response.data.extractor_info);
        // setResponseData(extractedData.invoice_detail)
        console.log("inside if:", extractedData.invoice_detail);
        let invoiceObject = extractedData.invoice_detail;

        extractAndSave(invoiceObject);
        updateItemDetails(invoiceObject);
        typeSelection(invoiceObject);
      }
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
        clearDataApi();
      }
      // else if (response.data.submissionStatus == "submitted") {
      //   value.setIsActive(false);
      // }
      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );
      // invoiceCheck2(invoice_json);
      // typeSelection(response.data.invoiceDatafromConversation);

      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        console.log("submissionStatus");
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const typeSelection = (invoiceDatafromConversation) => {
    const invoiceVal = invoiceDatafromConversation;
    const invoiceValFromJson = value.invoiceData.invoiceType;

    if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
      const invoiceType = invoiceVal["invoiceType"];
      if (invoiceType) {
        const match = invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
    if (value.invoiceData.invoiceType) {
      if (value.invoiceData.invoiceType) {
        const match = value.invoiceData.invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
  };

  const updateItemDetails = (invoiceDatafromConversation) => {
    if (Object.keys(invoiceDatafromConversation).length > 0) {
      let updatedInvoiceData = { ...value.itemDetails };
      const items = invoiceDatafromConversation["items"];
      const quantity = invoiceDatafromConversation["quantity"];
      let arrayItems = [];
      let arrayQty = [];
      if (items && quantity) {
        updatedInvoiceData.items = items;
        arrayItems = items.split(", ").map((item) => item.trim());
        setItemsArray(arrayItems);
        updatedInvoiceData.quantity = quantity;
        arrayQty = quantity
          .split(", ")
          .map((quantity) => parseInt(quantity.trim(), 10));
        setQuantitiesArray(arrayQty);
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }

      const tempDictionary = {};
      arrayItems.forEach((item, index) => {
        tempDictionary[item] = arrayQty[index];
      });
      setDictionary(tempDictionary);
      value.setItemDetails(updatedInvoiceData);
      if (Object.keys(tempDictionary).length > 0) {
        getPoDetails(value.invoiceData.poNumber, tempDictionary);
      }

      //  const updatedItemsDetails = value.poDetailsData.map((item) => {
      //    if (tempDictionary[item.itemId] !== undefined) {
      //      // console.log("Inside ", dictionary[item.itemId]);
      //      return {
      //        ...item,
      //        invQty: tempDictionary[item.itemId],
      //        invAmt: parseInt(tempDictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
      //      };
      //    }
      //    return item;
      //  });
      //  // console.log("Updated", updatedItemsDetails);
      //  value.setPoDetailsData(updatedItemsDetails);
      console.log(
        "Inside update item details",
        invoiceDatafromConversation,
        arrayItems,
        arrayQty,
        value.poDetailsData
      );
    } else {
      value.setItemDetails({
        items: "",
        quantity: "",
      });
    }
  };
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    typeSelection(value.invoiceData);
    updateItemDetails(value.invoiceData);
  }, [value.invoiceData, value.invoiceData.invoiceType]);

  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };
    const updatePo = (data) => {
      const updatedItemsDetails = value.poDetailsData.map((item) => {
        if (data[item.itemId] !== undefined) {
          // console.log("Inside ", dictionary[item.itemId]);
          return {
            ...item,
            invQty: data[item.itemId],
            invAmt: parseInt(data[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
          };
        }
        return item;
      });
      // console.log("Updated", updatedItemsDetails);
      value.setPoDetailsData(updatedItemsDetails);
    };
  }, [dictionary, value.poDetailsData.length]);

  return (
    <Sheet
      className="imageBackground"
      sx={{
        height: "90vh", // Set initial height
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFAF3",
        overflowY: "auto",
        flexGrow: 1, // Allow growth only on large screens
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
          // overflowX: 'hidden'
        }}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            text={message.text}
            fromUser={message.fromUser}
          />
        ))}
        {value.modalVisible &&
          pdfData(
            <PdfCard
              title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
              invoiceID={pdfData.poHeaderData.invoiceNo}
            />
          )}
      </Box>
      <form
        onSubmit={handleMessageSubmit}
        id="form1"
        className="chatbot-input-form"
        style={{
          display: "flex",
          backgroundColor: "#283d76",
          borderRadius: "0.5rem",
        }}
      >
        <Add style={{ color: "white" }} />
        <Smiley style={{ color: "white" }} />
        <input
          id="inputValue"
          type="text"
          // type="submit"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            e.preventDefault();
            setInput(e.target.value);
          }}
          style={{ margin: "0.5rem", height: "2rem" }}
        />
        <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
    </Sheet>
  );
}

//27/06/2024


//26/06/2024
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
// import AvatarWithStatus from './AvatarWithStatus';
// import ChatBubble from './ChatBubble';
// import ChatbotPaneHeader from './ChatbotPaneHeader';
// import { ChatProps, MessageProps } from '../types/types';
import React, { useEffect, useState, useContext,useRef } from "react";
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData,setResponseData]=useState();
  // const [pdfData, setPdfData] = useState({poDetailsData:[],poHeaderData:{},invoiceData:{}});

  const messageEl = useRef(null);

  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function useChatScroll(dep) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [dep]);
    return ref;
  }
  const ref = useChatScroll(messages)


  const invoiceCheck = (invoiceObject) => {
    invoiceObject.split("\n").forEach((line) => {
      console.log("Line:", line);
      let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
      if (match_invoice_type) {
        console.log("Invoice type");
        value.setInvoiceData({
          ...value.invoiceData,
          invoiceType: match_invoice_type[1].trim(),
        });
      }

      let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
      if (match_datetime) {
        value.setInvoiceData({
          ...value.invoiceData,
          datetime: match_datetime[1].trim(),
        });
      }

      let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

      if (match_po_number) {
        console.log("inv");
        value.setInvoiceData({
          ...value.invoiceData,
          poNumber: match_po_number[1].trim(),
        });
      }

      let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
      if (match_total_amount) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalAmount: match_total_amount[1].trim(),
        });
      }

      let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
      if (match_total_tax) {
        value.setInvoiceData({
          ...value.invoiceData,
          totalTax: match_total_tax[1].trim(),
        });
      }

      let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
      if (match_items) {
        value.setInvoiceData({
          ...value.invoiceData,
          items: match_items[1].trim(),
        });
      }

      let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
      if (match_quantity) {
        value.setInvoiceData({
          ...value.invoiceData,
          quantity: match_quantity[1].trim(),
        });
      }
    });
  };
  const invoiceCheck2 = (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };

    Object.keys(invoiceObject).forEach((key) => {
      if (key === "invoice type" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceType = invoiceObject[key];
      }
      if (key === "po number" && invoiceObject[key] !== null) {
        updatedInvoiceData.poNumber = invoiceObject[key];
        getPoDetails(invoiceObject[key]);
      }
      if (key === "quantity" && invoiceObject[key] !== null) {
        updatedInvoiceData.quantity = invoiceObject[key];
      }
      if (key === "supplier id" && invoiceObject[key] !== null) {
        updatedInvoiceData.supplierId = invoiceObject[key];
      }
      if (key === "total amount" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalAmount = invoiceObject[key];
      }
      if (key === "date" && invoiceObject[key] !== null) {
        updatedInvoiceData.invoiceDate = invoiceObject[key];
      }
      if (key === "total tax" && invoiceObject[key] !== null) {
        updatedInvoiceData.totalTax = invoiceObject[key];
      }
      if (key === "items" && invoiceObject[key] !== null) {
        updatedInvoiceData.items = invoiceObject[key];
      }
    });
    value.setInvoiceData(updatedInvoiceData);
  };
  const invoiceTypeSelection = () => {
    const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
    const regexPatternMerchandise = /merchandise/i;
    const regexPatternCreditNote = /credit\s*-?\s*note/i;
    const regexPatternDebitNote = /debit\s*-?\s*note/i;

    const invoiceVal = value.invoiceDatafromConversation;
    if (Object.keys(invoiceVal).length !== 0) {
      if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternNonMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: true,
          merchandise: false,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternMerchandise
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: true,
          creditNote: false,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternCreditNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: true,
          debitNote: false,
        });
      } else if (
        value.invoiceDatafromConversation["Invoice type"].match(
          regexPatternDebitNote
        )
      ) {
        value.setTypeOfInvoice({
          nonMerchandise: false,
          merchandise: false,
          creditNote: false,
          debitNote: true,
        });
      }
      console.log("regex equal");
    } else {
      console.log("regex not equal");
    }
  };
  const getPoDetails = async (id) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/poDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("PO response", response.data);
      const poHeader = response.data.po_header;
      const updatedPoData = {
        ...value.poHeaderData,
        currency: poHeader.currency,
        totalCost: poHeader.totalCost,
        invoiceNo: "INV" + value.invoiceCounter,
        exchangeRate: 1,
        paymentTerm: poHeader.payment_term,
      };
      value.setPoHeaderData(updatedPoData);
      value.setPoDetailsData(response.data.po_details);
      const newUpdatedData = response.data.po_details.map((item) => ({
        ...item,
        invQty: 0,
        invAmt: 0,
      }));
      value.setPoDetailsData(newUpdatedData);
    } catch (error) {
      const updatedPoData = {
        ...value.poHeaderData,
        currency: "",
        totalCost: "",
        invoiceNo: "INV" + value.invoiceCounter,
        paymentTerm: "",
      };
      value.setPoHeaderData(updatedPoData);
      console.log("Get Po Error:", error);
    }
  };
  function formatDate(date) {
    // Define a regular expression to match date formats 'DD/MM/YYYY' or 'DD-MM-YYYY'
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];

      // Format the date as 'YYYY-MM-DD'
      return `${year}-${month}-${day}`;
    } else {
      // value.setInvoiceData({
      //   ...value.invoiceData,
      //   invoiceDate:"invalid date",
      // });
      console.log("Cannot format date");
      // throw new Error("Invalid date format. Please use 'DD/MM/YYYY' or 'DD-MM-YYYY'.");
    }
  }
  function sumQuantities(str) {
    // Check if the object and the quantity key exist
    if (str) {
      // Extract the quantity string
      // const quantities = obj.itemDetails.quantity;

      // Split the string by comma and convert each part to an integer
      const quantitiesArray = str
        .split(",")
        .map((num) => parseInt(num.trim(), 10));

      // Sum the integers
      const totalQuantity = quantitiesArray.reduce(
        (sum, current) => sum + current,
        0
      );

      // Update the object with the total quantity
      str = totalQuantity;
    }
    return str;
  }
  const typeofInv = Object.keys(value.typeOfInvoice).find(
    (key) => value.typeOfInvoice[key]
  );
  // console.log("Type of invoice", typeofInv);
  const invData = {
    invoiceId: value.poHeaderData.invoiceNo,
    supplierId: value.invoiceData.supplierId,
    invoiceType: typeofInv,
    currency: value.poHeaderData.currency,
    payment_term: value.poHeaderData.paymentTerm,
    invoice_status: "pending",
    total_cost: value.invoiceData.totalAmount,
    total_tax: value.invoiceData.totalTax,
    total_amount: value.invoiceData.totalAmount,
  };
  const createInvoice = () => {
    console.log("Create Invoice");
  };
  const clearFormData = () => {
    value.setinvoiceDatafromConversation({});
    value.setPoDetailsData([]);
    value.setInvoiceData({
      invoiceType: "",
      invoiceDate: "",
      poNumber: "",
      totalAmount: "",
      totalTax: "",
      items: "",
      quantity: "",
      supplierId: "",
    });
    value.setPoHeaderData({
      currency: "",
      paymentTerm: "",
      invoiceNo: "",
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
    });
    // setDictionary({});
    // typeSelection(value.invoiceDatafromConversation);
    // updateItemDetails(value.invoiceDatafromConversation);
    // updateItemDetails();
  };
  const invoiceDetailsCreation = async () => {
    try {
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
      }));
      console.log("Details Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invDetailsAdd/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: updatedInvoiceItems,
      });
      console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
    console.log("Creation invoice called");
    try {
      console.log("Creation Called");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          ...invData,
          invoicedate: formatDate(value.invoiceData.invoiceDate),
          total_qty: sumQuantities(value.itemDetails.quantity),
        },
      });
      console.log("invoice Creation Response:", response.data);
      await invoiceDetailsCreation();
      setPdfData(value);
      await clearDataApi();
    } catch (error) {
      console.log("Invoice Creation Error:", error, error.data);
    }
  };

  const clearDataApi = async () => {
    value.setModalVisible(true);
    try {
      console.log("clearDataApi");
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/clearData?submitted=submitted`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("invoice Clear Response:", response.data);
      clearFormData();
    } catch (error) {
      console.log("Invoice Clear Error:", error, error.data);
    }
  };
  const [input, setInput] = useState("");
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/creation/response?query=${input}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Data response", response.data);
      console.log("Context:", value);
      console.log("Extracted Data:",value.extractedData)

      if(response.data.extractor_info!=null){
        const extractedData=JSON.parse(response.data.extractor_info);
        // setResponseData(extractedData.invoice_detail)
        console.log("inside if:",extractedData.invoice_detail)
        let invoiceObject=extractedData.invoice_detail
        let updatedInvoiceData = { ...value.extractedData };
        Object.keys(invoiceObject).forEach((key) => {
          if (key === "invoicetype" && invoiceObject[key] !== null) {
            updatedInvoiceData.invoiceType = invoiceObject[key];
          }
          if (key === "ponumber" && invoiceObject[key] !== null) {
            updatedInvoiceData.poNumber = invoiceObject[key];
            getPoDetails(invoiceObject[key]);
          }
          if (key === "quantity" && invoiceObject[key] !== null) {
            updatedInvoiceData.quantity = invoiceObject[key];
          }
          // if (key === "supplierid" && invoiceObject[key] !== null) {
          //   updatedInvoiceData.supplierId = invoiceObject[key];
          // }
          if (key === "totalamount" && invoiceObject[key] !== null) {
            updatedInvoiceData.totalAmount = invoiceObject[key];
          }
          if (key === "datetime" && invoiceObject[key] !== null) {
            updatedInvoiceData.invoiceDate = invoiceObject[key];
          }
          if (key === "totaltax" && invoiceObject[key] !== null) {
            updatedInvoiceData.totalTax = invoiceObject[key];
          }
          if (key === "items" && invoiceObject[key] !== null) {
            updatedInvoiceData.items = invoiceObject[key];
          }
        });
        value.setExtractedData(updatedInvoiceData)

      }
      if (response.data.test_model_reply == "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply == "Fetch") {
        value.setIsActive(false);
      }
      else if (response.data.submissionStatus == "submitted") {
        value.setIsActive(false);
      }
      console.log("Conversation data:", response.data.conversation);
       const invoice_json = JSON.parse(response.data.invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );
      invoiceCheck2(invoice_json);
      typeSelection(response.data.invoiceDatafromConversation);
      updateItemDetails(response.data.invoiceDatafromConversation);
      const botReply = response.data.conversation.slice(-1);
      const reply = botReply[0].slice(5);
      const formattedConversation = response.data.conversation
        .slice(-1)
        .map((text, index) => (
          <ReactMarkdown key={index} className={"botText"}>
            {text.slice(5)}
          </ReactMarkdown>
        ));

      const formattedMessage = reply.split(/- /g).map((part, index) => {
        if (index === 0) {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else {
          // Add line break after each "- "
          return (
            <React.Fragment key={index}>
              <br />
              {`•${part}`}
            </React.Fragment>
          );
        }
      });
      setMessages([
        ...newMessages,
        { text: formattedConversation, fromUser: false },
      ]);

      
      console.log("Invoice Counter", value.invoiceCounter);
      if (response.data.submissionStatus == "submitted") {
        console.log("submissionStatus");
        value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        await invoiceHeaderCreation();
      } else {
        console.log("invoice Creation not submitted");
        value.setModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const defaultTheme = createTheme();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const typeSelection = (invoiceDatafromConversation) => {
    const invoiceVal = invoiceDatafromConversation;
    const invoiceValFromJson = value.invoiceData.invoiceType;

    if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
      const invoiceType = invoiceVal["Invoice type"];
      if (invoiceType) {
        const match = invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
    if (value.invoiceData.invoiceType) {
      if (value.invoiceData.invoiceType) {
        const match = value.invoiceData.invoiceType.match(regexPattern);
        if (match) {
          const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
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
  };
  
  const updateItemDetails = (invoiceDatafromConversation) => {
    // const invoiceVal = value.invoiceDatafromConversation;
    if (Object.keys(invoiceDatafromConversation).length > 0) {
      let updatedInvoiceData = { ...value.itemDetails };
      const items = invoiceDatafromConversation["Items"];
      const quantity = invoiceDatafromConversation["Quantity"];
      let arrayItems = [];
      let arrayQty = [];
      if (items && quantity) {
        updatedInvoiceData.items = items;
        arrayItems = items.split(", ").map((item) => item.trim());
        setItemsArray(arrayItems);
        updatedInvoiceData.quantity = quantity;
        arrayQty = quantity
          .split(", ")
          .map((quantity) => parseInt(quantity.trim(), 10));
        setQuantitiesArray(arrayQty);
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }
      const tempDictionary = {};
      arrayItems.forEach((item, index) => {
        tempDictionary[item] = arrayQty[index];
      });
      setDictionary(tempDictionary);
      value.setItemDetails(updatedInvoiceData);
    } else {
      value.setItemDetails({
        items: "",
        quantity: "",
      });
    }
  };
  // const updateItemDetails = () => {
  //   const invoiceVal = value.invoiceDatafromConversation;
  //   let updatedInvoiceData = { ...value.itemDetails };
  //   const items = invoiceVal["Items"];
  //   let arrayItems = [];
  //   let arrayQty = [];
  //   if (items) {
  //     updatedInvoiceData.items = items;
  //     arrayItems = items.split(", ").map((item) => item.trim());
  //     setItemsArray(arrayItems);
  //   }
  //   const quantity = invoiceVal["Quantity"];
  //   if (quantity) {
  //     updatedInvoiceData.quantity = quantity;
  //     arrayQty = quantity
  //       .split(", ")
  //       .map((quantity) => parseInt(quantity.trim(), 10));
  //     setQuantitiesArray(arrayQty);
  //   }
  //   const tempDictionary = {};
  //   arrayItems.forEach((item, index) => {
  //     tempDictionary[item] = arrayQty[index];
  //   });
  //   setDictionary(tempDictionary);
  //   value.setItemDetails(updatedInvoiceData);
  // };
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    typeSelection(value.invoiceDatafromConversation);
    updateItemDetails(value.invoiceDatafromConversation);
  }, [value.invoiceDatafromConversation,value.invoiceData.invoiceType]);

  useEffect(() => {
    // const updateDictionary = { it1: 23, it2: 34 };

    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (dictionary[item.itemId] !== undefined) {
        // console.log("Inside ", dictionary[item.itemId]);
        return {
          ...item,
          invQty: dictionary[item.itemId],
          invAmt: parseInt(dictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
        };
      }
      return item;
    });
    // console.log("Updated", updatedItemsDetails);
    value.setPoDetailsData(updatedItemsDetails);
  }, [dictionary, value.poDetailsData.length]);

  return (
    <Sheet
      className="imageBackground"
      sx={{
        height: "90vh", // Set initial height
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFAF3",
        overflowY: "auto",
        flexGrow: 1, // Allow growth only on large screens
      }}ref={messageEl}
    >
      <Box
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column ",
          padding: 2,
          justifyContent: "flex-end",
          // overflowX: 'hidden'
        }}
        
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            text={message.text}
            fromUser={message.fromUser}
          />
        ))}
        {value.modalVisible && (
          <PdfCard
            title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
            invoiceID={pdfData.poHeaderData.invoiceNo}
          />
        )}
      </Box>
      <form
        onSubmit={handleMessageSubmit}
        id="form1"
        className="chatbot-input-form"
        style={{
          display: "flex",
          backgroundColor: "#283d76",
          borderRadius: "0.5rem",
        }}
      >
        <Add style={{ color: "white" }} />
        <Smiley style={{ color: "white" }} />
        <input
          id="inputValue"
          type="text"
          // type="submit"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            e.preventDefault();
            setInput(e.target.value);
          }}
          style={{ margin: "0.5rem", height: "2rem" }}
        />
        <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
      </form>
    </Sheet>
  );
}

//26/06/2024

// //25/06/2024//
// import Box from "@mui/joy/Box";
// import Sheet from "@mui/joy/Sheet";
// import Stack from "@mui/joy/Stack";
// // import AvatarWithStatus from './AvatarWithStatus';
// // import ChatBubble from './ChatBubble';
// // import ChatbotPaneHeader from './ChatbotPaneHeader';
// // import { ChatProps, MessageProps } from '../types/types';
// import React, { useEffect, useState, useContext } from "react";
// import ChatMessage from "./ChatMessage";
// import "../styles/chatbot.css";
// import "../styles/general.css";
// import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
// import Add from "@mui/icons-material/AddCircle";
// import SendIcon from "@mui/icons-material/Send";
// import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import bgImage from "../images/bgImage.png";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";
// import axios from "axios";
// import { StyledModalRoot } from "@mui/joy/Modal/Modal";
// import PdfCard from "./PDF Generation/PdfCard";
// import ReactMarkdown from "react-markdown";
// export default function ChatbotPane() {
//   const [messages, setMessages] = useState([]);
//   const value = useContext(AuthContext);
//   const [itemsArray, setItemsArray] = useState();
//   const [quantitiesArray, setQuantitiesArray] = useState();
//   const [pdfData, setPdfData] = useState();
//   // const [pdfData, setPdfData] = useState({poDetailsData:[],poHeaderData:{},invoiceData:{}});

//   const invoiceCheck = (invoiceObject) => {
//     invoiceObject.split("\n").forEach((line) => {
//       console.log("Line:", line);
//       let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
//       if (match_invoice_type) {
//         console.log("Invoice type");
//         value.setInvoiceData({
//           ...value.invoiceData,
//           invoiceType: match_invoice_type[1].trim(),
//         });
//       }

//       let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
//       if (match_datetime) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           datetime: match_datetime[1].trim(),
//         });
//       }

//       let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

//       if (match_po_number) {
//         console.log("inv");
//         value.setInvoiceData({
//           ...value.invoiceData,
//           poNumber: match_po_number[1].trim(),
//         });
//       }

//       let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
//       if (match_total_amount) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           totalAmount: match_total_amount[1].trim(),
//         });
//       }

//       let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
//       if (match_total_tax) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           totalTax: match_total_tax[1].trim(),
//         });
//       }

//       let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
//       if (match_items) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           items: match_items[1].trim(),
//         });
//       }

//       let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
//       if (match_quantity) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           quantity: match_quantity[1].trim(),
//         });
//       }
//     });
//   };
//   const invoiceCheck2 = (invoiceObject) => {
//     let updatedInvoiceData = { ...value.invoiceData };

//     Object.keys(invoiceObject).forEach((key) => {
//       if (key === "invoice type" && invoiceObject[key] !== null) {
//         updatedInvoiceData.invoiceType = invoiceObject[key];
//       }
//       if (key === "po number" && invoiceObject[key] !== null) {
//         updatedInvoiceData.poNumber = invoiceObject[key];
//         getPoDetails(invoiceObject[key]);
//       }
//       if (key === "quantity" && invoiceObject[key] !== null) {
//         updatedInvoiceData.quantity = invoiceObject[key];
//       }
//       if (key === "supplier id" && invoiceObject[key] !== null) {
//         updatedInvoiceData.supplierId = invoiceObject[key];
//       }
//       if (key === "total amount" && invoiceObject[key] !== null) {
//         updatedInvoiceData.totalAmount = invoiceObject[key];
//       }
//       if (key === "date" && invoiceObject[key] !== null) {
//         updatedInvoiceData.invoiceDate = invoiceObject[key];
//       }
//       if (key === "total tax" && invoiceObject[key] !== null) {
//         updatedInvoiceData.totalTax = invoiceObject[key];
//       }
//       if (key === "items" && invoiceObject[key] !== null) {
//         updatedInvoiceData.items = invoiceObject[key];
//       }
//     });
//     value.setInvoiceData(updatedInvoiceData);
//   };
//   const invoiceTypeSelection = () => {
//     const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
//     const regexPatternMerchandise = /merchandise/i;
//     const regexPatternCreditNote = /credit\s*-?\s*note/i;
//     const regexPatternDebitNote = /debit\s*-?\s*note/i;

//     const invoiceVal = value.invoiceDatafromConversation;
//     if (Object.keys(invoiceVal).length !== 0) {
//       if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternNonMerchandise
//         )
//       ) {
//         value.setTypeOfInvoice({
//           nonMerchandise: true,
//           merchandise: false,
//           creditNote: false,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternMerchandise
//         )
//       ) {
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: true,
//           creditNote: false,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternCreditNote
//         )
//       ) {
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: false,
//           creditNote: true,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternDebitNote
//         )
//       ) {
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: false,
//           creditNote: false,
//           debitNote: true,
//         });
//       }
//       console.log("regex equal");
//     } else {
//       console.log("regex not equal");
//     }
//   };
//   const getPoDetails = async (id) => {
//     // console.log("po id:", id);
//     try {
//       const response = await axios({
//         method: "get",
//         url: `http://localhost:8000/poDetails/${id}`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//         },
//       });
//       // console.log("PO response", response.data);
//       const poHeader = response.data.po_header;
//       const updatedPoData = {
//         ...value.poHeaderData,
//         currency: poHeader.currency,
//         totalCost: poHeader.totalCost,
//         invoiceNo: "INV" + value.invoiceCounter,
//         exchangeRate: 1,
//         paymentTerm: poHeader.payment_term,
//       };
//       value.setPoHeaderData(updatedPoData);
//       value.setPoDetailsData(response.data.po_details);
//       updatePoDetails(response.data.po_details);
//       const newUpdatedData = response.data.po_details.map((item) => ({
//         ...item,
//         invQty: 0,
//         invAmt: 0,
//       }));
//       value.setPoDetailsData(newUpdatedData);
//     } catch (error) {
//       const updatedPoData = {
//         ...value.poHeaderData,
//         currency: "",
//         totalCost: "",
//         invoiceNo: "INV" + value.invoiceCounter,
//         paymentTerm: "",
//       };
//       value.setPoHeaderData(updatedPoData);
//       value.setPoDetailsData([]);
//       console.log("Get Po Error:", error);
//     }
//   };
//   function formatDate(date) {
//     // Define a regular expression to match date formats 'DD/MM/YYYY' or 'DD-MM-YYYY'
//     const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
//     const match = date.match(regex);

//     if (match) {
//       const day = match[1];
//       const month = match[2];
//       const year = match[3];

//       // Format the date as 'YYYY-MM-DD'
//       return `${year}-${month}-${day}`;
//     } else {
//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   invoiceDate:"invalid date",
//       // });
//       console.log("Cannot format date");
//       // throw new Error("Invalid date format. Please use 'DD/MM/YYYY' or 'DD-MM-YYYY'.");
//     }
//   }
//   function sumQuantities(str) {
//     // Check if the object and the quantity key exist
//     if (str) {
//       // Extract the quantity string
//       // const quantities = obj.itemDetails.quantity;

//       // Split the string by comma and convert each part to an integer
//       const quantitiesArray = str
//         .split(",")
//         .map((num) => parseInt(num.trim(), 10));

//       // Sum the integers
//       const totalQuantity = quantitiesArray.reduce(
//         (sum, current) => sum + current,
//         0
//       );

//       // Update the object with the total quantity
//       str = totalQuantity;
//     }
//     return str;
//   }
//   const typeofInv = Object.keys(value.typeOfInvoice).find(
//     (key) => value.typeOfInvoice[key]
//   );
//   // console.log("Type of invoice", typeofInv);
//   const invData = {
//     invoiceId: value.poHeaderData.invoiceNo,
//     supplierId: value.invoiceData.supplierId,
//     invoiceType: typeofInv,
//     currency: value.poHeaderData.currency,
//     payment_term: value.poHeaderData.paymentTerm,
//     invoice_status: "pending",
//     total_cost: value.invoiceData.totalAmount,
//     total_tax: value.invoiceData.totalTax,
//     total_amount: value.invoiceData.totalAmount,
//   };
//   const createInvoice = () => {
//     console.log("Create Invoice");
//   };
//   const clearFormData = () => {
//     value.setinvoiceDatafromConversation({});
//     value.setPoDetailsData([]);
//     value.setInvoiceData({
//       invoiceType: "",
//       invoiceDate: "",
//       poNumber: "",
//       totalAmount: "",
//       totalTax: "",
//       items: "",
//       quantity: "",
//       supplierId: "",
//     });
//     value.setPoHeaderData({
//       currency: "",
//       paymentTerm: "",
//       invoiceNo: "",
//       totalCost: "",
//       exchangeRate: "",
//     });
//     value.setTypeOfInvoice({
//       merchandise: false,
//       nonMerchandise: false,
//       debitNote: false,
//       creditNote: false,
//     });
//     value.setItemDetails({
//       items: "",
//       quantity: "",
//     });
//     setDictionary({});
//     typeSelection(value.invoiceDatafromConversation);
//     updateItemDetails(value.invoiceDatafromConversation);
//     // getPoDetails(value.invoiceData.poNumber);
//     // updatePoDetails(value.poDetailsData);
//     // updateItemDetails();
//   };
//   const invoiceDetailsCreation = async () => {
//     try {
//       const updatedInvoiceItems = value.poDetailsData.map((item) => ({
//         ...item,
//         invoiceNumber: value.poHeaderData.invoiceNo,
//       }));
//       console.log("Details Called");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/invDetailsAdd/`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//         data: updatedInvoiceItems,
//       });
//       console.log("invoice Details Creation Response:", response.data);
//     } catch (error) {
//       console.log("Invoice DEtails Creation Error:", error, error.data);
//     }
//   };
//   const invoiceHeaderCreation = async () => {
//     console.log("Creation invoice called");
//     try {
//       console.log("Creation Called");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/invCreation/`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//         data: {
//           ...invData,
//           invoicedate: formatDate(value.invoiceData.invoiceDate),
//           total_qty: sumQuantities(value.itemDetails.quantity),
//         },
//       });
//       console.log("invoice Creation Response:", response.data);
//       await invoiceDetailsCreation();
//       setPdfData(value);
//       await clearDataApi();
//     } catch (error) {
//       console.log("Invoice Creation Error:", error, error.data);
//     }
//   };

//   const clearDataApi = async () => {
//     value.setModalVisible(true);
//     try {
//       console.log("clearDataApi");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/clearData?submitted=submitted`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//       });
//       console.log("invoice Clear Response:", response.data);
//       clearFormData();
//     } catch (error) {
//       console.log("Invoice Clear Error:", error, error.data);
//     }
//   };
//   const [input, setInput] = useState("");
//   const handleMessageSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     const newMessages = [...messages, { text: input, fromUser: true }];
//     setMessages(newMessages);
//     setInput("");
//     try {
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/creation/response?query=${input}`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       console.log("Data response", response.data);
//       console.log("Context:", value);
//       if (response.data.test_model_reply == "Creation") {
//         value.setIsActive(true);
//       } else if (response.data.test_model_reply == "Fetch") {
//         value.setIsActive(false);
//       }
//       console.log("Conversation data:", response.data.conversation);
//       typeSelection(response.data.invoiceDatafromConversation);
//       updateItemDetails(response.data.invoiceDatafromConversation);
//       const botReply = response.data.conversation.slice(-1);
//       const reply = botReply[0].slice(5, -1);
//       const formattedConversation = response.data.conversation
//         .slice(-1)
//         .map((text, index) => (
//           <ReactMarkdown key={index} className={"botText"}>
//             {text.slice(5, -1)}
//           </ReactMarkdown>
//         ));

//       const formattedMessage = reply.split(/- /g).map((part, index) => {
//         if (index === 0) {
//           return <React.Fragment key={index}>{part}</React.Fragment>;
//         } else {
//           // Add line break after each "- "
//           return (
//             <React.Fragment key={index}>
//               <br />
//               {`•${part}`}
//             </React.Fragment>
//           );
//         }
//       });
//       const invoice_json = JSON.parse(response.data.invoice_json);
//       setMessages([
//         ...newMessages,
//         { text: formattedConversation, fromUser: false },
//       ]);
//       invoiceCheck2(invoice_json);

//       value.setinvoiceDatafromConversation(
//         response.data.invoiceDatafromConversation
//       );
//       console.log("Invoice Counter", value.invoiceCounter);
//       if (response.data.submissionStatus == "submitted") {
//         console.log("submissionStatus");
//         value.setInvoiceCounter((prevCounter) => prevCounter + 1);
//         await invoiceHeaderCreation();
//       } else {
//         console.log("invoice Creation not submitted");
//         value.setModalVisible(false);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   const defaultTheme = createTheme();
//   const theme = useTheme();
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
//   const regexPattern =
//     /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
//   const typeSelection = (invoiceDatafromConversation) => {
//     const invoiceVal = invoiceDatafromConversation;
//     const invoiceValFromJson = value.invoiceData.invoiceType;

//     if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
//       const invoiceType = invoiceVal["Invoice type"];
//       if (invoiceType) {
//         const match = invoiceType.match(regexPattern);
//         if (match) {
//           const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
//           value.setTypeOfInvoice({
//             nonMerchandise: !!nonMerchandise,
//             merchandise: !!merchandise,
//             creditNote: !!creditNote,
//             debitNote: !!debitNote,
//           });
//         } else {
//           value.setTypeOfInvoice({
//             nonMerchandise: false,
//             merchandise: false,
//             creditNote: false,
//             debitNote: false,
//           });
//         }
//       }
//     }
//     if (invoiceValFromJson) {
//       if (invoiceValFromJson) {
//         const match = invoiceValFromJson.match(regexPattern);
//         if (match) {
//           const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
//           value.setTypeOfInvoice({
//             nonMerchandise: !!nonMerchandise,
//             merchandise: !!merchandise,
//             creditNote: !!creditNote,
//             debitNote: !!debitNote,
//           });
//         } else {
//           value.setTypeOfInvoice({
//             nonMerchandise: false,
//             merchandise: false,
//             creditNote: false,
//             debitNote: false,
//           });
//         }
//       }
//     }
//   };
//   const updateItemDetails = (invoiceDatafromConversation) => {
//     // const invoiceVal = value.invoiceDatafromConversation;
//     if (Object.keys(invoiceDatafromConversation).length > 0) {
//       let updatedInvoiceData = { ...value.itemDetails };
//       const items = invoiceDatafromConversation["Items"];
//       const quantity = invoiceDatafromConversation["Quantity"];
//       let arrayItems = [];
//       let arrayQty = [];
//       if (items && quantity) {
//         updatedInvoiceData.items = items;
//         arrayItems = items.split(", ").map((item) => item.trim());
//         setItemsArray(arrayItems);
//         updatedInvoiceData.quantity = quantity;
//         arrayQty = quantity
//           .split(", ")
//           .map((quantity) => parseInt(quantity.trim(), 10));
//         setQuantitiesArray(arrayQty);
//       } else {
//         value.setItemDetails({
//           items: "",
//           quantity: "",
//         });
//       }
//       const tempDictionary = {};
//       arrayItems.forEach((item, index) => {
//         tempDictionary[item] = arrayQty[index];
//       });
//       setDictionary(tempDictionary);
//       value.setItemDetails(updatedInvoiceData);
//     } else {
//       value.setItemDetails({
//         items: "",
//         quantity: "",
//       });
//     }
//   };
//   // const updateItemDetails = () => {
//   //   const invoiceVal = value.invoiceDatafromConversation;
//   //   let updatedInvoiceData = { ...value.itemDetails };
//   //   const items = invoiceVal["Items"];
//   //   let arrayItems = [];
//   //   let arrayQty = [];
//   //   if (items) {
//   //     updatedInvoiceData.items = items;
//   //     arrayItems = items.split(", ").map((item) => item.trim());
//   //     setItemsArray(arrayItems);
//   //   }
//   //   const quantity = invoiceVal["Quantity"];
//   //   if (quantity) {
//   //     updatedInvoiceData.quantity = quantity;
//   //     arrayQty = quantity
//   //       .split(", ")
//   //       .map((quantity) => parseInt(quantity.trim(), 10));
//   //     setQuantitiesArray(arrayQty);
//   //   }
//   //   const tempDictionary = {};
//   //   arrayItems.forEach((item, index) => {
//   //     tempDictionary[item] = arrayQty[index];
//   //   });
//   //   setDictionary(tempDictionary);
//   //   value.setItemDetails(updatedInvoiceData);
//   // };
//   const [dictionary, setDictionary] = useState({});

//   useEffect(() => {
//     // if (value.invoiceData.poNumber) {
//     //   getPoDetails(value.invoiceData.poNumber);
//     //   updatePoDetails(value.poDetailsData);
//     // }
//     typeSelection(value.invoiceDatafromConversation);
//     updateItemDetails(value.invoiceDatafromConversation);
//   }, [
//     value.invoiceDatafromConversation,
//     // value.itemDetails,

//     // value.invoiceData.poNumber,
//   ]);
//   useEffect(() => {}, [value.poDetailsData, dictionary,value.poHeaderData]);

//   const updatePoDetails = (poDetailsData) => {
//     const updatedItemsDetails = poDetailsData.map((item) => {
//       if (dictionary[item.itemId] !== undefined) {
//         // console.log("Inside ", dictionary[item.itemId]);
//         return {
//           ...item,
//           invQty: dictionary[item.itemId],
//           invAmt: parseInt(dictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
//         };
//       }
//       return item;
//     });
//     value.setPoDetailsData(updatedItemsDetails);
//   };

//   return (
//     <Sheet
//       className="imageBackground"
//       sx={{
//         height: "90vh", // Set initial height
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#FFFAF3",
//         overflowY: "auto",
//         flexGrow: 1, // Allow growth only on large screens
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           flex: 1,
//           flexDirection: "column ",
//           padding: 2,
//           justifyContent: "flex-end",
//         }}
//       >
//         {messages.map((message, index) => (
//           <ChatMessage
//             key={index}
//             text={message.text}
//             fromUser={message.fromUser}
//           />
//         ))}
//         {value.modalVisible && (
//           <PdfCard
//             title={"Invoice Number: " + pdfData.poHeaderData.invoiceNo}
//             invoiceID={pdfData.poHeaderData.invoiceNo}
//           />
//         )}
//       </Box>
//       <form
//         onSubmit={handleMessageSubmit}
//         id="form1"
//         className="chatbot-input-form"
//         style={{
//           display: "flex",
//           backgroundColor: "#283d76",
//           borderRadius: "0.5rem",
//         }}
//       >
//         <Add style={{ color: "white" }} />
//         <Smiley style={{ color: "white" }} />
//         <input
//           id="inputValue"
//           type="text"
//           // type="submit"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => {
//             e.preventDefault();
//             setInput(e.target.value);
//           }}
//           style={{ margin: "0.5rem", height: "2rem" }}
//         />
//         <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
//         <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
//       </form>
//     </Sheet>
//   );
// }

// //25/06/2024//
// //24/06/2024//
// import Box from "@mui/joy/Box";
// import Sheet from "@mui/joy/Sheet";
// import Stack from "@mui/joy/Stack";
// // import AvatarWithStatus from './AvatarWithStatus';
// // import ChatBubble from './ChatBubble';
// // import ChatbotPaneHeader from './ChatbotPaneHeader';
// // import { ChatProps, MessageProps } from '../types/types';
// import React, { useEffect, useState, useContext } from "react";
// import ChatMessage from "./ChatMessage";
// import "../styles/chatbot.css";
// import "../styles/general.css";
// import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
// import Add from "@mui/icons-material/AddCircle";
// import SendIcon from "@mui/icons-material/Send";
// import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import bgImage from "../images/bgImage.png";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";
// import axios from "axios";
// import { StyledModalRoot } from "@mui/joy/Modal/Modal";
// import PdfCard from "./PDF Generation/PdfCard";
// import ReactMarkdown from "react-markdown";
// export default function ChatbotPane() {
//   const [messages, setMessages] = useState([]);
//   const value = useContext(AuthContext);
//   // const [counter,setCounter] = useState(value.invoiceCounter);
//   const [itemsArray, setItemsArray] = useState();
//   const [quantitiesArray, setQuantitiesArray] = useState();
//   const [pdfNumber, setPdfNumber] = useState();

//   const invoiceCheck = (invoiceObject) => {
//     invoiceObject.split("\n").forEach((line) => {
//       console.log("Line:", line);
//       let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
//       if (match_invoice_type) {
//         console.log("Invoice type");
//         value.setInvoiceData({
//           ...value.invoiceData,
//           invoiceType: match_invoice_type[1].trim(),
//         });
//       }

//       let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
//       if (match_datetime) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           datetime: match_datetime[1].trim(),
//         });
//       }

//       let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

//       if (match_po_number) {
//         console.log("inv");
//         value.setInvoiceData({
//           ...value.invoiceData,
//           poNumber: match_po_number[1].trim(),
//         });
//       }

//       let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
//       if (match_total_amount) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           totalAmount: match_total_amount[1].trim(),
//         });
//       }

//       let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
//       if (match_total_tax) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           totalTax: match_total_tax[1].trim(),
//         });
//       }

//       let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
//       if (match_items) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           items: match_items[1].trim(),
//         });
//       }

//       let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
//       if (match_quantity) {
//         value.setInvoiceData({
//           ...value.invoiceData,
//           quantity: match_quantity[1].trim(),
//         });
//       }
//     });
//   };
//   const invoiceCheck2 = (invoiceObject) => {
//     // console.log("Invoice object:", invoiceObject);

//     // Create a temporary object to hold updated invoice data
//     let updatedInvoiceData = { ...value.invoiceData };

//     Object.keys(invoiceObject).forEach((key) => {
//       if (key === "invoice type" && invoiceObject[key] !== null) {
//         updatedInvoiceData.invoiceType = invoiceObject[key];
//       }
//       if (key === "po number" && invoiceObject[key] !== null) {
//         updatedInvoiceData.poNumber = invoiceObject[key];
//         getPoDetails(invoiceObject[key]);
//       }
//       if (key === "quantity" && invoiceObject[key] !== null) {
//         updatedInvoiceData.quantity = invoiceObject[key];
//       }
//       if (key === "supplier id" && invoiceObject[key] !== null) {
//         updatedInvoiceData.supplierId = invoiceObject[key];
//       }
//       if (key === "total amount" && invoiceObject[key] !== null) {
//         updatedInvoiceData.totalAmount = invoiceObject[key];
//       }
//       if (key === "date" && invoiceObject[key] !== null) {
//         updatedInvoiceData.invoiceDate = invoiceObject[key];
//       }
//       if (key === "total tax" && invoiceObject[key] !== null) {
//         updatedInvoiceData.totalTax = invoiceObject[key];
//       }
//       if (key === "items" && invoiceObject[key] !== null) {
//         updatedInvoiceData.items = invoiceObject[key];
//       }
//       // Add similar conditions for other keys...
//     });

//     // Update the context with the updatedInvoiceData object
//     value.setInvoiceData(updatedInvoiceData);
//   };
//   const invoiceTypeSelection = () => {
//     const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
//     const regexPatternMerchandise = /merchandise/i;
//     const regexPatternCreditNote = /credit\s*-?\s*note/i;
//     const regexPatternDebitNote = /debit\s*-?\s*note/i;

//     const invoiceVal = value.invoiceDatafromConversation;
//     if (Object.keys(invoiceVal).length !== 0) {
//       if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternNonMerchandise
//         )
//       ) {
//         value.setTypeOfInvoice({
//           nonMerchandise: true,
//           merchandise: false,
//           creditNote: false,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternMerchandise
//         )
//       ) {
//         // value.setTypeOfInvoice({...value.typeOfInvoice,merchandise:true})
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: true,
//           creditNote: false,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternCreditNote
//         )
//       ) {
//         // value.setTypeOfInvoice({...value.typeOfInvoice,creditNote:true})
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: false,
//           creditNote: true,
//           debitNote: false,
//         });
//       } else if (
//         value.invoiceDatafromConversation["Invoice type"].match(
//           regexPatternDebitNote
//         )
//       ) {
//         // value.setTypeOfInvoice({...value.typeOfInvoice,debitNote:true})
//         value.setTypeOfInvoice({
//           nonMerchandise: false,
//           merchandise: false,
//           creditNote: false,
//           debitNote: true,
//         });
//       }
//       console.log("regex equal");
//     } else {
//       console.log("regex not equal");
//     }
//   };
//   const getPoDetails = async (id) => {
//     console.log("po id:", id);
//     // value.setInvoiceData({...value.invoiceData,poNumber:id})
//     try {
//       const response = await axios({
//         method: "get",
//         url: `http://localhost:8000/poDetails/${id}`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//         },
//       });
//       console.log("PO response", response.data);
//       const poHeader = response.data.po_header;

//       // Create a new object with updated values
//       const updatedPoData = {
//         ...value.poHeaderData,
//         currency: poHeader.currency,
//         totalCost: poHeader.totalCost,
//         invoiceNo: "INV" + value.invoiceCounter,
//         exchangeRate: 1,
//         paymentTerm: poHeader.payment_term,
//       };
//       value.setPoHeaderData(updatedPoData);
//       value.setPoDetailsData(response.data.po_details);
//       // console.log("Po details:", response.data.po_details);
//       const newUpdatedData = response.data.po_details.map((item) => ({
//         ...item,
//         invQty: 0,
//         invAmt: 0,
//       }));
//       value.setPoDetailsData(newUpdatedData);

//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   currency: response.data.po_header.currency,
//       // });
//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   invoiceNo:"INV" + counter,
//       // });
//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   totalCost: response.data.po_header.totalCost,
//       // });
//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   paymentTerm:response.data.po_header.payment_term,
//       // });
//       // let updatedInvoiceData = { ...value.invoiceData };
//       // updatedInvoiceData.paymentTerm = response.data.po_header.payment_term
//       // updatedInvoiceData.poNumber = id
//       // updatedInvoiceData.currency = response.data.po_header.currency
//       // updatedInvoiceData.invoiceNo = "INV" + counter
//       // updatedInvoiceData.totalCost = response.data.po_header.totalCost
//       // value.setInvoiceData(updatedInvoiceData);
//     } catch (error) {
//       const updatedPoData = {
//         ...value.poHeaderData,
//         currency: "",
//         totalCost: "",
//         invoiceNo: "INV" + value.invoiceCounter,
//         paymentTerm: "",
//       };
//       value.setPoHeaderData(updatedPoData);
//       console.log("Get Po Error:", error);
//     }
//   };
//   // function formatDate(date) {
//   //   const d = new Date(date);
//   //   const year = d.getFullYear();
//   //   const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
//   //   const day = String(d.getDate()).padStart(2, "0");

//   //   return `${year}-${month}-${day}`;
//   // }
//   function formatDate(date) {
//     // Define a regular expression to match date formats 'DD/MM/YYYY' or 'DD-MM-YYYY'
//     const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
//     const match = date.match(regex);

//     if (match) {
//       const day = match[1];
//       const month = match[2];
//       const year = match[3];

//       // Format the date as 'YYYY-MM-DD'
//       return `${year}-${month}-${day}`;
//     } else {
//       // value.setInvoiceData({
//       //   ...value.invoiceData,
//       //   invoiceDate:"invalid date",
//       // });
//       console.log("Cannot format date");
//       // throw new Error("Invalid date format. Please use 'DD/MM/YYYY' or 'DD-MM-YYYY'.");
//     }
//   }
//   function sumQuantities(str) {
//     // Check if the object and the quantity key exist
//     if (str) {
//       // Extract the quantity string
//       // const quantities = obj.itemDetails.quantity;

//       // Split the string by comma and convert each part to an integer
//       const quantitiesArray = str
//         .split(",")
//         .map((num) => parseInt(num.trim(), 10));

//       // Sum the integers
//       const totalQuantity = quantitiesArray.reduce(
//         (sum, current) => sum + current,
//         0
//       );

//       // Update the object with the total quantity
//       str = totalQuantity;
//     }
//     return str;
//   }
//   const typeofInv = Object.keys(value.typeOfInvoice).find(
//     (key) => value.typeOfInvoice[key]
//   );
//   console.log("Type of invoice", typeofInv);
//   const invData = {
//     invoiceId: value.poHeaderData.invoiceNo,
//     // invoicedate: formatDate(new Date()),
//     // invoicedate: formatDate(value.invoiceData.invoiceDate),
//     supplierId: value.invoiceData.supplierId,
//     invoiceType: typeofInv,
//     currency: value.poHeaderData.currency,
//     payment_term: value.poHeaderData.paymentTerm,
//     invoice_status: "pending",
//     // total_qty: "0",
//     total_cost: value.invoiceData.totalAmount,
//     total_tax: value.invoiceData.totalTax,
//     total_amount: value.invoiceData.totalAmount,
//   };
//   // console.log("inv", invData);

//   const createInvoice = () => {
//     console.log("Create Invoice");
//   };
//   const clearFormData = () => {
//     value.setinvoiceDatafromConversation({});
//     value.setPoDetailsData([]);
//     value.setInvoiceData({
//       invoiceType: "",
//       invoiceDate: "",
//       poNumber: "",
//       totalAmount: "",
//       totalTax: "",
//       items: "",
//       quantity: "",
//       supplierId: "",
//     });
//     value.setPoHeaderData({
//       currency: "",
//       paymentTerm: "",
//       invoiceNo: "",
//       totalCost: "",
//       exchangeRate: "",
//     });
//     value.setTypeOfInvoice({
//       merchandise: false,
//       nonMerchandise: false,
//       debitNote: false,
//       creditNote: false,
//     });
//     value.setItemDetails({
//       items: "",
//       quantity: "",
//     });
//     // value.setPoHeaderData({
//     //   currency: "",
//     //   paymentTerm: "",
//     //   invoiceNo: "",
//     //   totalCost: "",
//     // });
//   };

//   const invoiceCreation = async () => {
//     console.log("Creation invoice called");
//     try {
//       console.log("Creation Called");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/invCreation/`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//         data: {
//           ...invData,
//           invoicedate: formatDate(value.invoiceData.invoiceDate),
//           total_qty: sumQuantities(value.itemDetails.quantity),
//         },
//       });
//       console.log("invoice Creation Response:", response.data);
//       setPdfNumber(value.poHeaderData.invoiceNo);
//       await clearDataApi();
//     } catch (error) {
//       console.log("Invoice Creation Error:", error, error.data);
//     }
//   };

//   const clearDataApi = async () => {
//     value.setModalVisible(true);
//     try {
//       console.log("clearDataApi");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/clearData?submitted=submitted`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//         // params:"submitted",
//         // data:"submitted",
//       });
//       console.log("invoice Clear Response:", response.data);
//       clearFormData();
//     } catch (error) {
//       console.log("Invoice Clear Error:", error, error.data);
//     }
//   };
//   const [input, setInput] = useState("");
//   const handleMessageSubmit = async (e) => {
//     console.log("Context:", value);
//     // console.log(value.isActive);
//     e.preventDefault();
//     if (!input.trim()) return;
//     const newMessages = [...messages, { text: input, fromUser: true }];
//     setMessages(newMessages);
//     setInput("");
//     // console.log(input);
//     try {
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/creation/response?query=${input}`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       console.log("Data response", response.data);
//       if (response.data.test_model_reply == "Creation") {
//         value.setIsActive(true);
//       } else if (response.data.test_model_reply == "Fetch") {
//         value.setIsActive(false);
//       }
//       // if (response.data.action == "create invoice") {
//       //   value.setIsActive(true);
//       // } else {
//       //   value.setIsActive(false);
//       // }

//       console.log("Conversation data:", response.data.conversation);
//       const botReply = response.data.conversation.slice(-1);
//       // setMessagesConv(JSON.stringify(response.data.conversation))
//       const reply = botReply[0].slice(5, -1);
//       // const splitMessage =
//       //   "You can provide all the information at once, separated by commas like this";
//       const formattedConversation = response.data.conversation
//         .slice(-1)
//         .map((text, index) => (
//           <ReactMarkdown key={index} className={"botText"}>
//             {text.slice(5, -1)}
//           </ReactMarkdown>
//         ));

//       const formattedMessage = reply.split(/- /g).map((part, index) => {
//         if (index === 0) {
//           return <React.Fragment key={index}>{part}</React.Fragment>;
//         } else {
//           // Add line break after each "- "
//           return (
//             <React.Fragment key={index}>
//               <br />
//               {`•${part}`}
//             </React.Fragment>
//           );
//         }
//       });
//       // console.log("botReply", reply);
//       const invoice_json = JSON.parse(response.data.invoice_json);
//       setMessages([
//         ...newMessages,
//         { text: formattedConversation, fromUser: false },
//       ]);
//       // window.location.reload(false);
//       // console.log("Context",value.invoiceData)
//       invoiceCheck2(invoice_json);
//       // invoiceTypeSelection();
//       value.setinvoiceDatafromConversation(
//         response.data.invoiceDatafromConversation
//       );
//       console.log("Invoice Counter", value.invoiceCounter);
//       if (response.data.submissionStatus == "submitted") {
//         console.log("submissionStatus");
//         // let invoiceCreationCounter=value.invoiceCounter+1;
//         value.setInvoiceCounter((prevCounter) => prevCounter + 1);

//         await invoiceCreation();
//         // await clearDataApi();
//       } else {
//         console.log("invoice Creation not submitted");
//         value.setModalVisible(false);
//         // value.setInvoiceCounter(prevCounter => prevCounter + 1);

//         // clearFormData();
//         // await clearDataApi();
//       }
//     } catch (error) {
//       // const botReply = "Hello,user";
//       // setMessages([...newMessages, { text: botReply, fromUser: false }]);
//       console.error("Error fetching data:", error);
//     }
//   };
//   const defaultTheme = createTheme();
//   // if(value.formSave==true){
//   //     handleMessageSubmit()
//   //   }
//   const theme = useTheme();
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
//   useEffect(() => {
//     // const newMessages = [
//     //   ...messages,
//     //   { text: "Hi, how can I help you?", fromUser: false },
//     // ];
//     // setMessages(newMessages);
//     // console.log("context:", value.invoiceData);
//   }, []);
//   const regexPattern =
//     /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;

//   // Run the function whenever value.invoiceDatafromConversation changes
//   //   const typeSelection = () => {
//   //     const invoiceVal = value.invoiceDatafromConversation;
//   //     if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
//   //         // Perform regex match on the invoice type
//   //         const invoiceType = invoiceVal["Invoice type"];
//   //         if (invoiceType) {
//   //             const match = invoiceType.match(regexPattern);
//   //             if (match) {
//   //                 const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
//   //                 // Update the typeOfInvoice state based on the match result
//   //                 console.log("Match");
//   //                 value.setTypeOfInvoice({
//   //                     nonMerchandise: !!nonMerchandise,
//   //                     merchandise: !!merchandise,
//   //                     creditNote: !!creditNote,
//   //                     debitNote: !!debitNote
//   //                 });
//   //                 return;
//   //             }
//   //         }
//   //         // const items = invoiceVal["Items"];
//   //         // if(items){
//   //         //   console.log("Inside items",value.invoiceDatafromConversation)
//   //         //   value.setItemDetails({
//   //         //     items:invoiceVal["Items"]
//   //         // });
//   //         // }
//   //         if(invoiceVal["Quantity"]){
//   //           console.log("Quantity here")
//   //           value.setItemDetails({
//   //             quantity:invoiceVal["Quantity"]
//   //         })}
//   //         if(invoiceVal["Items"]){
//   //           console.log("Items here")
//   //           value.setItemDetails({
//   //             items:invoiceVal["Items"]
//   //         })}
//   //         // const quantity = invoiceVal["Quantity"];
//   //         // if(quantity){
//   //         //   console.log("Inside Quantity",value.invoiceDatafromConversation)

//   //         // });

//   //         // console.log("No match");
//   //         // Reset typeOfInvoice if no match is found
//   //         value.setTypeOfInvoice({
//   //             nonMerchandise: false,
//   //             merchandise: false,
//   //             creditNote: false,
//   //             debitNote: false
//   //         });
//   //     }
//   // };
//   const typeSelection = () => {
//     const invoiceVal = value.invoiceDatafromConversation;
//     const invoiceValFromJson = value.invoiceData.invoiceType;

//     if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
//       // Perform regex match on the invoice type
//       const invoiceType = invoiceVal["Invoice type"];
//       if (invoiceType) {
//         const match = invoiceType.match(regexPattern);
//         if (match) {
//           const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
//           // Update the typeOfInvoice state based on the match result
//           // console.log("Match");
//           value.setTypeOfInvoice({
//             nonMerchandise: !!nonMerchandise,
//             merchandise: !!merchandise,
//             creditNote: !!creditNote,
//             debitNote: !!debitNote,
//           });
//         } else {
//           // console.log("No match");
//           // Reset typeOfInvoice if no match is found
//           value.setTypeOfInvoice({
//             nonMerchandise: false,
//             merchandise: false,
//             creditNote: false,
//             debitNote: false,
//           });
//         }
//       }
//     }
//     if (invoiceValFromJson) {
//       // Perform regex match on the invoice type
//       if (invoiceValFromJson) {
//         const match = invoiceValFromJson.match(regexPattern);
//         if (match) {
//           const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
//           // Update the typeOfInvoice state based on the match result
//           // console.log("Match in invoice jsson");
//           value.setTypeOfInvoice({
//             nonMerchandise: !!nonMerchandise,
//             merchandise: !!merchandise,
//             creditNote: !!creditNote,
//             debitNote: !!debitNote,
//           });
//         } else {
//           // console.log("No match");
//           // Reset typeOfInvoice if no match is found
//           value.setTypeOfInvoice({
//             nonMerchandise: false,
//             merchandise: false,
//             creditNote: false,
//             debitNote: false,
//           });
//         }
//       }
//     }
//   };
//   // const updateItemDetails = () => {
//   //   const invoiceVal = value.invoiceDatafromConversation;
//   //   let updatedInvoiceData = { ...value.itemDetails };
//   //   const items = invoiceVal["Items"];
//   //   if (items) {
//   //     // console.log("Value:", items)
//   //     updatedInvoiceData.items = items
//   //   }
//   //   // Logic for Items
//   //   const quantity = invoiceVal["Quantity"];
//   //   if (quantity) {
//   //     // console.log("Items here");
//   //     updatedInvoiceData.quantity = quantity

//   //   }
//   //   value.setItemDetails(updatedInvoiceData);
//   //   console.log("UPdated",updatedInvoiceData)
//   // }
//   const updateItemDetails = () => {
//     const invoiceVal = value.invoiceDatafromConversation;
//     let updatedInvoiceData = { ...value.itemDetails };
//     const items = invoiceVal["Items"];
//     let arrayItems = [];
//     let arrayQty = [];
//     if (items) {
//       // console.log("Value:", items)
//       updatedInvoiceData.items = items;
//       arrayItems = items.split(", ").map((item) => item.trim());
//       setItemsArray(arrayItems);
//     }
//     // Logic for Items
//     const quantity = invoiceVal["Quantity"];
//     if (quantity) {
//       // console.log("Items here");
//       updatedInvoiceData.quantity = quantity;
//       arrayQty = quantity
//         .split(", ")
//         .map((quantity) => parseInt(quantity.trim(), 10));
//       setQuantitiesArray(arrayQty);
//     }
//     // console.log("arrays",itemsArray,quantitiesArray)
//     const tempDictionary = {};
//     arrayItems.forEach((item, index) => {
//       tempDictionary[item] = arrayQty[index];
//     });
//     // if()
//     // console.log("ITems and quantity:",quantity,items)
//     setDictionary(tempDictionary);
//     value.setItemDetails(updatedInvoiceData);
//   };
//   const [dictionary, setDictionary] = useState({});
//   // console.log(
//   //   "Po details Context:",
//   //   value.poDetailsData,
//   //   "Dictionary",
//   //   dictionary,
//   //   "item and quantity",
//   //   itemsArray,
//   //   quantitiesArray
//   // );

//   useEffect(() => {
//     typeSelection();
//     updateItemDetails();

//   }, [value.invoiceDatafromConversation,value.itemDetails]);

//   useEffect(() => {
//     // const updateDictionary = { it1: 23, it2: 34 };

//     const updatedItemsDetails = value.poDetailsData.map((item) => {
//       if (dictionary[item.itemId] !== undefined) {
//         // console.log("Inside ", dictionary[item.itemId]);
//         return {
//           ...item,
//           invQty: dictionary[item.itemId],
//           invAmt: parseInt(dictionary[item.itemId]) * parseInt(item.itemCost), // Example calculation for amount
//         };
//       }
//       return item;
//     });
//     // console.log("Updated", updatedItemsDetails);
//     value.setPoDetailsData(updatedItemsDetails);
//   }, [dictionary]);

//   return (
//     <Sheet
//       className="imageBackground"
//       sx={{
//         height: "90vh", // Set initial height
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#FFFAF3",
//         overflowY: "auto",
//         flexGrow: 1, // Allow growth only on large screens
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           flex: 1,
//           flexDirection: "column ",
//           padding: 2,
//           justifyContent: "flex-end",
//         }}
//       >
//         {messages.map((message, index) => (
//           <ChatMessage
//             key={index}
//             text={message.text}
//             fromUser={message.fromUser}
//           />
//         ))}
//         {value.modalVisible && (
//           <PdfCard title={"Invoice Number: " + pdfNumber} />
//         )}
//       </Box>
//       <form
//         onSubmit={handleMessageSubmit}
//         id="form1"
//         className="chatbot-input-form"
//         style={{
//           display: "flex",
//           backgroundColor: "#283d76",
//           borderRadius: "0.5rem",
//         }}
//       >
//         <Add style={{ color: "white" }} />
//         <Smiley style={{ color: "white" }} />
//         <input
//           id="inputValue"
//           type="text"
//           // type="submit"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => {
//             e.preventDefault();
//             setInput(e.target.value);
//           }}
//           style={{ margin: "0.5rem", height: "2rem" }}
//         />
//         <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
//         <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
//       </form>
//     </Sheet>
//   );
// }
// // return (
// // <Grid
// //   item
// //   xs={4}
// //   sm={4}
// //   md={4}
// //   style={
// //     {
// //         marginTop:'10vh',
// //         height:' { xs: "calc(90dvh - var(--Header-height))", lg: "90dvh" }',
// //         overflowY:'auto',
// //         flex:1,

// //       // backgroundColor: "white",
// //       // display: "flex",
// //       // alignItems: "flex-end",
// //       // justifyContent: "flex-end",
// //       // marginTop: "10vh",
// //       // flexGrow:1,
// //     }
// //   }

// // >
// //   <Sheet
// //   // className="imageBackground"
// //     sx={{
// //       // height: { xs: "calc(90dvh - var(--Header-height))", lg: "90dvh" },
// //       height:'100%',
// //       display: "flex",
// //       flexDirection: "column",
// //       backgroundColor: "#FFFAF3",

// //     //   backgroundColor: "background.level1",
// //     }}
// //   >
// //     {/* <ChatbotPaneHeader sender={chat.sender} /> */}
// //     <Box
// //       sx={{
// //         display: "flex",
// //         flex: 1,
// //         padding:0,
// //         // width:'100%',
// //         minHeight: 0,
// //         // px: 2,
// //         // py: 3,
// //         // overflowY: "scroll",
// //         flexDirection: "column-reverse",
// //       }}
// //     >
// //       <Stack  justifyContent="flex-end">
// //         {messages.map((message, index) => (
// //           <div
// //             style={{
// //               display: "flex",
// //               alignItems: message.fromUser ? "flex-end" : "flex-start",
// //               flexDirection: "column",
// //               // flexGrow: 1,

// //             }}
// //           >
// //             <ChatMessage
// //               key={index}
// //               text={message.text}
// //               fromUser={message.fromUser}
// //             />
// //           </div>
// //         ))}

// //         <form
// //           onSubmit={handleMessageSubmit}
// //           className="chatbot-input-form"
// //           style={{
// //             display: "flex",
// //             backgroundColor: "#283d76",
// //             borderRadius: "0.5rem",
// //             // position: 'fixed',
// //             flex:1
// //             // width:'100%'
// //                       }}
// //         >
// //           <Add style={{ color: "white" }} />
// //           <Smiley style={{ color: "white" }} />

// //           <input
// //             type="text"
// //             placeholder="Type a message..."
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             style={{ margin: "0.5rem", height: "2rem" }}
// //           />
// //           {/* <button type="submit">Send</button> */}
// //           <SendIcon style={{ color: "white" }} />
// //           <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
// //         </form>
// //       </Stack>
// //     </Box>
// //   </Sheet>
// // </Grid>

// //     <Sheet
// //       className="imageBackground"
// //       sx={{
// //         height: {
// //           xs: "calc(90dvh - var(--Header-height))",
// //           lg: "90dvh",
// //           md: "calc(90dvh - var(--Header-height))",
// //         },
// //         display: "flex",
// //         flexDirection: "column",
// //         backgroundColor: "#FFFAF3",
// //         overflowY: "auto",
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           display: "flex",
// //           flex: 1,
// //           flexDirection: "column-reverse",
// //           padding: 2,
// //           justifyContent: "space-between",
// //         }}
// //       >
// //         {messages.map((message, index) => (
// //           <ChatMessage
// //             key={index}
// //             text={message.text}
// //             fromUser={message.fromUser}
// //           />
// //         ))}
// //       </Box>
// //       <form
// //         onSubmit={handleMessageSubmit}
// //         className="chatbot-input-form"
// //         style={{
// //           display: "flex",
// //           backgroundColor: "#283d76",
// //           borderRadius: "0.5rem",
// //         }}
// //       >
// //         <Add style={{ color: "white" }} />
// //         <Smiley style={{ color: "white" }} />
// //         <input
// //           type="text"
// //           placeholder="Type a message..."
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           style={{ margin: "0.5rem", height: "2rem" }}
// //         />
// //         <SendIcon style={{ color: "white" }} />
// //         <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
// //       </form>
// //     </Sheet>
// //   );
// // }

// //24/06/2024//

// //apr-may//


// // import Box from "@mui/joy/Box";
// // import Sheet from "@mui/joy/Sheet";
// // import Stack from "@mui/joy/Stack";
// // // import AvatarWithStatus from './AvatarWithStatus';
// // // import ChatBubble from './ChatBubble';
// // // import ChatbotPaneHeader from './ChatbotPaneHeader';
// // // import { ChatProps, MessageProps } from '../types/types';
// // import React, { useEffect, useState, useContext } from "react";
// // import ChatMessage from "./ChatMessage";
// // import "../styles/chatbot.css";
// // import "../styles/general.css";
// // import Smiley from "@mui/icons-material/SentimentSatisfiedAlt";
// // import Add from "@mui/icons-material/AddCircle";
// // import SendIcon from "@mui/icons-material/Send";
// // import Grid from "@mui/material/Grid";
// // import Typography from "@mui/material/Typography";
// // import { createTheme, ThemeProvider } from "@mui/material/styles";
// // import bgImage from "../images/bgImage.png";
// // import { useTheme } from "@mui/material/styles";
// // import useMediaQuery from "@mui/material/useMediaQuery";
// // import { AuthContext, useAuthContext } from "../context/ContextsMasterFile";
// // import axios from "axios";

// // export default function ChatbotPane() {
// //   const [messages, setMessages] = useState([]);
// //   const value = useContext(AuthContext);
// //   const counter = 22;
// //   const invoiceCheck = (invoiceObject) => {
// //     invoiceObject.split("\n").forEach((line) => {
// //       console.log("Line:", line);
// //       let match_invoice_type = line.match(/.*"invoice type": ?(.*?)(?:,|$)/);
// //       if (match_invoice_type) {
// //         console.log("Invoice type");
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           invoiceType: match_invoice_type[1].trim(),
// //         });
// //       }

// //       let match_datetime = line.match(/.*"datetime": ?(.*?)(?:,|$)/);
// //       if (match_datetime) {
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           datetime: match_datetime[1].trim(),
// //         });
// //       }

// //       let match_po_number = line.match(/.*"po number": ?(.*?)(?:,|$)/);

// //       if (match_po_number) {
// //         console.log("inv");
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           poNumber: match_po_number[1].trim(),
// //         });
// //       }

// //       let match_total_amount = line.match(/.*"total amount": ?(.*?)(?:,|$)/);
// //       if (match_total_amount) {
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           totalAmount: match_total_amount[1].trim(),
// //         });
// //       }

// //       let match_total_tax = line.match(/.*"total tax": ?(.*?)(?:,|$)/);
// //       if (match_total_tax) {
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           totalTax: match_total_tax[1].trim(),
// //         });
// //       }

// //       let match_items = line.match(/.*"items": ?(.*?)(?:,|$)/);
// //       if (match_items) {
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           items: match_items[1].trim(),
// //         });
// //       }

// //       let match_quantity = line.match(/.*"quantity": ?(.*?)(?:,|$)/);
// //       if (match_quantity) {
// //         value.setInvoiceData({
// //           ...value.invoiceData,
// //           quantity: match_quantity[1].trim(),
// //         });
// //       }
// //     });
// //   };
// //   const invoiceCheck2 = (invoiceObject) => {
// //     console.log("Invoice object:", invoiceObject);

// //     // Create a temporary object to hold updated invoice data
// //     let updatedInvoiceData = { ...value.invoiceData };

// //     Object.keys(invoiceObject).forEach((key) => {
// //       if (key === "invoice type" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.invoiceType = invoiceObject[key];
// //       }
// //       if (key === "po number" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.poNumber = invoiceObject[key];
// //         getPoDetails(invoiceObject[key])
// //       }
// //       if (key === "quantity" && invoiceObject[key] !== null) {

// //         updatedInvoiceData.quantity = invoiceObject[key];
// //       }
// //       if (key === "supplier id" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.supplierId = invoiceObject[key];
// //       }
// //       if (key === "total amount" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.totalAmount = invoiceObject[key];
// //       }
// //       if (key === "date" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.invoiceDate = invoiceObject[key];
// //       }
// //       if (key === "total tax" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.totalTax = invoiceObject[key];
// //       }
// //       if (key === "items" && invoiceObject[key] !== null) {
// //         updatedInvoiceData.items = invoiceObject[key];
// //       }
// //       // Add similar conditions for other keys...
// //     });

// //     // Update the context with the updatedInvoiceData object
// //     value.setInvoiceData(updatedInvoiceData);
// //   };
// //   const invoiceTypeSelection = () => {
// //     const regexPatternNonMerchandise = /non\s*-?\s*merchandise/i;
// //     const regexPatternMerchandise = /merchandise/i;;
// //     const regexPatternCreditNote = /credit\s*-?\s*note/i;
// //     const regexPatternDebitNote = /debit\s*-?\s*note/i;


// //     const invoiceVal = value.invoiceDatafromConversation
// //     if (Object.keys(invoiceVal).length !== 0) {
// //       if (value.invoiceDatafromConversation["Invoice type"].match(regexPatternNonMerchandise)) {
// //         value.setTypeOfInvoice({ nonMerchandise: true, merchandise: false, creditNote: false, debitNote: false })
// //       }
// //       else if (value.invoiceDatafromConversation["Invoice type"].match(regexPatternMerchandise)) {
// //         // value.setTypeOfInvoice({...value.typeOfInvoice,merchandise:true})
// //         value.setTypeOfInvoice({ nonMerchandise: false, merchandise: true, creditNote: false, debitNote: false })


// //       }
// //       else if (value.invoiceDatafromConversation["Invoice type"].match(regexPatternCreditNote)) {
// //         // value.setTypeOfInvoice({...value.typeOfInvoice,creditNote:true})
// //         value.setTypeOfInvoice({ nonMerchandise: false, merchandise: false, creditNote: true, debitNote: false })


// //       }
// //       else if (value.invoiceDatafromConversation["Invoice type"].match(regexPatternDebitNote)) {
// //         // value.setTypeOfInvoice({...value.typeOfInvoice,debitNote:true})
// //         value.setTypeOfInvoice({ nonMerchandise: false, merchandise: false, creditNote: false, debitNote: true })


// //       }
// //       console.log("regex equal")
// //     }
// //     else {
// //       console.log("regex not equal")
// //     }
// //   }
// //   const getPoDetails = async (id) => {
// //     console.log("po id:", id)
// //     // value.setInvoiceData({...value.invoiceData,poNumber:id})
// //     try {
// //       const response = await axios({
// //         method: "get",
// //         url: `http://localhost:8000/poDetails/${id}`,
// //         headers: {
// //           "Content-Type": "application/json",
// //           'accept': 'application/json',
// //         },
// //       })
// //       console.log("Response", response.data)
// //       const poHeader = response.data.po_header;

// //       // Create a new object with updated values
// //       const updatedPoData = {
// //         ...value.poHeaderData,
// //         currency: poHeader.currency,
// //         totalCost: poHeader.totalCost,
// //         invoiceNo: "INV" + counter,
// //         paymentTerm: poHeader.payment_term
// //       };
// //       value.setPoHeaderData(updatedPoData);
// //       value.setPoDetailsData(response.data.po_details)
// //       console.log("Po details:", response.data.po_details)

// //       // value.setInvoiceData({
// //       //   ...value.invoiceData,
// //       //   currency: response.data.po_header.currency,
// //       // });
// //       // value.setInvoiceData({
// //       //   ...value.invoiceData,
// //       //   invoiceNo:"INV" + counter,
// //       // });
// //       // value.setInvoiceData({
// //       //   ...value.invoiceData,
// //       //   totalCost: response.data.po_header.totalCost,
// //       // });
// //       // value.setInvoiceData({
// //       //   ...value.invoiceData,
// //       //   paymentTerm:response.data.po_header.payment_term,
// //       // });
// //       // let updatedInvoiceData = { ...value.invoiceData };
// //       // updatedInvoiceData.paymentTerm = response.data.po_header.payment_term
// //       // updatedInvoiceData.poNumber = id
// //       // updatedInvoiceData.currency = response.data.po_header.currency
// //       // updatedInvoiceData.invoiceNo = "INV" + counter
// //       // updatedInvoiceData.totalCost = response.data.po_header.totalCost
// //       // value.setInvoiceData(updatedInvoiceData);

// //     } catch (error) {
// //       const updatedPoData = {
// //         ...value.poHeaderData,
// //         currency: "",
// //         totalCost: "",
// //         invoiceNo: "INV" + counter,
// //         paymentTerm: ""
// //       };
// //       value.setPoHeaderData(updatedPoData);
// //       console.log("Get Po Error:", error);
// //     }
// //   };

// //   const invoiceCreation = async () => {
// //     try {
// //       const response = await axios({
// //         method: "post",
// //         url: `http://localhost:8000/invCreation/`,
// //         headers: {
// //           "Content-Type": "application/json",
// //           'accept': 'application/json',
// //         },
// //         data: {
// //           "invoiceId": value.invoiceData.invoiceNo,
// //           "invoicedate": value.invoiceData.invoiceDate,
// //           "supplierId": value.invoiceData.supplierId,
// //           "invoiceType": value.invoiceData.invoiceType,
// //           "currency": value.invoiceData.currency,
// //           "payment_term": value.invoiceData.paymentTerm,
// //           "invoice_status": "string",
// //           "total_qty": value.invoiceData.quantity,
// //           "total_cost": value.invoiceData.totalCost,
// //           "total_tax": value.invoiceData.totalTax,
// //           "total_amount": value.invoiceData.totalAmount
// //         },
// //         // data: {
// //         //   invoiceId: "INV1234",
// //         //   invoicedate: value.invoiceData.invoiceDate,
// //         //   supplierId: "SUP1234",
// //         //   invoiceType: value.invoiceData.invoiceType,
// //         //   currency: "CUR1234",
// //         //   payment_term: "PAY1234",
// //         //   invoice_status: "STA1234",
// //         //   total_qty: value.invoiceData.quantity,
// //         //   total_cost: 0,
// //         //   total_tax: value.invoiceData.totalTax,
// //         //   total_amount: value.invoiceData.totalAmount,
// //         // },
// //       })
// //       console.log(response.data)
// //       ++counter;
// //     } catch (error) {
// //       console.log("Error:", error);
// //     }
// //   };
// //   const [input, setInput] = useState("");
// //   const handleMessageSubmit = async (e) => {
// //     console.log("invoice context:", value.invoiceData);
// //     console.log(value.isActive);
// //     e.preventDefault();
// //     if (!input.trim()) return;
// //     const newMessages = [...messages, { text: input, fromUser: true }];
// //     setMessages(newMessages);
// //     setInput("");
// //     console.log(input);
// //     try {
// //       const response = await axios({
// //         method: "post",
// //         url: `http://localhost:8000/creation/response?query=${input}`,
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //       });
// //       console.log("Data response", response.data);
// //       if (response.data.action == "create invoice") {
// //         value.setIsActive(true);
// //       }
// //       else {
// //         value.setIsActive(false);
// //       }

// //       console.log("Conversation data:", response.data.conversation);
// //       const botReply = response.data.conversation.slice(-1);
// //       const reply = botReply[0].slice(5, -1);
// //       // const splitMessage =
// //       //   "You can provide all the information at once, separated by commas like this";

// //       const formattedMessage = reply.split(/- /g).map((part, index) => {
// //         if (index === 0) {
// //           return <React.Fragment key={index}>{part}</React.Fragment>;
// //         } else {
// //           // Add line break after each "- "
// //           return (
// //             <React.Fragment key={index}>
// //               <br />
// //               {`•${part}`}
// //             </React.Fragment>
// //           );
// //         }
// //       });
// //       console.log("botReply", reply);
// //       const invoice_json = JSON.parse(response.data.invoice_json);
// //       setMessages([
// //         ...newMessages,
// //         { text: formattedMessage, fromUser: false },
// //       ]);
// //       // window.location.reload(false);
// //       // console.log("Context",value.invoiceData)
// //       invoiceCheck2(invoice_json);
// //       // invoiceTypeSelection();
// //       value.setinvoiceDatafromConversation(response.data.invoiceDatafromConversation)
// //       if (response.data.submissionStatus == "submitted") {
// //         invoiceCreation()
// //       }
// //       else {
// //         console.log("Not equal")
// //       }
// //     } catch (error) {
// //       // const botReply = "Hello,user";
// //       // setMessages([...newMessages, { text: botReply, fromUser: false }]);
// //       console.error("Error fetching data:", error);
// //     }
// //   };
// //   const defaultTheme = createTheme();

// //   const theme = useTheme();
// //   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
// //   useEffect(() => {
// //     // const newMessages = [
// //     //   ...messages,
// //     //   { text: "Hi, how can I help you?", fromUser: false },
// //     // ];
// //     // setMessages(newMessages);
// //     // console.log("context:", value.invoiceData);

// //   }, []);
// //   const regexPattern = /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;

// //   // Run the function whenever value.invoiceDatafromConversation changes
// //   //   const typeSelection = () => {
// //   //     const invoiceVal = value.invoiceDatafromConversation;
// //   //     if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
// //   //         // Perform regex match on the invoice type
// //   //         const invoiceType = invoiceVal["Invoice type"];
// //   //         if (invoiceType) {
// //   //             const match = invoiceType.match(regexPattern);
// //   //             if (match) {
// //   //                 const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
// //   //                 // Update the typeOfInvoice state based on the match result
// //   //                 console.log("Match");
// //   //                 value.setTypeOfInvoice({
// //   //                     nonMerchandise: !!nonMerchandise,
// //   //                     merchandise: !!merchandise,
// //   //                     creditNote: !!creditNote,
// //   //                     debitNote: !!debitNote
// //   //                 });
// //   //                 return;
// //   //             }
// //   //         }
// //   //         // const items = invoiceVal["Items"];
// //   //         // if(items){
// //   //         //   console.log("Inside items",value.invoiceDatafromConversation)
// //   //         //   value.setItemDetails({
// //   //         //     items:invoiceVal["Items"]
// //   //         // });
// //   //         // }
// //   //         if(invoiceVal["Quantity"]){
// //   //           console.log("Quantity here")
// //   //           value.setItemDetails({
// //   //             quantity:invoiceVal["Quantity"]
// //   //         })}
// //   //         if(invoiceVal["Items"]){
// //   //           console.log("Items here")
// //   //           value.setItemDetails({
// //   //             items:invoiceVal["Items"]
// //   //         })}
// //   //         // const quantity = invoiceVal["Quantity"];
// //   //         // if(quantity){
// //   //         //   console.log("Inside Quantity",value.invoiceDatafromConversation)

// //   //         // });


// //   //         // console.log("No match");
// //   //         // Reset typeOfInvoice if no match is found
// //   //         value.setTypeOfInvoice({
// //   //             nonMerchandise: false,
// //   //             merchandise: false,
// //   //             creditNote: false,
// //   //             debitNote: false
// //   //         });
// //   //     }
// //   // };
// //   const typeSelection = () => {
// //     const invoiceVal = value.invoiceDatafromConversation;
// //     if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
// //       // Perform regex match on the invoice type
// //       const invoiceType = invoiceVal["Invoice type"];
// //       if (invoiceType) {
// //         const match = invoiceType.match(regexPattern);
// //         if (match) {
// //           const [_, nonMerchandise, merchandise, creditNote, debitNote] = match;
// //           // Update the typeOfInvoice state based on the match result
// //           console.log("Match");
// //           value.setTypeOfInvoice({
// //             nonMerchandise: !!nonMerchandise,
// //             merchandise: !!merchandise,
// //             creditNote: !!creditNote,
// //             debitNote: !!debitNote
// //           });
// //         } else {
// //           console.log("No match");
// //           // Reset typeOfInvoice if no match is found
// //           value.setTypeOfInvoice({
// //             nonMerchandise: false,
// //             merchandise: false,
// //             creditNote: false,
// //             debitNote: false
// //           });
// //         }
// //       }
// //       // Logic for Quantity

// //     }
// //   };
// //   const updateItemDetails = () => {
// //     const invoiceVal = value.invoiceDatafromConversation;
// //     let updatedInvoiceData = { ...value.itemDetails };
// //     const items = invoiceVal["Items"];
// //     if (items) {
// //       // console.log("Value:", items)
// //       updatedInvoiceData.items = items
// //     }
// //     // Logic for Items
// //     const quantity = invoiceVal["Quantity"];
// //     if (quantity) {
// //       // console.log("Items here");
// //       updatedInvoiceData.quantity = quantity

// //     }
// //     value.setItemDetails(updatedInvoiceData);
// //     console.log("UPdated",updatedInvoiceData)
// //   }
// //   useEffect(() => {
// //     typeSelection();
// //     updateItemDetails();
// //   }, [value.invoiceDatafromConversation]);
// //   return (
// //     <Sheet
// //       className="imageBackground"
// //       sx={{
// //         height: "90vh", // Set initial height
// //         display: "flex",
// //         flexDirection: "column",
// //         backgroundColor: "#FFFAF3",
// //         overflowY: "auto",
// //         flexGrow: 1, // Allow growth only on large screens
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           display: "flex",
// //           flex: 1,
// //           flexDirection: "column ",
// //           padding: 2,
// //           justifyContent: "flex-end",
// //         }}
// //       >
// //         {messages.map((message, index) => (
// //           <ChatMessage
// //             key={index}
// //             text={message.text}
// //             fromUser={message.fromUser}
// //           />
// //         ))}
// //       </Box>
// //       <form
// //         onSubmit={handleMessageSubmit}
// //         className="chatbot-input-form"
// //         style={{
// //           display: "flex",
// //           backgroundColor: "#283d76",
// //           borderRadius: "0.5rem",
// //         }}
// //       >
// //         <Add style={{ color: "white" }} />
// //         <Smiley style={{ color: "white" }} />
// //         <input
// //           type="text"
// //           placeholder="Type a message..."
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           style={{ margin: "0.5rem", height: "2rem" }}
// //         />
// //         <SendIcon style={{ color: "white" }} onClick={handleMessageSubmit} />
// //         <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
// //       </form>
// //     </Sheet>
// //   );
// // }

// // apr-may//
// // apr-may//

// // return (
// // <Grid
// //   item
// //   xs={4}
// //   sm={4}
// //   md={4}
// //   style={
// //     {
// //         marginTop:'10vh',
// //         height:' { xs: "calc(90dvh - var(--Header-height))", lg: "90dvh" }',
// //         overflowY:'auto',
// //         flex:1,

// //       // backgroundColor: "white",
// //       // display: "flex",
// //       // alignItems: "flex-end",
// //       // justifyContent: "flex-end",
// //       // marginTop: "10vh",
// //       // flexGrow:1,
// //     }
// //   }

// // >
// //   <Sheet
// //   // className="imageBackground"
// //     sx={{
// //       // height: { xs: "calc(90dvh - var(--Header-height))", lg: "90dvh" },
// //       height:'100%',
// //       display: "flex",
// //       flexDirection: "column",
// //       backgroundColor: "#FFFAF3",

// //     //   backgroundColor: "background.level1",
// //     }}
// //   >
// //     {/* <ChatbotPaneHeader sender={chat.sender} /> */}
// //     <Box
// //       sx={{
// //         display: "flex",
// //         flex: 1,
// //         padding:0,
// //         // width:'100%',
// //         minHeight: 0,
// //         // px: 2,
// //         // py: 3,
// //         // overflowY: "scroll",
// //         flexDirection: "column-reverse",
// //       }}
// //     >
// //       <Stack  justifyContent="flex-end">
// //         {messages.map((message, index) => (
// //           <div
// //             style={{
// //               display: "flex",
// //               alignItems: message.fromUser ? "flex-end" : "flex-start",
// //               flexDirection: "column",
// //               // flexGrow: 1,

// //             }}
// //           >
// //             <ChatMessage
// //               key={index}
// //               text={message.text}
// //               fromUser={message.fromUser}
// //             />
// //           </div>
// //         ))}

// //         <form
// //           onSubmit={handleMessageSubmit}
// //           className="chatbot-input-form"
// //           style={{
// //             display: "flex",
// //             backgroundColor: "#283d76",
// //             borderRadius: "0.5rem",
// //             // position: 'fixed',
// //             flex:1
// //             // width:'100%'
// //                       }}
// //         >
// //           <Add style={{ color: "white" }} />
// //           <Smiley style={{ color: "white" }} />

// //           <input
// //             type="text"
// //             placeholder="Type a message..."
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             style={{ margin: "0.5rem", height: "2rem" }}
// //           />
// //           {/* <button type="submit">Send</button> */}
// //           <SendIcon style={{ color: "white" }} />
// //           <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
// //         </form>
// //       </Stack>
// //     </Box>
// //   </Sheet>
// // </Grid>

// //     <Sheet
// //       className="imageBackground"
// //       sx={{
// //         height: {
// //           xs: "calc(90dvh - var(--Header-height))",
// //           lg: "90dvh",
// //           md: "calc(90dvh - var(--Header-height))",
// //         },
// //         display: "flex",
// //         flexDirection: "column",
// //         backgroundColor: "#FFFAF3",
// //         overflowY: "auto",
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           display: "flex",
// //           flex: 1,
// //           flexDirection: "column-reverse",
// //           padding: 2,
// //           justifyContent: "space-between",
// //         }}
// //       >
// //         {messages.map((message, index) => (
// //           <ChatMessage
// //             key={index}
// //             text={message.text}
// //             fromUser={message.fromUser}
// //           />
// //         ))}
// //       </Box>
// //       <form
// //         onSubmit={handleMessageSubmit}
// //         className="chatbot-input-form"
// //         style={{
// //           display: "flex",
// //           backgroundColor: "#283d76",
// //           borderRadius: "0.5rem",
// //         }}
// //       >
// //         <Add style={{ color: "white" }} />
// //         <Smiley style={{ color: "white" }} />
// //         <input
// //           type="text"
// //           placeholder="Type a message..."
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           style={{ margin: "0.5rem", height: "2rem" }}
// //         />
// //         <SendIcon style={{ color: "white" }} />
// //         <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
// //       </form>
// //     </Sheet>
// //   );
// // }
