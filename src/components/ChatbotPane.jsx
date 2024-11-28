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
  console.log("ITem details input: ", value.itemDetailsInput);
  const saveFormData = async () => {
    console.log("Inside save form data", value.itemDetailsInput);
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
    // console.log("Filtered values:",filteredItems,filteredQuantities)
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
  const prevIdRef = useRef(null);
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setinvoiceDatafromConversation({});
        value.setItemDetails({
          items: "",
          quantity: "",
        });
        value.setItemDetailsInput({
          items: "",
          quantity: "",
        });
      }
      console.log(
        "After emptying: ",
        value.itemDetails,
        value.itemDetailsInput
      );
      // Update the previous id with the current one
      prevIdRef.current = id;
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
        console.log("Updated data inside getpo:", newUpdatedData);
        // After setting poDetailsData, call the updateItemDetails function
        if (newUpdatedData.length > 0) {
          value.setItemDetailsInput({
            items: newUpdatedData.map((item) => item.itemId),
            quantity: newUpdatedData.map((item) => item.invQty),
          });
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
        // if(Object.values(value.itemDetails.items).length == 0){
        //   console.log("Empty itemssss")
        // }
        console.log("update item details ", value.itemDetails.items);
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
        if (itemsArray && quantitiesArray) {
          value.setItemDetailsInput({
            items: itemsArray,
            quantity: quantitiesArray,
          });
        }
        updatePo();

        // if (value.poDetailsData.length > 0) {
        //   updatePo();
        // }
      }
      // if(value.poDetailsData.length>0){
      //   let updatedInvoiceData = { ...value.itemDetails };
      //   // if(Object.values(value.itemDetails.items).length == 0){
      //   //   console.log("Empty itemssss")
      //   // }
      //   console.log(
      //     "update item details ",value.itemDetails.items
      //   );
      //   const items = value.poDetailsData.map((item) => item.itemId);
      //   const quantity = value.poDetailsData.map((item) => item.invQty);
      //   let arrayItems = [];
      //   let arrayQty = [];
      //   console.log("arrayitems and array qty", arrayItems, arrayQty);
      //   if (items && quantity) {
      //     updatedInvoiceData.items = items;
      //     arrayItems = items.toString().split(", ").map((item) => item.trim());
      //     setItemsArray(arrayItems);
      //     updatedInvoiceData.quantity = quantity;
      //     arrayQty = quantity.toString().split(", ")
      //       .map((quantity) => parseInt(quantity.trim(), 10));
      //     setQuantitiesArray(arrayQty);
      //   } else {
      //     value.setItemDetails({
      //       items: "",
      //       quantity: "",
      //     });
      //   }
      //   const tempDictionary = {};
      //   arrayItems.forEach((item, index) => {
      //     tempDictionary[item] = arrayQty[index];
      //   });
      //   setDictionary(tempDictionary);
      //   value.setItemDetails(updatedInvoiceData);
      //   // value.setItemDetailsInput(updatedInvoiceData);
      //   if (itemsArray && quantitiesArray) {
      //     value.setItemDetailsInput({
      //       items: itemsArray,
      //       quantity: quantitiesArray,
      //     });
      //   }
      //   updatePo();
      // }
      else {
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
    console.log("Item details in update po", data, value.poDetailsData);
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
    // const defaultItemDetails = {
    //   items: value.poDetailsData.map((item) => item.itemId),
    //   quantity: value.poDetailsData.map((item) => item.invQty),
    // };
    // console.log("default ite,Details", defaultItemDetails);
    const { items, quantity } = itemDetails;
    // const { items, quantity } = allEmpty? defaultItemDetails:itemDetails;
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
