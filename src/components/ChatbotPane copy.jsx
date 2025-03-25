//12-03-2025 - before adding po items to item list- calling hmsgsub fn twice
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
import typingIndicator from "../images/typingIndicator1.gif";
import TypingIndicatorComponent from "./TypingIndicatorComponent";

export default function ChatbotPane() {
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
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);

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
  const submitFormData = async () => {
    await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);

    //to test get invoice details
    // await getInvoiceDetails("INV498");
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
    // getPoDetails("");
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
  // useEffect(()=>{
  //   typeSelection(value.invoiceDatafromConversation)
  // },[value.invoiceDatafromConversation])
  //SCROLLING FUNCTIONALITY
  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    value.setSystemDocumentId(`INV${value.invoiceCounter}`);
  }, [value.invoiceCounter]);
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
        const invoiceType = invoiceVal["Invoice Type"];
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
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
      }
      prevIdRef.current = id; // Update the previous ID
      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        console.log("PO Response: ", response.data);
        console.log(
          "PO supplier:",
          response.data.po_details[0]?.supplierId,
          response.data.po_details
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            supplierId: poHeader.supplierId,
            // invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
            invCost: 0,
          }));
          value.setItemListPo(
            response.data.po_details.map((item) => item.itemId)
          );
          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
              invoiceCost: newUpdatedData.map((item) => item.invCost),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
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
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        !Array.isArray(invoiceDatafromConversation.Items) ||
        invoiceDatafromConversation.Items.length === 0
      ) {
        value.setItemDetails({
          items: [],
          quantity: [],
          invoiceCost: [],
        });
        return;
      }
      console.log(Array.isArray(invoiceDatafromConversation.Items).length);
      const { Items: itemsArray = [] } = invoiceDatafromConversation; // Extract "Items" array
      console.log("updateitemdetails invdfc: ", itemsArray);

      // Ensure correct mapping of extracted values
      const tempDictionary = itemsArray.reduce((acc, item) => {
        acc[item["Item ID"]] = {
          quantity: item.Quantity || 0,
          invoiceCost: item["Invoice Cost"] || 0,
        };
        return acc;
      }, {});

      // Extract structured arrays for state update
      const updatedItems = itemsArray.map((item) => item["Item ID"]);
      const updatedQuantities = itemsArray.map((item) => item.Quantity || 0);
      const updatedInvoiceCosts = itemsArray.map(
        (item) => item["Invoice Cost"] || 0
      );

      setItemsArray(updatedItems);
      setQuantitiesArray(updatedQuantities);
      setInvoiceCostArray(updatedInvoiceCosts);

      const updatedInvoiceData = {
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      };
      console.log("UpdatedInvoiceData: ", updatedInvoiceData, tempDictionary);

      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      });

      // Use prevPoDetailsDataRef.current for comparison
      const prevPoDetailsData = prevPoDetailsDataRef.current || [];

      const updatedPoDetails = prevPoDetailsData.map((item) =>
        tempDictionary[item.itemId]
          ? {
              ...item,
              invQty: tempDictionary[item.itemId].quantity,
              invAmt:
                tempDictionary[item.itemId].quantity *
                tempDictionary[item.itemId].invoiceCost,
              invCost: tempDictionary[item.itemId].invoiceCost,
            }
          : item
      );

      // Identify new items not present in prevPoDetailsData
      const newItems = Object.keys(tempDictionary)
        .filter(
          (itemId) =>
            !prevPoDetailsData.some((entry) => entry.itemId === itemId)
        )
        .map((itemId) => ({
          itemId,
          invQty: tempDictionary[itemId].quantity,
          invAmt:
            tempDictionary[itemId].quantity *
            tempDictionary[itemId].invoiceCost,
          invCost: tempDictionary[itemId].invoiceCost,
          itemQuantity: 0,
          itemDescription: "",
          totalItemCost: 0,
          supplierId: "",
          itemCost: 0,
          poId: prevPoDetailsData[0]?.poId || "", // Preserve existing PO ID
        }));

      // Merge updates and new items
      value.setPoDetailsData([...updatedPoDetails, ...newItems]);
    },
    [value.itemDetails, value.invoiceDatafromConversation]
  );

  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "Invoice Type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "Quantities":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "Invoice Number":
              updatedInvoiceData.userInvNo = invoiceObject[key];
              break;
            case "Total Amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "Date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "Total Tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "PO Number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
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
    // setMessages(newMessages);
    setInput("");
    //typingIndicator
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(true);
    }, 1500);

    //typingIndicator
    try {
      const response = await axios.post(
        // `http://localhost:8000/creation/response?query=${input}`,
        `http://localhost:8000/creation/response`, // API endpoint
        {
          user_id: "admin", // The user_id value
          message: input, // The message value
        },

        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);
      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }
      if (response.status === 200 || response.status === 201) {
        const invoice_json = response.data.invoice_json;
        // const invoice_json = JSON.parse(response.data.invoice_json);
        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
  value.setinvoiceDatafromConversation(
    response.data.invoiceDatafromConversation
  );

        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        // if (value.invoiceData.poNumber === "") {
        if (
          response.data.invoice_json["PO Number"] === undefined ||
          response.data.invoice_json["PO Number"] === "" ||
          response.data.invoice_json["PO Number"] === null
        ) {
          const botReply = response.data.chat_history.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.chat_history
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {/* {text.slice(5)} */}
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submissionStatus == "submitted") {
            // let validationStatus = await itemQuantityValidation();
            // if (validationStatus) {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.chat_history.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.chat_history
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

            if (response.data.submissionStatus == "submitted") {
              // let validationStatus = await itemQuantityValidation();
              // if (validationStatus) {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
              // }
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
        //typingIndicator
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setTyping(false);
        //typingIndicator
      }
    } catch (error) {
      //typingIndicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
      //typingIndicator

      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.systemDocumentId,
        itemCost: item.invCost,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      value.setModalDetails({
        visible: true,
        text: "Invoice Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.systemDocumentId,
      userInvNo: value.invoiceData.userInvNo,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "Pending",
      total_cost: value.invoiceData.totalAmount - value.invoiceData.totalTax,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
      invoicedate: formatDate(value.invoiceData.invoiceDate),
      total_qty: sumQuantities(value.itemDetails.quantity),
    };
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: invData,
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
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice Header Creation Error:", error, error.data);
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
    setUploadLoading(true);

    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/uploadGpt/`,
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
        {typing && <TypingIndicatorComponent scrollToBottom={scrollToBottom} />}
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

//12-03-2025 - before adding po items to item list- calling hmsgsub fn twice

//09-03-2025 before adding user in handlemsgsubmit
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
import typingIndicator from "../images/typingIndicator1.gif";
import TypingIndicatorComponent from "./TypingIndicatorComponent";

export default function ChatbotPane() {
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
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);

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
  const submitFormData = async () => {
    await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);

    //to test get invoice details
    // await getInvoiceDetails("INV498");
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
    // getPoDetails("");
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
  // useEffect(()=>{
  //   typeSelection(value.invoiceDatafromConversation)
  // },[value.invoiceDatafromConversation])
  //SCROLLING FUNCTIONALITY
  const scrollToBottom = () => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    value.setSystemDocumentId(`INV${value.invoiceCounter}`);
  }, [value.invoiceCounter]);
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
        const invoiceType = invoiceVal["Invoice Type"];
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
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
      }
      prevIdRef.current = id; // Update the previous ID
      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        console.log("PO Response: ", response.data);
        console.log(
          "PO supplier:",
          response.data.po_details[0]?.supplierId,
          response.data.po_details
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            supplierId: poHeader.supplierId,
            // invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
            invCost: 0,
          }));
          value.setItemListPo(
            response.data.po_details.map((item) => item.itemId)
          );
          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
              invoiceCost: newUpdatedData.map((item) => item.invCost),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
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
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        !Array.isArray(invoiceDatafromConversation.Items) ||
        invoiceDatafromConversation.Items.length === 0
      ) {
        value.setItemDetails({
          items: [],
          quantity: [],
          invoiceCost: [],
        });
        return;
      }
      console.log(Array.isArray(invoiceDatafromConversation.Items).length);
      const { Items: itemsArray = [] } = invoiceDatafromConversation; // Extract "Items" array
      console.log("updateitemdetails invdfc: ", itemsArray);

      // Ensure correct mapping of extracted values
      const tempDictionary = itemsArray.reduce((acc, item) => {
        acc[item["Item ID"]] = {
          quantity: item.Quantity || 0,
          invoiceCost: item["Invoice Cost"] || 0,
        };
        return acc;
      }, {});

      // Extract structured arrays for state update
      const updatedItems = itemsArray.map((item) => item["Item ID"]);
      const updatedQuantities = itemsArray.map((item) => item.Quantity || 0);
      const updatedInvoiceCosts = itemsArray.map(
        (item) => item["Invoice Cost"] || 0
      );

      setItemsArray(updatedItems);
      setQuantitiesArray(updatedQuantities);
      setInvoiceCostArray(updatedInvoiceCosts);

      const updatedInvoiceData = {
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      };
      console.log("UpdatedInvoiceData: ", updatedInvoiceData, tempDictionary);

      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      });

      // Use prevPoDetailsDataRef.current for comparison
      const prevPoDetailsData = prevPoDetailsDataRef.current || [];

      const updatedPoDetails = prevPoDetailsData.map((item) =>
        tempDictionary[item.itemId]
          ? {
              ...item,
              invQty: tempDictionary[item.itemId].quantity,
              invAmt:
                tempDictionary[item.itemId].quantity *
                tempDictionary[item.itemId].invoiceCost,
              invCost: tempDictionary[item.itemId].invoiceCost,
            }
          : item
      );

      // Identify new items not present in prevPoDetailsData
      const newItems = Object.keys(tempDictionary)
        .filter(
          (itemId) =>
            !prevPoDetailsData.some((entry) => entry.itemId === itemId)
        )
        .map((itemId) => ({
          itemId,
          invQty: tempDictionary[itemId].quantity,
          invAmt:
            tempDictionary[itemId].quantity *
            tempDictionary[itemId].invoiceCost,
          invCost: tempDictionary[itemId].invoiceCost,
          itemQuantity: 0,
          itemDescription: "",
          totalItemCost: 0,
          supplierId: "",
          itemCost: 0,
          poId: prevPoDetailsData[0]?.poId || "", // Preserve existing PO ID
        }));

      // Merge updates and new items
      value.setPoDetailsData([...updatedPoDetails, ...newItems]);
    },
    [value.itemDetails, value.invoiceDatafromConversation]
  );

  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "Invoice Type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "Quantities":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "Invoice Number":
              updatedInvoiceData.userInvNo = invoiceObject[key];
              break;
            case "Total Amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "Date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "Total Tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "PO Number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );

  //API CALLS
  //user input

  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;

    // const newMessages = inputFromUpload
    //   ? [...messages]
    //   : [...messages, { text: input, fromUser: true }];
    // if (!inputFromUpload) {
    //   setMessages(newMessages);
    //   setInput("");
    // }
    setMessages((prevMessages) => {
      const newMessages = inputFromUpload
        ? [...prevMessages] // Do not add any new message for inputFromUpload
        : [...prevMessages, { text: input, fromUser: true }];

      if (!inputFromUpload) {
        setInput(""); // Clear input if it's not from an upload
      }

      return newMessages;
    });
    // setMessages(newMessages);
    setInput("");
    //typingIndicator
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(true);
    }, 1500);

    //typingIndicator
    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);
      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }
      if (response.status === 200 || response.status === 201) {
        const invoice_json = response.data.invoice_json;
        // const invoice_json = JSON.parse(response.data.invoice_json);
        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {/* {text.slice(5)} */}
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          // if (!inputFromUpload) {
          // setMessages([
          //   ...messages,
          //   { text: formattedConversation, fromUser: false },
          // ]);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submissionStatus == "submitted") {
            // let validationStatus = await itemQuantityValidation();
            // if (validationStatus) {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            // if (!inputFromUpload) {
            // setMessages([
            //   ...messages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedConversation, fromUser: false },
            ]);
            // }
            // setMessages([
            //   ...newMessages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            if (response.data.submissionStatus == "submitted") {
              // let validationStatus = await itemQuantityValidation();
              // if (validationStatus) {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
              // }
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
        //typingIndicator
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setTyping(false);
        //typingIndicator
      }
    } catch (error) {
      //typingIndicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
      //typingIndicator

      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.systemDocumentId,
        itemCost: item.invCost,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      value.setModalDetails({
        visible: true,
        text: "Invoice Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.systemDocumentId,
      userInvNo: value.invoiceData.userInvNo,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "Pending",
      total_cost: value.invoiceData.totalAmount - value.invoiceData.totalTax,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
      invoicedate: formatDate(value.invoiceData.invoiceDate),
      total_qty: sumQuantities(value.itemDetails.quantity),
    };
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: invData,
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
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice Header Creation Error:", error, error.data);
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
    setUploadLoading(true);

    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/uploadGpt/`,
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
        {typing && <TypingIndicatorComponent scrollToBottom={scrollToBottom} />}
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

//09-03-2025 before adding user in handlemsgsubmit
//08-03-2025 working code-with total amount and tax correction
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

export default function ChatbotPane() {
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
  const submitFormData = async () => {
    await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);
    //to test get invoice details
    // await getInvoiceDetails("INV498");
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
    // getPoDetails("");
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
  // useEffect(()=>{
  //   typeSelection(value.invoiceDatafromConversation)
  // },[value.invoiceDatafromConversation])
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
        const invoiceType = invoiceVal["Invoice Type"];
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
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
      }
      prevIdRef.current = id; // Update the previous ID
      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        console.log("PO Response: ", response.data);
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            supplierId: poHeader.supplierId,
            // invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
            invCost: 0,
          }));
          value.setItemListPo(
            response.data.po_details.map((item) => item.itemId)
          );
          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
              invoiceCost: newUpdatedData.map((item) => item.invCost),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
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
  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (
  //       !invoiceDatafromConversation ||
  //       Object.keys(invoiceDatafromConversation).length === 0
  //     ) {
  //       value.setItemDetails({
  //         items: "",
  //         quantity: "",
  //         invoiceCost: "",
  //       });
  //       return;
  //     }
  //     const {
  //       'Items': items = "",
  //       'Quantities': quantity = "",
  //       'Invoice Costs': invoiceCost = "",
  //     } = invoiceDatafromConversation;
  //     console.log("updateitemdetails invdfc: ", items, quantity, invoiceCost);
  //     const itemsArray = Array.isArray(items)
  //       ? items
  //       : items.split(", ").map((item) => item.trim());
  //     const quantitiesArray = Array.isArray(quantity)
  //       ? quantity
  //       : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     const invCostArray = Array.isArray(invoiceCost)
  //       ? invoiceCost
  //       : invoiceCost
  //           .split(", ")
  //           .map((invCost) => parseInt(invCost.trim(), 10));

  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = {
  //         quantity: quantitiesArray[index] || 0,
  //         invoiceCost: invCostArray[index] || 0,
  //       };
  //       return acc;
  //     }, {});
  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setInvoiceCostArray(invCostArray);
  //     const updatedInvoiceData = { items, quantity, invoiceCost };
  //     console.log(
  //       "UpdatedInvoiceData: ",
  //       updatedInvoiceData,
  //       quantitiesArray,
  //       tempDictionary
  //     );
  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({
  //       items: itemsArray,
  //       quantity: quantitiesArray,
  //       invoiceCost: invCostArray,
  //     });

  //     // Use prevPoDetailsDataRef.current instead of value.poDetailsData
  //     const prevPoDetailsData = prevPoDetailsDataRef.current;
  //     const detailsFromDictionary = {
  //       itemId: tempDictionary.item,
  //       invQty: tempDictionary.quantity,
  //       invAmt: tempDictionary.quantity * tempDictionary.invoiceCost,
  //       invCost: tempDictionary.invoiceCost,
  //     };

  //     // Only update poDetailsData if it has changed
  //     if (prevPoDetailsData?.length > 0) {
  //       // value.setPoDetailsData((prevDetails) => {
  //       //   const updatedPoDetails = prevDetails.map((item) =>
  //       //     tempDictionary[item.itemId] !== undefined
  //       //       ? {
  //       //           ...item,
  //       //           invQty: tempDictionary[item.itemId].quantity,
  //       //           invAmt:
  //       //             tempDictionary[item.itemId].quantity *
  //       //             tempDictionary[item.itemId].invoiceCost,
  //       //           invCost: tempDictionary[item.itemId].invoiceCost,
  //       //         }
  //       //       : item
  //       //   );
  //       //   return updatedPoDetails;
  //       // });
  //       const updatedPoDetails = prevPoDetailsData.map((item) =>
  //         tempDictionary[item.itemId]
  //           ? {
  //               ...item,
  //               invQty: tempDictionary[item.itemId].quantity,
  //               invAmt:
  //                 tempDictionary[item.itemId].quantity *
  //                 tempDictionary[item.itemId].invoiceCost,
  //               invCost: tempDictionary[item.itemId].invoiceCost,
  //             }
  //           : item
  //       );

  //       // Identify new items not present in prevPoDetailsData
  //       const newItems = Object.keys(tempDictionary)
  //         .filter(
  //           (itemId) =>
  //             !prevPoDetailsData.some((entry) => entry.itemId === itemId)
  //         )
  //         .map((itemId) => ({
  //           itemId,
  //           invQty: tempDictionary[itemId].quantity,
  //           invAmt:
  //             tempDictionary[itemId].quantity *
  //             tempDictionary[itemId].invoiceCost,
  //           invCost: tempDictionary[itemId].invoiceCost,
  //           itemQuantity: 0,
  //           itemDescription: "",
  //           totalItemCost: 0,
  //           supplierId: "",
  //           itemCost: 0,
  //           poId: prevPoDetailsData[0]?.poId,
  //         }));

  //       // Merge updates and new items
  //       value.setPoDetailsData([...updatedPoDetails, ...newItems]);
  //     }
  //   },
  //   [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  // );
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        !Array.isArray(invoiceDatafromConversation.Items) ||
        invoiceDatafromConversation.Items.length === 0
      ) {
        value.setItemDetails({
          items: [],
          quantity: [],
          invoiceCost: [],
        });
        return;
      }
      console.log(Array.isArray(invoiceDatafromConversation.Items).length);
      const { Items: itemsArray = [] } = invoiceDatafromConversation; // Extract "Items" array
      console.log("updateitemdetails invdfc: ", itemsArray);

      // Ensure correct mapping of extracted values
      const tempDictionary = itemsArray.reduce((acc, item) => {
        acc[item["Item ID"]] = {
          quantity: item.Quantity || 0,
          invoiceCost: item["Invoice Cost"] || 0,
        };
        return acc;
      }, {});

      // Extract structured arrays for state update
      const updatedItems = itemsArray.map((item) => item["Item ID"]);
      const updatedQuantities = itemsArray.map((item) => item.Quantity || 0);
      const updatedInvoiceCosts = itemsArray.map(
        (item) => item["Invoice Cost"] || 0
      );

      setItemsArray(updatedItems);
      setQuantitiesArray(updatedQuantities);
      setInvoiceCostArray(updatedInvoiceCosts);

      const updatedInvoiceData = {
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      };
      console.log("UpdatedInvoiceData: ", updatedInvoiceData, tempDictionary);

      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: updatedItems,
        quantity: updatedQuantities,
        invoiceCost: updatedInvoiceCosts,
      });

      // Use prevPoDetailsDataRef.current for comparison
      const prevPoDetailsData = prevPoDetailsDataRef.current || [];

      const updatedPoDetails = prevPoDetailsData.map((item) =>
        tempDictionary[item.itemId]
          ? {
              ...item,
              invQty: tempDictionary[item.itemId].quantity,
              invAmt:
                tempDictionary[item.itemId].quantity *
                tempDictionary[item.itemId].invoiceCost,
              invCost: tempDictionary[item.itemId].invoiceCost,
            }
          : item
      );

      // Identify new items not present in prevPoDetailsData
      const newItems = Object.keys(tempDictionary)
        .filter(
          (itemId) =>
            !prevPoDetailsData.some((entry) => entry.itemId === itemId)
        )
        .map((itemId) => ({
          itemId,
          invQty: tempDictionary[itemId].quantity,
          invAmt:
            tempDictionary[itemId].quantity *
            tempDictionary[itemId].invoiceCost,
          invCost: tempDictionary[itemId].invoiceCost,
          itemQuantity: 0,
          itemDescription: "",
          totalItemCost: 0,
          supplierId: "",
          itemCost: 0,
          poId: prevPoDetailsData[0]?.poId || "", // Preserve existing PO ID
        }));

      // Merge updates and new items
      value.setPoDetailsData([...updatedPoDetails, ...newItems]);
    },
    [value.itemDetails, value.invoiceDatafromConversation]
  );

  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (
  //       !invoiceDatafromConversation ||
  //       Object.keys(invoiceDatafromConversation).length === 0
  //     ) {
  //       value.setItemDetails({
  //         items: "",
  //         quantity: "",
  //         invoiceCost: "",
  //       });
  //       return;
  //     }
  //     const {
  //       items: items = "",
  //       quantities: quantity = "",
  //       invoiceCost: invoiceCost = "",
  //     } = invoiceDatafromConversation;
  //     console.log("updateitemdetails invdfc: ", items, quantity, invoiceCost);
  //     const itemsArray = Array.isArray(items)
  //       ? items
  //       : items.split(", ").map((item) => item.trim());
  //     const quantitiesArray = Array.isArray(quantity)
  //       ? quantity
  //       : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     const invCostArray = Array.isArray(invoiceCost)
  //       ? invoiceCost
  //       : invoiceCost
  //           .split(", ")
  //           .map((invCost) => parseInt(invCost.trim(), 10));

  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = {
  //         quantity: quantitiesArray[index] || 0,
  //         invoiceCost: invCostArray[index] || 0,
  //       };
  //       return acc;
  //     }, {});
  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setInvoiceCostArray(invCostArray);
  //     const updatedInvoiceData = { items, quantity, invoiceCost };
  //     console.log(
  //       "UpdatedInvoiceData: ",
  //       updatedInvoiceData,
  //       quantitiesArray,
  //       tempDictionary
  //     );
  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({
  //       items: itemsArray,
  //       quantity: quantitiesArray,
  //       invoiceCost: invCostArray,
  //     });

  //     // Use prevPoDetailsDataRef.current instead of value.poDetailsData
  //     const prevPoDetailsData = prevPoDetailsDataRef.current;
  //     const detailsFromDictionary = {
  //       itemId: tempDictionary.item,
  //       invQty: tempDictionary.quantity,
  //       invAmt: tempDictionary.quantity * tempDictionary.invoiceCost,
  //       invCost: tempDictionary.invoiceCost,
  //     };

  //     // Only update poDetailsData if it has changed
  //     if (prevPoDetailsData?.length > 0) {
  //       // value.setPoDetailsData((prevDetails) => {
  //       //   const updatedPoDetails = prevDetails.map((item) =>
  //       //     tempDictionary[item.itemId] !== undefined
  //       //       ? {
  //       //           ...item,
  //       //           invQty: tempDictionary[item.itemId].quantity,
  //       //           invAmt:
  //       //             tempDictionary[item.itemId].quantity *
  //       //             tempDictionary[item.itemId].invoiceCost,
  //       //           invCost: tempDictionary[item.itemId].invoiceCost,
  //       //         }
  //       //       : item
  //       //   );
  //       //   return updatedPoDetails;
  //       // });
  //       const updatedPoDetails = prevPoDetailsData.map((item) =>
  //         tempDictionary[item.itemId]
  //           ? {
  //               ...item,
  //               invQty: tempDictionary[item.itemId].quantity,
  //               invAmt:
  //                 tempDictionary[item.itemId].quantity *
  //                 tempDictionary[item.itemId].invoiceCost,
  //               invCost: tempDictionary[item.itemId].invoiceCost,
  //             }
  //           : item
  //       );

  //       // Identify new items not present in prevPoDetailsData
  //       const newItems = Object.keys(tempDictionary)
  //         .filter(
  //           (itemId) =>
  //             !prevPoDetailsData.some((entry) => entry.itemId === itemId)
  //         )
  //         .map((itemId) => ({
  //           itemId,
  //           invQty: tempDictionary[itemId].quantity,
  //           invAmt:
  //             tempDictionary[itemId].quantity *
  //             tempDictionary[itemId].invoiceCost,
  //           invCost: tempDictionary[itemId].invoiceCost,
  //           itemQuantity: 0,
  //           itemDescription: "",
  //           totalItemCost: 0,
  //           supplierId: "",
  //           itemCost: 0,
  //           poId: prevPoDetailsData[0]?.poId,
  //         }));

  //       // Merge updates and new items
  //       value.setPoDetailsData([...updatedPoDetails, ...newItems]);
  //     }
  //   },
  //   [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  // );
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
  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "Invoice Type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "Quantities":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "Invoice Number":
              updatedInvoiceData.userInvNo = invoiceObject[key];
              break;
            case "Total Amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "Date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "Total Tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "PO Number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  // const invoiceCheck2 = useCallback(
  //   async (invoiceObject, invoiceDatafromConversation) => {
  //     let updatedInvoiceData = { ...value.invoiceData };
  //     let poStatus = false;
  //     for (const key of Object.keys(invoiceObject)) {
  //       if (invoiceObject[key] !== null) {
  //         switch (key) {
  //           case "invoice type":
  //             updatedInvoiceData.invoiceType = invoiceObject[key];
  //             break;
  //           case "quantity":
  //             updatedInvoiceData.quantity = invoiceObject[key];
  //             break;
  //           case "user invoice number":
  //             updatedInvoiceData.userInvNo = invoiceObject[key];
  //             break;
  //           case "total amount":
  //             updatedInvoiceData.totalAmount = invoiceObject[key];
  //             break;
  //           case "date":
  //             updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
  //             break;
  //           case "total tax":
  //             updatedInvoiceData.totalTax = invoiceObject[key];
  //             break;
  //           case "items":
  //             updatedInvoiceData.items = invoiceObject[key];
  //             break;
  //           case "po number":
  //             updatedInvoiceData.poNumber = invoiceObject[key];

  //             poStatus = await getPoDetails(invoiceObject[key]);
  //             console.log("PO status INSIDE GET PO DETAILS:", poStatus);
  //             if (poStatus) {
  //               updateItemDetails(invoiceDatafromConversation);
  //             } else {
  //               value.setinvoiceDatafromConversation({
  //                 ...value.invoiceDatafromConversation,
  //                 Items: "",
  //                 Quantity: "",
  //               });
  //             }
  //           // if(!poStatus){
  //           //   break
  //           // }
  //         }
  //       }
  //     }

  //     value.setInvoiceData(updatedInvoiceData);
  //     typeSelection(invoiceDatafromConversation);
  //     // updateItemDetails(invoiceDatafromConversation);

  //     return poStatus; // Default success when no PO validation is involved.
  //   },
  //   [
  //     getPoDetails,
  //     updateItemDetails,
  //     value.poDetailsData,
  //     value.invoiceDatafromConversation,
  //   ]
  // );
  useEffect(() => {
    value.setSystemDocumentId(`INV${value.invoiceCounter}`);
  }, [value.invoiceCounter]);
  //API CALLS
  //user input

  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;

    // const newMessages = inputFromUpload
    //   ? [...messages]
    //   : [...messages, { text: input, fromUser: true }];
    // if (!inputFromUpload) {
    //   setMessages(newMessages);
    //   setInput("");
    // }
    setMessages((prevMessages) => {
      const newMessages = inputFromUpload
        ? [...prevMessages] // Do not add any new message for inputFromUpload
        : [...prevMessages, { text: input, fromUser: true }];

      if (!inputFromUpload) {
        setInput(""); // Clear input if it's not from an upload
      }

      return newMessages;
    });
    // setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = response.data.invoice_json;
        // const invoice_json = JSON.parse(response.data.invoice_json);

        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );
        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);

          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {/* {text.slice(5)} */}
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          // if (!inputFromUpload) {
          // setMessages([
          //   ...messages,
          //   { text: formattedConversation, fromUser: false },
          // ]);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submissionStatus == "submitted") {
            // let validationStatus = await itemQuantityValidation();
            // if (validationStatus) {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);

            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            // if (!inputFromUpload) {
            // setMessages([
            //   ...messages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedConversation, fromUser: false },
            ]);

            // }
            // setMessages([
            //   ...newMessages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            if (response.data.submissionStatus == "submitted") {
              // let validationStatus = await itemQuantityValidation();
              // if (validationStatus) {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.systemDocumentId,
        itemCost:item.invCost,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      value.setModalDetails({
        visible: true,
        text: "Invoice Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.systemDocumentId,
      userInvNo: value.invoiceData.userInvNo,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "Pending",
      total_cost: value.invoiceData.totalAmount-value.invoiceData.totalTax,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
      invoicedate: formatDate(value.invoiceData.invoiceDate),
      total_qty: sumQuantities(value.itemDetails.quantity),
    };
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: invData,
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
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice Header Creation Error:", error, error.data);
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
        url: `http://localhost:8000/uploadGpt/`,
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
  console.log("checkConsole" , value);
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

//08-03-2025 working code-with total amount and tax correction


//27-02-2025-Regex data fetch
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

export default function ChatbotPane() {
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

  //FORM ACTIONS
  //save
  let b=[
    {
      "itemId": "string",
      "itemQuantity": 0,
      "itemDescription": "string",
      "itemCost": 0,
      "totalItemCost": 0,
      "poId": "string",
      "supplierId": "string"
    }
  ]
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
  const submitFormData = async () => {
    await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);
    //to test get invoice details
    // await getInvoiceDetails("INV498");
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
    // getPoDetails("");
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
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
      }
      prevIdRef.current = id; // Update the previous ID
      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        console.log("PO Response: ", response.data);
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            supplierId: poHeader.supplierId,
            // invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
            invCost: 0,
          }));
          value.setItemListPo(
            response.data.po_details.map((item) => item.itemId)
          );
          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
              invoiceCost: newUpdatedData.map((item) => item.invCost),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
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
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        value.setItemDetails({
          items: "",
          quantity: "",
          invoiceCost: "",
        });
        return;
      }
      const {
        'Items': items = "",
        'Quantities': quantity = "",
        'Invoice Costs': invoiceCost = "",
      } = invoiceDatafromConversation;
      console.log("updateitemdetails invdfc: ", items, quantity, invoiceCost);
      const itemsArray = Array.isArray(items)
        ? items
        : items.split(", ").map((item) => item.trim());
      const quantitiesArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
      const invCostArray = Array.isArray(invoiceCost)
        ? invoiceCost
        : invoiceCost
            .split(", ")
            .map((invCost) => parseInt(invCost.trim(), 10));

      const tempDictionary = itemsArray.reduce((acc, item, index) => {
        acc[item] = {
          quantity: quantitiesArray[index] || 0,
          invoiceCost: invCostArray[index] || 0,
        };
        return acc;
      }, {});
      setItemsArray(itemsArray);
      setQuantitiesArray(quantitiesArray);
      setInvoiceCostArray(invCostArray);
      const updatedInvoiceData = { items, quantity, invoiceCost };
      console.log(
        "UpdatedInvoiceData: ",
        updatedInvoiceData,
        quantitiesArray,
        tempDictionary
      );
      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: itemsArray,
        quantity: quantitiesArray,
        invoiceCost: invCostArray,
      });

      // Use prevPoDetailsDataRef.current instead of value.poDetailsData
      const prevPoDetailsData = prevPoDetailsDataRef.current;
      const detailsFromDictionary = {
        itemId: tempDictionary.item,
        invQty: tempDictionary.quantity,
        invAmt: tempDictionary.quantity * tempDictionary.invoiceCost,
        invCost: tempDictionary.invoiceCost,
      };

      // Only update poDetailsData if it has changed
      if (prevPoDetailsData?.length > 0) {
        // value.setPoDetailsData((prevDetails) => {
        //   const updatedPoDetails = prevDetails.map((item) =>
        //     tempDictionary[item.itemId] !== undefined
        //       ? {
        //           ...item,
        //           invQty: tempDictionary[item.itemId].quantity,
        //           invAmt:
        //             tempDictionary[item.itemId].quantity *
        //             tempDictionary[item.itemId].invoiceCost,
        //           invCost: tempDictionary[item.itemId].invoiceCost,
        //         }
        //       : item
        //   );
        //   return updatedPoDetails;
        // });
        const updatedPoDetails = prevPoDetailsData.map((item) =>
          tempDictionary[item.itemId]
            ? {
                ...item,
                invQty: tempDictionary[item.itemId].quantity,
                invAmt:
                  tempDictionary[item.itemId].quantity *
                  tempDictionary[item.itemId].invoiceCost,
                invCost: tempDictionary[item.itemId].invoiceCost,
              }
            : item
        );

        // Identify new items not present in prevPoDetailsData
        const newItems = Object.keys(tempDictionary)
          .filter(
            (itemId) =>
              !prevPoDetailsData.some((entry) => entry.itemId === itemId)
          )
          .map((itemId) => ({
            itemId,
            invQty: tempDictionary[itemId].quantity,
            invAmt:
              tempDictionary[itemId].quantity *
              tempDictionary[itemId].invoiceCost,
            invCost: tempDictionary[itemId].invoiceCost,
            itemQuantity: 0,
            itemDescription: "",
            totalItemCost: 0,
            supplierId: "",
            itemCost: 0,
            poId: prevPoDetailsData[0]?.poId,
          }));

        // Merge updates and new items
        value.setPoDetailsData([...updatedPoDetails, ...newItems]);
      }
    },
    [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  );
  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (
  //       !invoiceDatafromConversation ||
  //       Object.keys(invoiceDatafromConversation).length === 0
  //     ) {
  //       value.setItemDetails({
  //         items: "",
  //         quantity: "",
  //         invoiceCost: "",
  //       });
  //       return;
  //     }
  //     const {
  //       items: items = "",
  //       quantities: quantity = "",
  //       invoiceCost: invoiceCost = "",
  //     } = invoiceDatafromConversation;
  //     console.log("updateitemdetails invdfc: ", items, quantity, invoiceCost);
  //     const itemsArray = Array.isArray(items)
  //       ? items
  //       : items.split(", ").map((item) => item.trim());
  //     const quantitiesArray = Array.isArray(quantity)
  //       ? quantity
  //       : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     const invCostArray = Array.isArray(invoiceCost)
  //       ? invoiceCost
  //       : invoiceCost
  //           .split(", ")
  //           .map((invCost) => parseInt(invCost.trim(), 10));

  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = {
  //         quantity: quantitiesArray[index] || 0,
  //         invoiceCost: invCostArray[index] || 0,
  //       };
  //       return acc;
  //     }, {});
  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setInvoiceCostArray(invCostArray);
  //     const updatedInvoiceData = { items, quantity, invoiceCost };
  //     console.log(
  //       "UpdatedInvoiceData: ",
  //       updatedInvoiceData,
  //       quantitiesArray,
  //       tempDictionary
  //     );
  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({
  //       items: itemsArray,
  //       quantity: quantitiesArray,
  //       invoiceCost: invCostArray,
  //     });

  //     // Use prevPoDetailsDataRef.current instead of value.poDetailsData
  //     const prevPoDetailsData = prevPoDetailsDataRef.current;
  //     const detailsFromDictionary = {
  //       itemId: tempDictionary.item,
  //       invQty: tempDictionary.quantity,
  //       invAmt: tempDictionary.quantity * tempDictionary.invoiceCost,
  //       invCost: tempDictionary.invoiceCost,
  //     };

  //     // Only update poDetailsData if it has changed
  //     if (prevPoDetailsData?.length > 0) {
  //       // value.setPoDetailsData((prevDetails) => {
  //       //   const updatedPoDetails = prevDetails.map((item) =>
  //       //     tempDictionary[item.itemId] !== undefined
  //       //       ? {
  //       //           ...item,
  //       //           invQty: tempDictionary[item.itemId].quantity,
  //       //           invAmt:
  //       //             tempDictionary[item.itemId].quantity *
  //       //             tempDictionary[item.itemId].invoiceCost,
  //       //           invCost: tempDictionary[item.itemId].invoiceCost,
  //       //         }
  //       //       : item
  //       //   );
  //       //   return updatedPoDetails;
  //       // });
  //       const updatedPoDetails = prevPoDetailsData.map((item) =>
  //         tempDictionary[item.itemId]
  //           ? {
  //               ...item,
  //               invQty: tempDictionary[item.itemId].quantity,
  //               invAmt:
  //                 tempDictionary[item.itemId].quantity *
  //                 tempDictionary[item.itemId].invoiceCost,
  //               invCost: tempDictionary[item.itemId].invoiceCost,
  //             }
  //           : item
  //       );

  //       // Identify new items not present in prevPoDetailsData
  //       const newItems = Object.keys(tempDictionary)
  //         .filter(
  //           (itemId) =>
  //             !prevPoDetailsData.some((entry) => entry.itemId === itemId)
  //         )
  //         .map((itemId) => ({
  //           itemId,
  //           invQty: tempDictionary[itemId].quantity,
  //           invAmt:
  //             tempDictionary[itemId].quantity *
  //             tempDictionary[itemId].invoiceCost,
  //           invCost: tempDictionary[itemId].invoiceCost,
  //           itemQuantity: 0,
  //           itemDescription: "",
  //           totalItemCost: 0,
  //           supplierId: "",
  //           itemCost: 0,
  //           poId: prevPoDetailsData[0]?.poId,
  //         }));

  //       // Merge updates and new items
  //       value.setPoDetailsData([...updatedPoDetails, ...newItems]);
  //     }
  //   },
  //   [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  // );
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
  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "Invoice Type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "Quantities":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "Invoice Number":
              updatedInvoiceData.userInvNo = invoiceObject[key];
              break;
            case "Total Amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "Date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "Total Tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "Items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "PO Number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  // const invoiceCheck2 = useCallback(
  //   async (invoiceObject, invoiceDatafromConversation) => {
  //     let updatedInvoiceData = { ...value.invoiceData };
  //     let poStatus = false;
  //     for (const key of Object.keys(invoiceObject)) {
  //       if (invoiceObject[key] !== null) {
  //         switch (key) {
  //           case "invoice type":
  //             updatedInvoiceData.invoiceType = invoiceObject[key];
  //             break;
  //           case "quantity":
  //             updatedInvoiceData.quantity = invoiceObject[key];
  //             break;
  //           case "user invoice number":
  //             updatedInvoiceData.userInvNo = invoiceObject[key];
  //             break;
  //           case "total amount":
  //             updatedInvoiceData.totalAmount = invoiceObject[key];
  //             break;
  //           case "date":
  //             updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
  //             break;
  //           case "total tax":
  //             updatedInvoiceData.totalTax = invoiceObject[key];
  //             break;
  //           case "items":
  //             updatedInvoiceData.items = invoiceObject[key];
  //             break;
  //           case "po number":
  //             updatedInvoiceData.poNumber = invoiceObject[key];

  //             poStatus = await getPoDetails(invoiceObject[key]);
  //             console.log("PO status INSIDE GET PO DETAILS:", poStatus);
  //             if (poStatus) {
  //               updateItemDetails(invoiceDatafromConversation);
  //             } else {
  //               value.setinvoiceDatafromConversation({
  //                 ...value.invoiceDatafromConversation,
  //                 Items: "",
  //                 Quantity: "",
  //               });
  //             }
  //           // if(!poStatus){
  //           //   break
  //           // }
  //         }
  //       }
  //     }

  //     value.setInvoiceData(updatedInvoiceData);
  //     typeSelection(invoiceDatafromConversation);
  //     // updateItemDetails(invoiceDatafromConversation);

  //     return poStatus; // Default success when no PO validation is involved.
  //   },
  //   [
  //     getPoDetails,
  //     updateItemDetails,
  //     value.poDetailsData,
  //     value.invoiceDatafromConversation,
  //   ]
  // );
  useEffect(() => {
    value.setSystemDocumentId(`INV${value.invoiceCounter}`);
  }, [value.invoiceCounter]);
  //API CALLS
  //user input

  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;

    // const newMessages = inputFromUpload
    //   ? [...messages]
    //   : [...messages, { text: input, fromUser: true }];
    // if (!inputFromUpload) {
    //   setMessages(newMessages);
    //   setInput("");
    // }
    setMessages((prevMessages) => {
      const newMessages = inputFromUpload
        ? [...prevMessages] // Do not add any new message for inputFromUpload
        : [...prevMessages, { text: input, fromUser: true }];

      if (!inputFromUpload) {
        setInput(""); // Clear input if it's not from an upload
      }

      return newMessages;
    });
    // setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        // await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json =  response.data.invoice_json
        // const invoice_json = JSON.parse(response.data.invoice_json);

        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );
        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);

          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {/* {text.slice(5)} */}
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          // if (!inputFromUpload) {
          // setMessages([
          //   ...messages,
          //   { text: formattedConversation, fromUser: false },
          // ]);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submissionStatus == "submitted") {
            // let validationStatus = await itemQuantityValidation();
            // if (validationStatus) {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);

            await invoiceHeaderCreation();
            // }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            // if (!inputFromUpload) {
            // setMessages([
            //   ...messages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedConversation, fromUser: false },
            ]);

            // }
            // setMessages([
            //   ...newMessages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            if (response.data.submissionStatus == "submitted") {
              // let validationStatus = await itemQuantityValidation();
              // if (validationStatus) {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.systemDocumentId,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      value.setModalDetails({
        visible: true,
        text: "Invoice Created Successfully",
        isSuccessful: true,
      });

      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
    // extractAndSave(value.invoiceData);
    const invData = {
      invoiceId: value.systemDocumentId,
      userInvNo: value.invoiceData.userInvNo,
      invoiceType: typeofInv,
      currency: value.poHeaderData.currency,
      payment_term: value.poHeaderData.paymentTerm,
      invoice_status: "pending",
      total_cost: value.invoiceData.totalAmount,
      total_tax: value.invoiceData.totalTax,
      total_amount: value.invoiceData.totalAmount,
      invoicedate: formatDate(value.invoiceData.invoiceDate),
      total_qty: sumQuantities(value.itemDetails.quantity),
    };
    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:8000/invCreation/`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: invData,
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
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text: "An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice Header Creation Error:", error, error.data);
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
        url: `http://localhost:8000/uploadGpt/`,
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
  console.log("checkConsole",value);
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

//27-02-2025-Regex data fetch

//05/02/2025- Working Code, before adding invCost
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
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
  const submitFormData = async () => {
    // // await invoiceHeaderCreation();
    await handleMessageSubmit("Please submit the data provided");
    value.setFormSubmit((prevState) => !prevState);
    // await getInvoiceDetails("INV498");
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
      supplierId: "",
    });
    // getPoDetails("");
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
        value.setItemDetails({ items: "", quantity: "" });
        value.setItemDetailsInput({ items: "", quantity: "" });
      }
      prevIdRef.current = id; // Update the previous ID

      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
          }));
          value.setItemListPo(
            response.data.po_details.map((item) => item.itemId)
          );
          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
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
      // if (prevIdRef.current && prevIdRef.current !== id) {
      //   console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
      //   value.setPoDetailsData([]); // Clear old data before fetching new PO details
      //   value.setItemDetails({ items: "", quantity: "" });
      //   value.setItemDetailsInput({ items: "", quantity: "" });
      // }
      // prevIdRef.current = id; // Update the previous ID

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
          // {
          //   "itemQuantity": 0,
          //   "itemId": "ID123",
          //   "itemCost": 2000,
          //   "poId": "PO123",
          //   "id": 215,
          //   "itemDescription": "Item 1",
          //   "totalItemCost": 0,
          //   "invoiceNumber": "INV498"
          // }
          // "invoiceId": "INV498",
          // "invoiceType": "merchandise",
          // "payment_term": "Cash",
          // "total_qty": 2,
          // "total_tax": 180,
          // "supplierId": "ashish",
          // "invoicedate": "2024-06-12",
          // "currency": "Rupee",
          // "invoice_status": "pending",
          // "total_cost": 1000,
          // "total_amount": 1000

          // const poHeader = response.data.po_header;
          // const updatedPoHeaderData = {
          //   ...value.poHeaderData,
          //   currency: poHeader.currency,
          //   totalCost: poHeader.totalCost,
          //   invoiceNo: "INV" + value.invoiceCounter,
          //   exchangeRate: 1,
          //   paymentTerm: poHeader.payment_term,
          // };

          // value.setPoHeaderData(updatedPoHeaderData);
          // const newUpdatedData = response.data.po_details.map((item) => ({
          //   ...item,
          //   invQty: 0,
          //   invAmt: 0,
          // }));

          // value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          // prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          // if (newUpdatedData.length > 0) {
          //   value.setItemDetailsInput({
          //     items: newUpdatedData.map((item) => item.itemId),
          //     quantity: newUpdatedData.map((item) => item.invQty),
          //   });
          // }

          // updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          // return true;
        } else {
          // return false;
          console.log("Error fetching invoice details:");
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
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
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        value.setItemDetails({ items: "", quantity: "" });
        return;
      }

      const { items: items = "", quantities: quantity = "" } =
        invoiceDatafromConversation;
      console.log("updateitemdetails invdfc: ", items, quantity);
      const itemsArray = Array.isArray(items)
        ? items
        : items.split(", ").map((item) => item.trim());
      const quantitiesArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

      // Create a dictionary mapping items to their quantities
      const tempDictionary = itemsArray.reduce((acc, item, index) => {
        acc[item] = quantitiesArray[index];
        return acc;
      }, {});

      setItemsArray(itemsArray);
      setQuantitiesArray(quantitiesArray);

      const updatedInvoiceData = { items, quantity };
      console.log(
        "UpdatedInvoiceData: ",
        updatedInvoiceData,
        quantitiesArray,
        tempDictionary
      );
      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: itemsArray,
        quantity: quantitiesArray,
      });

      // Use prevPoDetailsDataRef.current instead of value.poDetailsData
      const prevPoDetailsData = prevPoDetailsDataRef.current;

      // Only update poDetailsData if it has changed
      if (prevPoDetailsData?.length > 0) {
        value.setPoDetailsData((prevDetails) => {
          const updatedPoDetails = prevDetails.map((item) =>
            tempDictionary[item.itemId] !== undefined
              ? {
                  ...item,
                  invQty: tempDictionary[item.itemId],
                  invAmt:
                    tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
                }
              : item
          );
          return updatedPoDetails;
        });
      }
    },
    [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  );
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
  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  //API CALLS
  //user input
  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    if (!inputFromUpload) {
      setMessages(newMessages);
      setInput("");
    }
    // setMessages(newMessages);
    // setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (response.data.test_model_reply === "Fetch") {
        value.setIsActive(false);
        await getInvoiceDetails("INV498");
      } else if (response.data.submissionStatus === "submitted") {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);

        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );
        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        const uploadText =
          "Here is what I could extract from the uploaded document: \n";
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);

          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {/* {text.slice(5)} */}
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          // if (!inputFromUpload) {
          setMessages([
            ...newMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          // }
          if (response.data.submissionStatus == "submitted") {
            let validationStatus = await itemQuantityValidation();
            if (validationStatus) {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
            }
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
                </ReactMarkdown>
              ));
            // if (!inputFromUpload) {
            setMessages([
              ...newMessages,
              { text: formattedConversation, fromUser: false },
            ]);
            // }
            // setMessages([
            //   ...newMessages,
            //   { text: formattedConversation, fromUser: false },
            // ]);
            if (response.data.submissionStatus == "submitted") {
              let validationStatus = await itemQuantityValidation();
              if (validationStatus) {
                value.setInvoiceCounter((prevCounter) => prevCounter + 1);
                await invoiceHeaderCreation();
              }
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      value.setModalDetails({
        visible: true,
        text: "Invoice Created Successfully",
        isSuccessful: true,
      });
      
      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text:"An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
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
      // console.log("invoice Creation Response:", response.data);
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

      // value.setModalText("Invoice created successfully!");
      await clearDataApi();

      // Set pdfCardVisible to true to ensure it stays visible
      setPdfCardVisible(false);
    } catch (error) {
      value.setModalDetails({
        visible: true,
        text: "An Error occured while creating Invoice",
        isSuccessful: false,
      });
      setMessages([
        ...messages,
        { text:"An Error occured while creating Invoice", fromUser: false },
      ]);
      console.log("Invoice Header Creation Error:", error, error.data);
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
        method: "post",
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
  console.log("checkConsole ");
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

//05/02/2025- Working Code, before adding invCost

//02-02-2025 -Invoice upload logic, formatting, emoji
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const { input, setInput } = value;
  const prevPoDetailsDataRef = useRef(value.poDetailsData);
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const regexPattern =
    /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
  const messageEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef(null);
  // const formRef = useRef(null);
  // const [formWidth, setFormWidth] = useState("100%");
  // const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  // useEffect(() => {
  //   if (formRef.current) {
  //     setFormWidth(`${formRef.current.parentElement.offsetWidth}px`);
  //   }
  // }, []);

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
  const submitFormData = async () => {
    // await invoiceHeaderCreation();
    await handleMessageSubmit("Please submit the data provided");

    value.setFormSubmit((prevState) => !prevState);
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
      supplierId: "",
    });
    // getPoDetails("");
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
  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
        value.setItemDetails({ items: "", quantity: "" });
        value.setItemDetailsInput({ items: "", quantity: "" });
      }

      prevIdRef.current = id; // Update the previous ID

      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
          }));

          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
  );
  //ITEM AND QUANTITY UPDATES
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        value.setItemDetails({ items: "", quantity: "" });
        return;
      }

      const { items: items = "", quantities: quantity = "" } =
        invoiceDatafromConversation;
      console.log("updateitemdetails invdfc: ", items, quantity);
      const itemsArray = Array.isArray(items)
        ? items
        : items.split(", ").map((item) => item.trim());
      const quantitiesArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

      // Create a dictionary mapping items to their quantities
      const tempDictionary = itemsArray.reduce((acc, item, index) => {
        acc[item] = quantitiesArray[index];
        return acc;
      }, {});

      setItemsArray(itemsArray);
      setQuantitiesArray(quantitiesArray);

      const updatedInvoiceData = { items, quantity };
      console.log(
        "UpdatedInvoiceData: ",
        updatedInvoiceData,
        quantitiesArray,
        tempDictionary
      );
      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: itemsArray,
        quantity: quantitiesArray,
      });

      // Use prevPoDetailsDataRef.current instead of value.poDetailsData
      const prevPoDetailsData = prevPoDetailsDataRef.current;

      // Only update poDetailsData if it has changed
      if (prevPoDetailsData?.length > 0) {
        value.setPoDetailsData((prevDetails) => {
          const updatedPoDetails = prevDetails.map((item) =>
            tempDictionary[item.itemId] !== undefined
              ? {
                  ...item,
                  invQty: tempDictionary[item.itemId],
                  invAmt:
                    tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
                }
              : item
          );
          return updatedPoDetails;
        });
      }
    },
    [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  );
  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  //API CALLS
  //user input
  const handleMessageSubmit = async (input, inputFromUpload) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);

        let updatedInvoiceJson = {
          ...invoice_json,
          ...(invoice_json["total amount"] && {
            "total amount": parseFloat(
              invoice_json["total amount"].replace(/,/g, "")
            ),
          }),
          ...(invoice_json["total tax"] && {
            "total tax": parseFloat(
              invoice_json["total tax"].replace(/,/g, "")
            ),
          }),
        };
        // console.log(
        //   "invoice_json: ",
        //   invoice_json,
        //   "updatedInvoiceJson: ",
        //   updatedInvoiceJson
        // );
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );
        const invoiceCheckStatus = await invoiceCheck2(
          updatedInvoiceJson,
          response.data.invoiceDatafromConversation
        );
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const uploadText =
            "Here is what I could extract from the uploaded document: \n";
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages([
            ...newMessages,
            { text: formattedConversation, fromUser: false },
          ]);
          if (response.data.submissionStatus == "submitted") {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
          } else {
            value.setModalVisible(false);
          }
        } else {
          if (invoiceCheckStatus) {
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
            setMessages([
              ...newMessages,
              { text: formattedConversation, fromUser: false },
            ]);
            if (response.data.submissionStatus == "submitted") {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
            } else {
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  //create invoice details
  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      // console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  //create invoice header
  const invoiceHeaderCreation = async () => {
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
      // console.log("invoice Creation Response:", response.data);
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

  const formatInvoice = (jsonData) => {
    return Object.entries(jsonData)
      .map(
        ([key, value]) =>
          `${key
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase())}: ${value ?? "N/A"}`
      )
      .join("\n");
  };
  const [previewUrl, setPreviewUrl] = useState(null);
  const handleDownload = (file) => {
    if (file) {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = file.name; // Use file name from the input
      link.click();
    }
  };

  const uploadInvoice = async (event) => {
    let file = event.target.files[0];
    console.log("Event:", event.target.files);
    const formData = new FormData();
    formData.append("file", file);
    setPreviewUrl(URL.createObjectURL(file));
    let fileUrl = URL.createObjectURL(file);
    console.log("prev url: ", URL.createObjectURL(file));
    let fileDetails = {
      status: true,
      name: file.name,
      file: file,
    };
    value.setUploadedFile(fileDetails);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        component: <PdfCard uploadedFile={fileDetails} />,
        fromUser: true,
        isFile: true,
      },
    ]);
    // if (file && file.type === "application/pdf") {
    //   const reader = new FileReader();
    //   reader.readAsArrayBuffer(file);

    //   reader.onloadend = async () => {
    //     const pdfData = new Blob([reader.result], {
    //       type: "application/pdf",
    //     });
    //     // setPdfBlob(pdfData);
    //     let fileDetails = {
    //       status: true,
    //       name: file.name,
    //       file: file,
    //     };
    //     console.log("File details: ", fileDetails);
    //     value.setUploadedFile(fileDetails);
    //     setMessages((prevMessages) => [
    //       ...prevMessages,
    //       {
    //         component: <PdfCard uploadedFile={fileDetails} />,
    //         fromUser: true,
    //         isFile: true,
    //       },
    //     ]);
    //   };
    // } else {
    //   alert("Please upload a valid PDF file.");
    // }
    // try {
    //   // const response = await axios({
    //   //   method: "post",
    //   //   url: `http://localhost:8000/upload/`,
    //   //   headers: {
    //   //     // "Content-Type": "application/json",
    //   //     "Content-Type": "multipart/form-data",
    //   //     accept: "application/json",
    //   //     "Access-Control-Allow-Origin": "*",
    //   //   },
    //   //   params: formData,
    //   // });
    //   const response = await axios.post(
    //     "http://localhost:8000/upload/",
    //     formData,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //     }
    //   );
    //   console.log("upload response: ", response.data);
    //   if (response.status === 200 || response.status === 201) {
    //     // const formattedText = Object.entries(response.data.invoice_details)
    //     //   .map(([key, value]) => `**${key}:** ${value || "N/A"}`) // Convert to Markdown string
    //     //   .join("\n\n");
    //     // const uploadText = (
    //     //   <ReactMarkdown className="botText">{formattedText}</ReactMarkdown>
    //     // );
    //     // setMessages([...messages, { text: uploadText, fromUser: false }]);
    //     // invoiceCheck2(
    //     //   response.data.invoice_details,
    //     //   response.data.invoice_data_from_conversation
    //     // );
    //     // await handleMessageSubmit(JSON.stringify(response.data.invoice_details),true)
    //     await clearDataApi();
    //     //PDF VIEW
    //     if (file && file.type === "application/pdf") {
    //       const reader = new FileReader();
    //       reader.readAsArrayBuffer(file);

    //       reader.onloadend = async () => {
    //         const pdfData = new Blob([reader.result], {
    //           type: "application/pdf",
    //         });
    //         // setPdfBlob(pdfData);
    //         value.setUploadedFile({
    //           status: true,
    //           name: response.data.file_name,
    //           file: pdfData,
    //         });
    //         setMessages((prevMessages) => [
    //           ...prevMessages,
    //           {
    //             component: (
    //               <PdfCard
    //               uploadedFile={value.uploadedFile}
    //               />
    //             ),
    //             fromUser: false,
    //             isFile: true,
    //           },
    //         ]);
    //       };
    //     } else {
    //       alert("Please upload a valid PDF file.");
    //     }

    //     await handleMessageSubmit(
    //       formatInvoice(response.data.invoice_details),
    //       true
    //     );
    //   }
    // } catch (error) {
    //   console.log("Upload Error:", error, error.data);
    // }
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

  // Helper function to handle bot responses
  // const handleBotResponse = (response, newMessages) => {
  //   const botReply = response.data.conversation.slice(-1);
  //   const formattedConversation = botReply.map((text, index) => (
  //     <ReactMarkdown key={index} className={"botText"}>
  //       {text.slice(5)}
  //     </ReactMarkdown>
  //   ));
  //   setMessages([
  //     ...newMessages,
  //     { text: formattedConversation, fromUser: false },
  //   ]);
  // };


  //EMOJI PICKER
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef(null);

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
  console.log("checkConsole  ");
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

//02-02-2025

//01-02-2025 -Updated Backend Logic for Multiple Items &Quantities
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  // const [input, setInput] = useState("");
  const prevPoDetailsDataRef = useRef(value.poDetailsData);


  const formRef = useRef(null);
  const [formWidth, setFormWidth] = useState("100%");

  useEffect(() => {
    if (formRef.current) {
      setFormWidth(`${formRef.current.parentElement.offsetWidth}px`);
    }
  }, []);


  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);
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
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
        value.setItemDetails({ items: "", quantity: "" });
        value.setItemDetailsInput({ items: "", quantity: "" });
      }

      prevIdRef.current = id; // Update the previous ID

      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
          }));

          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
  );

  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        value.setItemDetails({ items: "", quantity: "" });
        return;
      }

      const { Items: items = "", Quantities: quantity = "" } =
        invoiceDatafromConversation;

      const itemsArray = Array.isArray(items)
        ? items
        : items.split(", ").map((item) => item.trim());
      const quantitiesArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

      // Create a dictionary mapping items to their quantities
      const tempDictionary = itemsArray.reduce((acc, item, index) => {
        acc[item] = quantitiesArray[index];
        return acc;
      }, {});

      setItemsArray(itemsArray);
      setQuantitiesArray(quantitiesArray);
      setDictionary(tempDictionary);

      const updatedInvoiceData = { items, quantity };
      console.log("UpdatedInvoiceData: ",updatedInvoiceData)
      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: itemsArray,
        quantity: quantitiesArray,
      });

      // Use prevPoDetailsDataRef.current instead of value.poDetailsData
      const prevPoDetailsData = prevPoDetailsDataRef.current;

      // Only update poDetailsData if it has changed
      if (prevPoDetailsData?.length > 0) {
        value.setPoDetailsData((prevDetails) => {
          const updatedPoDetails = prevDetails.map((item) =>
            tempDictionary[item.itemId] !== undefined
              ? {
                  ...item,
                  invQty: tempDictionary[item.itemId],
                  invAmt:
                    tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
                }
              : item
          );
          return updatedPoDetails;
        });
      }
    },
    [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  );
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              setGetPoSuccesful(false);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  // Effect hook
  useEffect(() => {
    if (value.invoiceDatafromConversation) {
      typeSelection(value.invoiceDatafromConversation);
      updateItemDetails(value.invoiceDatafromConversation);
    }

    // Check if `poDetailsData` has changed from the previous value
    if (prevPoDetailsDataRef.current !== value.poDetailsData) {
      // Perform logic for when poDetailsData has changed
      prevPoDetailsDataRef.current = value.poDetailsData; // Update ref to the current state

      if (value.poDetailsData?.length > 0) {
        updateItemDetails(value.invoiceDatafromConversation);
      }
    }
  }, [
    value.invoiceData.invoiceType,
    value.invoiceDatafromConversation,
    // prevPoDetailsDataRef.current,  // Dependency on the ref to track previous state
  ]);

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
      supplierId: "",
    });
    // getPoDetails("");
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

  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      // console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
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
      // console.log(
      //   "Creation Called",
      //   invData,
      //   formatDate(value.invoiceData.invoiceDate),
      //   sumQuantities(value.itemDetails.quantity)
      // );
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
      // console.log("invoice Creation Response:", response.data);
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
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const [dictionary, setDictionary] = useState({});

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
  //   const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (Object.keys(invoiceDatafromConversation).length > 0) {
  //       let updatedInvoiceData = { ...value.itemDetails };
  //       const items = invoiceDatafromConversation["Items"];
  //       const quantity = invoiceDatafromConversation["Quantity"];
  //       // const items = invoiceDatafromConversation["items"];
  //       // const quantity = invoiceDatafromConversation["quantity"];
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
  //       console.log("updateItemDetails: arrayitems and array qty", arrayItems, arrayQty);

  //       const tempDictionary = {};
  //       arrayItems.forEach((item, index) => {
  //         tempDictionary[item] = arrayQty[index];
  //       });
  //       setDictionary(tempDictionary);
  //       value.setItemDetails(updatedInvoiceData);
  //       if (itemsArray && quantitiesArray &&getPoSuccessful) {
  //         value.setItemDetailsInput({
  //           items: itemsArray,
  //           quantity: quantitiesArray,
  //         });
  //         updatePo(itemsArray, quantitiesArray);
  //       }
  //       else{
  //         setItemsArray([])
  //         setQuantitiesArray([])
  //       }

  //       // if (value.poDetailsData.length > 0) {

  //       // }
  //     } else {
  //       value.setItemDetails({
  //         items: "",
  //         quantity: "",
  //       });
  //     }
  //   },
  //   [
  //     value.poDetailsData,
  //     value.invoiceData.invoiceType,
  //     value.invoiceDatafromConversation,
  //     value.setPoDetailsData,
  //     value.itemDetails,
  //   ]
  // );

  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (Object.keys(invoiceDatafromConversation).length === 0) {
  //       value.setItemDetails({ items: "", quantity: "" });
  //       return;
  //     }

  //     const { Items: items = "", Quantity: quantity = "" } = invoiceDatafromConversation;
  //     const updatedInvoiceData = { ...value.itemDetails, items, quantity };

  //     const itemsArray =items.split(", ").map((item) => item.trim());
  //     const quantitiesArray = quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     console.log("UID Items and Q array:",itemsArray,quantitiesArray)
  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = quantitiesArray[index];
  //       return acc;
  //     }, {});

  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setDictionary(tempDictionary);

  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({ items: itemsArray, quantity: quantitiesArray });

  //     if (value.poDetailsData.length > 0) {
  //       updatePo(itemsArray, quantitiesArray);
  //     }
  //   },
  //   [value.poDetailsData, value.itemDetails]
  // );

  // const updatePo = (itemsArray, quantitiesArray) => {
  //   const data = convertItemDetailsToData({ items: itemsArray, quantity: quantitiesArray });
  //   if (!data) return;
  // console.log("updatePo data",data)
  //   value.setPoDetailsData((prevDetails) =>
  //     prevDetails.map((item) =>
  //       data[item.itemId] !== undefined
  //         ? {
  //             ...item,
  //             invQty: data[item.itemId],
  //             invAmt: data[item.itemId] * parseInt(item.itemCost, 10),
  //           }
  //         : item
  //     )
  //   );
  // };

  // const convertItemDetailsToData = ({ items = "", quantity = "" }) => {
  //   const itemArray = Array.isArray(items)
  //   ? items
  //   : items.split(",").map((item) => item.trim());

  //   console.log("tyoe:: ",typeof items)
  // const quantityArray = Array.isArray(quantity)
  //   ? quantity
  //   : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //   return itemArray.reduce((acc, item, index) => {
  //     acc[item] = quantityArray[index];
  //     return acc;
  //   }, {});
  // };

  // useEffect(() => {
  //   if (value.invoiceDatafromConversation) {
  //     typeSelection(value.invoiceDatafromConversation);
  //     updateItemDetails(value.invoiceDatafromConversation);
  //   }
  // }, [value.invoiceData.invoiceType, value.invoiceDatafromConversation]);

  // useEffect(() => {
  //   console.log(
  //     "PO Details updated:",
  //     value.poDetailsData,
  //     value.invoiceDatafromConversation
  //   );
  // }, [value.poDetailsData, value.invoiceDatafromConversation]);
  // useEffect(() => {
  //   updatePo();
  // }, [value.itemDetails]);
  const [getPoSuccesful, setGetPoSuccesful] = useState(false);
  console.log("checkConsole ");
  // Updated handleMessageSubmit function
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        // console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages([
            ...newMessages,
            { text: formattedConversation, fromUser: false },
          ]);

          // console.log("Invoice Counter", value.invoiceCounter);
          if (response.data.submissionStatus == "submitted") {
            // updateItemDetails(response.data.invoiceDatafromConversation);
            // console.log(
            //   "submissionStatus",
            //   "Item Details before calling invoiceheadercreation",
            //   value.itemDetails
            // );
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
          } else {
            // console.log("invoice Creation not submitted");
            value.setModalVisible(false);
          }
        } else {
          // console.log("condition false-not null po,VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            // console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
            setMessages([
              ...newMessages,
              { text: formattedConversation, fromUser: false },
            ]);

            // console.log("Invoice Counter", value.invoiceCounter);
            if (response.data.submissionStatus == "submitted") {
              // updateItemDetails(response.data.invoiceDatafromConversation);
              // console.log(
              //   "submissionStatus",
              //   "Item Details before calling invoiceheadercreation",
              //   value.itemDetails
              // );
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
            } else {
              // console.log("invoice Creation not submitted");
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to handle bot responses
  const handleBotResponse = (response, newMessages) => {
    const botReply = response.data.conversation.slice(-1);
    const formattedConversation = botReply.map((text, index) => (
      <ReactMarkdown key={index} className={"botText"}>
        {text.slice(5)}
      </ReactMarkdown>
    ));
    setMessages([
      ...newMessages,
      { text: formattedConversation, fromUser: false },
    ]);
  };
  // console.log("PDf data:", pdfData);
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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
        // style={{ width: formWidth }}
        // style={{
        //   display: "flex",
        //   backgroundColor: "#283d76",
        //   borderRadius: "0.5rem",
        // }}
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

//01-02-2025 -Updated Backend Logic for Multiple Items &Quantities

//01-02-2025- Custom Quantity Handling
// import Box from "@mui/joy/Box";
// import Sheet from "@mui/joy/Sheet";
// import Stack from "@mui/joy/Stack";
// import React, {
//   useEffect,
//   useState,
//   useContext,
//   useRef,
//   useCallback,
// } from "react";
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
//   const [responseData, setResponseData] = useState();
//   const { input, setInput } = value;
//   const prevPoDetailsDataRef = useRef(value.poDetailsData);

//   useEffect(() => {
//     if (value.formSave) {
//       saveFormData();
//     }
//     if (value.formSubmit) {
//       submitFormData();
//     }
//   }, [value.formSave, value.formSubmit]);

//   //SAVE FORM
//   const saveFormData = async () => {
//     value.setItemDetails(value.itemDetailsInput);
//     const getTrueValueKey = (obj) => {
//       return Object.keys(obj).find((key) => obj[key] === true);
//     };
//     const itemsPresent = Object.values(value.itemDetailsInput.items).length > 0;
//     const quantitiesPresent =
//       Object.values(value.itemDetailsInput.quantity).length > 0;

//     const trueValueKey = getTrueValueKey(value.typeOfInvoice);
//     const filteredItems =
//       itemsPresent &&
//       value.itemDetailsInput.items.filter((item, index) => {
//         const matchingPoDetail = value.poDetailsData.find(
//           (poItem) => poItem.itemId === item
//         );
//         return matchingPoDetail !== undefined;
//       });

//     const filteredQuantities =
//       quantitiesPresent &&
//       value.itemDetailsInput.quantity.filter((quantity, index) => {
//         const matchingPoDetail = value.poDetailsData.find(
//           (poItem) => poItem.itemId === value.itemDetailsInput.items[index]
//         );
//         return matchingPoDetail !== undefined;
//       });
//     let savedData = `
//     ${trueValueKey ? `Type of Invoice: ${trueValueKey},` : ""}
//     ${
//       value.invoiceData.invoiceDate
//         ? `Date: ${value.invoiceData.invoiceDate},`
//         : ""
//     }
//     ${
//       value.invoiceData.poNumber
//         ? `PO number: ${value.invoiceData.poNumber},`
//         : ""
//     }
//     ${
//       value.invoiceData.supplierId
//         ? `Supplier Id: ${value.invoiceData.supplierId},`
//         : ""
//     }
//     ${
//       value.invoiceData.totalAmount
//         ? `Total amount: ${value.invoiceData.totalAmount},`
//         : ""
//     }
//     ${
//       value.invoiceData.totalTax
//         ? `Total tax: ${value.invoiceData.totalTax},`
//         : ""
//     }
//     ${
//       // value.itemDetailsInput.items
//       itemsPresent
//         ? `Items: ${filteredItems},`
//         : // ? `Items: ${value.itemDetailsInput.items},`
//           ""
//     }
//     ${
//       // value.itemDetailsInput.quantity
//       quantitiesPresent ? `Quantity: ${filteredQuantities}` : ""
//     }
//     `;

//     // setInput(
//     //   "Invoice type: Debit Note,Date: 26/06/2024,Supplier Id: SUP1123,Total amount: 6700,Total tax: 342,Items: ID123, ID124, Quantity: 2, 4 ,PO number: PO123"
//     // );
//     await handleMessageSubmit(savedData);
//     value.setFormSave((prevState) => !prevState);
//   };
//   //SUBMIT FORM
//   const submitFormData = async () => {
//     // await invoiceHeaderCreation();
//     await handleMessageSubmit("Please submit the data provided");

//     value.setFormSubmit((prevState) => !prevState);
//   };
//   //SCROLL TO BOTTOM
//   const messageEl = useRef(null);
//   const scrollToBottom = () => {
//     if (messageEl.current) {
//       messageEl.current.scrollTop = messageEl.current.scrollHeight;
//     }
//   };
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const [loading, setLoading] = useState(false);
//   const prevIdRef = useRef(null);
//   console.log("checkConsole");

//   const getPoDetails = useCallback(
//     async (id) => {
//       if (prevIdRef.current && prevIdRef.current !== id) {
//         console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
//         value.setPoDetailsData([]); // Clear old data before fetching new PO details
//         value.setItemDetails({ items: "", quantity: "" });
//         value.setItemDetailsInput({ items: "", quantity: "" });
//       }

//       prevIdRef.current = id; // Update the previous ID

//       try {
//         const response = await axios.get(
//           `http://localhost:8000/poDetails/${id}`
//         );
//         if (response.status === 200 || response.status === 201) {
//           const poHeader = response.data.po_header;
//           const updatedPoHeaderData = {
//             ...value.poHeaderData,
//             currency: poHeader.currency,
//             totalCost: poHeader.totalCost,
//             invoiceNo: "INV" + value.invoiceCounter,
//             exchangeRate: 1,
//             paymentTerm: poHeader.payment_term,
//           };

//           value.setPoHeaderData(updatedPoHeaderData);
//           const newUpdatedData = response.data.po_details.map((item) => ({
//             ...item,
//             invQty: 0,
//             invAmt: 0,
//           }));

//           value.setPoDetailsData(newUpdatedData); // Update poDetailsData
//           let itemsListFromPo = response.data.po_details.map(
//             (items) => items.itemId
//           );
//           value.setItemListPo(itemsListFromPo);
//           console.log("Items List from Po: ", itemsListFromPo);
//           prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

//           if (newUpdatedData.length > 0) {
//             value.setItemDetailsInput({
//               items: newUpdatedData.map((item) => item.itemId),
//               quantity: newUpdatedData.map((item) => item.invQty),
//             });
//           }
//           let updatedInvoiceDatafromConversation = {
//             ...value.invoiceDatafromConversation,
//             Items: itemsListFromPo.map((item) => `"${item}"`).join(","),
//             Quantity: "",
//           };
//           // console.log("Updated Invoice from conversation:",updatedInvoiceDatafromConversation)
//           // value.setinvoiceDatafromConversation(updatedInvoiceDatafromConversation);
//           // updateItemDetails(updatedInvoiceDatafromConversation); // Call updateItemDetails after state is set
//           updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
//           return true;
//         } else {
//           return false;
//         }
//       } catch (error) {
//         value.setPoDetailsData([]);
//         value.setPoHeaderData({
//           currency: "",
//           paymentTerm: "",
//           invoiceNo: "",
//           totalCost: "",
//           exchangeRate: "",
//         });
//         console.error("Error fetching PO details:", error);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           {
//             text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
//             fromUser: false,
//           },
//         ]);
//         return false;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [value.invoiceDatafromConversation]
//   );
//   const [itemsQuantityMap, setItemsQuantityMap] = useState({});
//   const [itemsRemaining, setItemsRemaining] = useState([]); // Track missing items
//   const updateItemDetails = useCallback(
//     (invoiceDatafromConversation) => {
//       if (
//         !invoiceDatafromConversation ||
//         Object.keys(invoiceDatafromConversation).length === 0
//       ) {
//         setItemsQuantityMap({});
//         setItemsRemaining(value.itemListPo);
//         return;
//       }
//       const { Items: items = "", Quantity: quantity = "" } =
//         invoiceDatafromConversation;
//       if (items && quantity) {
//         const itemsArray = Array.isArray(items)
//           ? items
//           : items.split(",").map((item) => item.trim());

//         const quantitiesArray = Array.isArray(quantity)
//           ? quantity
//           : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
//         const tempMap = { ...itemsQuantityMap };
//         itemsArray.forEach((item, index) => {
//           if (item) tempMap[item] = quantitiesArray[index];
//         });

//         setItemsQuantityMap(tempMap);
//         console.log("Updated Item-Quantity Map:", tempMap);

//         const remaining = value.itemListPo.filter(
//           (item) => !(item in tempMap) || tempMap[item] === 0
//         );
//         setItemsRemaining(remaining);
//       }
//     },
//     [itemsQuantityMap, value.itemListPo]
//   );

//   // const updateItemDetails = useCallback(
//   //   (invoiceDatafromConversation) => {
//   //     if (
//   //       !invoiceDatafromConversation ||
//   //       Object.keys(invoiceDatafromConversation).length === 0
//   //     ) {
//   //       value.setItemDetails({ items: "", quantity: "" });
//   //       return;
//   //     }

//   //     const { Items: items = "", Quantity: quantity = "" } =
//   //       invoiceDatafromConversation;

//   //     const itemsArray = Array.isArray(items)
//   //       ? items
//   //       : items.split(", ").map((item) => item.trim());
//   //     console.log("Items Array in UID and GP: ", itemsArray, value.itemListPo);
//   //     const itemsRemaining = value.itemListPo.filter(
//   //       (item) => !itemsArray.includes(item)
//   //     );
//   //     console.log("itemsRemaining: ", itemsRemaining);
//   //     //If all the items of itemListpo are not present in itemsArray, create a custom message
//   //     //  stating the missing item ids and ask to specify the quantity
//   //     // if (itemsRemaining.length > 0 && itemsArray.length < value.itemListPo.length) {
//   //     //   console.log("Inside items condition")
//   //     //   setMessages((prevMessages) => [
//   //     //     ...prevMessages,
//   //     //     {
//   //     //       text: `Please submit the quantities for the following Item IDs: ${itemsRemaining}`,
//   //     //       fromUser: false,
//   //     //     },
//   //     //   ]);
//   //     // }
//   //     const quantitiesArray = Array.isArray(quantity)
//   //       ? quantity
//   //       : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

//   //     // Create a dictionary mapping items to their quantities
//   //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
//   //       acc[item] = quantitiesArray[index];
//   //       return acc;
//   //     }, {});

//   //     setItemsArray(itemsArray);
//   //     setQuantitiesArray(quantitiesArray);
//   //     setDictionary(tempDictionary);

//   //     const updatedInvoiceData = { items, quantity };
//   //     value.setItemDetails(updatedInvoiceData);
//   //     value.setItemDetailsInput({
//   //       items: itemsArray,
//   //       quantity: quantitiesArray,
//   //     });

//   //     // Use prevPoDetailsDataRef.current instead of value.poDetailsData
//   //     const prevPoDetailsData = prevPoDetailsDataRef.current;

//   //     // Only update poDetailsData if it has changed
//   //     if (prevPoDetailsData?.length > 0) {
//   //       value.setPoDetailsData((prevDetails) => {
//   //         const updatedPoDetails = prevDetails.map((item) =>
//   //           tempDictionary[item.itemId] !== undefined
//   //             ? {
//   //                 ...item,
//   //                 invQty: tempDictionary[item.itemId],
//   //                 invAmt:
//   //                   tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
//   //               }
//   //             : item
//   //         );
//   //         return updatedPoDetails;
//   //       });
//   //     }
//   //   },
//   //   [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
//   // );
//   const invoiceCheck2 = useCallback(
//     async (invoiceObject, invoiceDatafromConversation) => {
//       let updatedInvoiceData = { ...value.invoiceData };
//       let poStatus = false;
//       for (const key of Object.keys(invoiceObject)) {
//         if (invoiceObject[key] !== null) {
//           switch (key) {
//             case "invoice type":
//               updatedInvoiceData.invoiceType = invoiceObject[key];
//               break;
//             case "quantity":
//               updatedInvoiceData.quantity = invoiceObject[key];
//               break;
//             case "supplier id":
//               updatedInvoiceData.supplierId = invoiceObject[key];
//               break;
//             case "total amount":
//               updatedInvoiceData.totalAmount = invoiceObject[key];
//               break;
//             case "date":
//               updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
//               break;
//             case "total tax":
//               updatedInvoiceData.totalTax = invoiceObject[key];
//               break;
//             case "items":
//               updatedInvoiceData.items = invoiceObject[key];
//               break;
//             case "po number":
//               updatedInvoiceData.poNumber = invoiceObject[key];

//               poStatus = await getPoDetails(invoiceObject[key]);
//               console.log("PO status INSIDE GET PO DETAILS:", poStatus);
//               if (poStatus) {
//                 updateItemDetails(invoiceDatafromConversation);
//               } else {
//                 value.setinvoiceDatafromConversation({
//                   ...value.invoiceDatafromConversation,
//                   Items: "",
//                   Quantity: "",
//                 });
//               }
//           }
//         }
//       }
//       value.setInvoiceData(updatedInvoiceData);
//       typeSelection(invoiceDatafromConversation);
//       // updateItemDetails(invoiceDatafromConversation);
//       return poStatus; // Default success when no PO validation is involved.
//     },
//     [
//       getPoDetails,
//       updateItemDetails,
//       value.poDetailsData,
//       value.invoiceDatafromConversation,
//     ]
//   );
//   // Effect hook
//   // useEffect(() => {
//   //   if (value.invoiceDatafromConversation) {
//   //     typeSelection(value.invoiceDatafromConversation);
//   //     updateItemDetails(value.invoiceDatafromConversation);
//   //   }
//   //   // Check if `poDetailsData` has changed from the previous value
//   //   if (prevPoDetailsDataRef.current !== value.poDetailsData) {
//   //     // Perform logic for when poDetailsData has changed
//   //     prevPoDetailsDataRef.current = value.poDetailsData; // Update ref to the current state

//   //     if (value.poDetailsData?.length > 0) {
//   //       updateItemDetails(value.invoiceDatafromConversation);
//   //     }
//   //   }
//   // }, [
//   //   value.invoiceData.invoiceType,
//   //   value.invoiceDatafromConversation,
//   //   // prevPoDetailsDataRef.current,  // Dependency on the ref to track previous state
//   // ]);

//   function formatDate(date) {
//     const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
//     const match = date.match(regex);

//     if (match) {
//       const day = match[1];
//       const month = match[2];
//       const year = match[3];
//       return `${year}-${month}-${day}`;
//     } else {
//       console.log("Cannot format date,returning date as it is", date);
//       return date;
//     }
//   }
//   const typeofInv = Object.keys(value.typeOfInvoice).find(
//     (key) => value.typeOfInvoice[key]
//   );
//   function sumQuantities(str) {
//     if (str) {
//       const quantitiesArray = str
//         .split(",")
//         .map((num) => parseInt(num.trim(), 10));
//       const totalQuantity = quantitiesArray.reduce(
//         (sum, current) => sum + current,
//         0
//       );
//       str = totalQuantity;
//     }
//     return str;
//   }

//   const clearFormData = () => {
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
//     // getPoDetails("");
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
//     value.setItemDetailsInput({
//       items: "",
//       quantity: "",
//     });
//     value.setinvoiceDatafromConversation({});
//   };

//   const invoiceDetailsCreation = async () => {
//     try {
//       setPdfCardVisible(true);
//       const updatedInvoiceItems = value.poDetailsData.map((item) => ({
//         ...item,
//         invoiceNumber: value.poHeaderData.invoiceNo,
//         totalItemCost: item.invAmt,
//         itemQuantity: item.invQty,
//       }));
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
//       // console.log("invoice Details Creation Response:", response.data);
//     } catch (error) {
//       // console.log("Invoice DEtails Creation Error:", error, error.data);
//     }
//   };
//   const invoiceHeaderCreation = async () => {
//     // extractAndSave(value.invoiceData);
//     const invData = {
//       invoiceId: value.poHeaderData.invoiceNo,
//       supplierId: value.invoiceData.supplierId,
//       invoiceType: typeofInv,
//       currency: value.poHeaderData.currency,
//       payment_term: value.poHeaderData.paymentTerm,
//       invoice_status: "pending",
//       total_cost: value.invoiceData.totalAmount,
//       total_tax: value.invoiceData.totalTax,
//       total_amount: value.invoiceData.totalAmount,
//     };

//     try {
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
//       // console.log("invoice Creation Response:", response.data);
//       await invoiceDetailsCreation();
//       setPdfData(value);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           component: (
//             <PdfCard
//               title={"Invoice Number: " + value.poHeaderData.invoiceNo}
//               invoiceID={value.poHeaderData.invoiceNo}
//             />
//           ),
//           fromUser: false,
//           isFile: true,
//         },
//       ]);
//       await clearDataApi();

//       // Set pdfCardVisible to true to ensure it stays visible
//       setPdfCardVisible(false);
//     } catch (error) {
//       console.log("Invoice Creation Error:", error, error.data);
//     }
//   };

//   const clearDataApi = async () => {
//     value.setModalVisible(true);
//     value.setIsActive(false);

//     try {
//       // console.log("clearDataApi");
//       const response = await axios({
//         method: "post",
//         url: `http://localhost:8000/clearData?submitted=submitted`,
//         headers: {
//           "Content-Type": "application/json",
//           accept: "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//       });
//       // console.log("invoice Clear Response:", response.data);
//       clearFormData();
//     } catch (error) {
//       // console.log("Invoice Clear Error:", error, error.data);
//     }
//   };
//   const [pdfCardVisible, setPdfCardVisible] = useState(false);
//   const [dictionary, setDictionary] = useState({});

//   const defaultTheme = createTheme();
//   const theme = useTheme();
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
//   const regexPattern =
//     /(non\s*-?\s*merchandise)|(merchandise)|(credit\s*-?\s*note)|(debit\s*-?\s*note)/i;
//   const typeSelection = useCallback(
//     (invoiceDatafromConversation) => {
//       const invoiceVal = invoiceDatafromConversation;
//       const invoiceValFromJson = value.invoiceData.invoiceType;
//       let newTypeOfInvoice = {
//         nonMerchandise: false,
//         merchandise: false,
//         creditNote: false,
//         debitNote: false,
//       };
//       if (invoiceVal && Object.keys(invoiceVal).length !== 0) {
//         const invoiceType = invoiceVal["invoiceType"];
//         if (invoiceType) {
//           const match = invoiceType.match(regexPattern);
//           if (match) {
//             const [_, nonMerchandise, merchandise, creditNote, debitNote] =
//               match;
//             newTypeOfInvoice = {
//               nonMerchandise: !!nonMerchandise,
//               merchandise: !!merchandise,
//               creditNote: !!creditNote,
//               debitNote: !!debitNote,
//             };
//           }
//         }
//         // Only update the state if it's different from the current state
//         if (
//           JSON.stringify(newTypeOfInvoice) !==
//           JSON.stringify(value.typeOfInvoice)
//         ) {
//           value.setTypeOfInvoice(newTypeOfInvoice);
//         }
//       }
//       if (value.invoiceData.invoiceType) {
//         if (value.invoiceData.invoiceType) {
//           const match = value.invoiceData.invoiceType.match(regexPattern);
//           if (match) {
//             const [_, nonMerchandise, merchandise, creditNote, debitNote] =
//               match;
//             value.setTypeOfInvoice({
//               nonMerchandise: !!nonMerchandise,
//               merchandise: !!merchandise,
//               creditNote: !!creditNote,
//               debitNote: !!debitNote,
//             });
//           } else {
//             value.setTypeOfInvoice({
//               nonMerchandise: false,
//               merchandise: false,
//               creditNote: false,
//               debitNote: false,
//             });
//           }
//         }
//       }
//     },
//     [
//       value.invoiceData,
//       value.invoiceData.invoiceType,
//       value.invoiceData.invoiceType,
//     ]
//   );
//   useEffect(() => {
//     console.log(
//       "PO Details updated:",
//       value.poDetailsData,
//       value.invoiceDatafromConversation
//     );
//   }, [value.poDetailsData, value.invoiceDatafromConversation]);
//   // Updated handleMessageSubmit function
//   console.log("Value", value);
//   const handleMessageSubmit = async (input) => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { text: input, fromUser: true }];
//     setMessages(newMessages);
//     setInput("");

//     let existingItems = value.invoiceDatafromConversation?.Items || [];
//     let existingQuantities = value.invoiceDatafromConversation?.Quantity || [];
//     console.log("existing items: ", existingItems, existingQuantities);
//     if (existingItems.length > 0 && existingQuantities.length > 0) {
//       if (typeof existingItems === "string") {
//         existingItems = existingItems.split(",").map((item) => item.trim());
//       }
//       if (typeof existingQuantities === "string") {
//         existingQuantities = existingQuantities
//           .split(",")
//           .map((qty) => parseInt(qty.trim(), 10));
//       }

//       let newQuantities = input
//         .split(",")
//         .map((qty) => parseInt(qty.trim(), 10));
//       let updatedQuantities = [...existingQuantities, ...newQuantities];

//       let invData = {
//         Items: value.itemListPo,
//         Quantity: updatedQuantities,
//       };

//       value.setinvoiceDatafromConversation(invData);
//       console.log("Updated invoice data: ", invData);

//       updateItemDetails(invData);

//       let itemsRemaining = value.itemListPo.filter(
//         (item, index) => !updatedQuantities[index]
//       );

//       // if (itemsRemaining.length > 0) {
//       //   return; // Don't proceed with API call yet
//       // }
//     }

//     try {
//       const response = await axios.post(
//         `http://localhost:8000/creation/response?query=${input}`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );

//       // console.log("Data response", response.data);

//       if (response.data.test_model_reply === "Creation") {
//         value.setIsActive(true);
//       } else if (
//         response.data.test_model_reply === "Fetch" ||
//         response.data.submissionStatus === "submitted"
//       ) {
//         value.setIsActive(false);
//       }

//       if (response.status === 200 || response.status === 201) {
//         const invoice_json = JSON.parse(response.data.invoice_json);
//         value.setinvoiceDatafromConversation(
//           response.data.invoiceDatafromConversation
//         );
//         updateItemDetails(response.data.invoiceDatafromConversation);

//         const invoiceCheckStatus = await invoiceCheck2(
//           invoice_json,
//           response.data.invoiceDatafromConversation
//         );

//         // console.log("Invoice Check Status:", invoiceCheckStatus);
//         if (value.invoiceData.poNumber === "") {
//           const botReply = response.data.conversation.slice(-1);
//           const reply = botReply[0].slice(5);
//           const formattedConversation = response.data.conversation
//             .slice(-1)
//             .map((text, index) => (
//               <ReactMarkdown key={index} className={"botText"}>
//                 {text.slice(5)}
//               </ReactMarkdown>
//             ));

//           setMessages([
//             ...newMessages,
//             { text: formattedConversation, fromUser: false },
//           ]);

//           // console.log("Invoice Counter", value.invoiceCounter);
//           if (response.data.submissionStatus == "submitted") {
//             value.setInvoiceCounter((prevCounter) => prevCounter + 1);
//             await invoiceHeaderCreation();
//           } else {
//             // console.log("invoice Creation not submitted");
//             value.setModalVisible(false);
//           }
//         } else {
//           // console.log("condition false-not null po,VALUE of inv STATUS:", invoiceCheckStatus);
//           if (invoiceCheckStatus) {
//             // console.log("invoiceCheckStatus:true");
//             const botReply = response.data.conversation.slice(-1);
//             const reply = botReply[0].slice(5);
//             const formattedConversation = response.data.conversation
//               .slice(-1)
//               .map((text, index) => (
//                 <ReactMarkdown key={index} className={"botText"}>
//                   {text.slice(5)}
//                 </ReactMarkdown>
//               ));
//             const { Items: items = "", Quantity: quantity = "" } =
//               response.data.invoiceDatafromConversation;

//             const itemsArray = Array.isArray(items)
//               ? items
//               : items.split(",").map((item) => item.trim());
//             const remaining = value.itemListPo.filter(
//               (item) => !(item in itemsArray)
//             );
//             console.log("handlesubmit itemlistPo,itemsarray and remaining: ",value.itemListPo,itemsArray,remaining)
//             if (remaining.length > 0 && remaining.length < value.itemListPo.length) {
//               setMessages((prevMessages) => [
//                 ...prevMessages,
//                 {
//                   text: `Please submit the quantities for the following Item IDs: ${itemsRemaining.join(
//                     ", "
//                   )}`,
//                   fromUser: false,
//                 },
//               ]);
//             } else {
//               console.log("Item qty failed: ",remaining.length, remaining.length,value.itemListPo.length)
//               setMessages([
//                 ...newMessages,
//                 { text: formattedConversation, fromUser: false },
//               ]);
//             }

//             if (response.data.submissionStatus == "submitted") {
//               value.setInvoiceCounter((prevCounter) => prevCounter + 1);
//               await invoiceHeaderCreation();
//             } else {
//               // console.log("invoice Creation not submitted");
//               value.setModalVisible(false);
//             }
//           } else {
//             console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   useEffect(() => {
//     if (
//       itemsRemaining.length === 0 &&
//       Object.keys(itemsQuantityMap).length > 0
//     ) {
//       console.log("✅ All items mapped. Submitting data...");
//       handleMessageSubmit(JSON.stringify(itemsQuantityMap));
//     }
//   }, [itemsRemaining, itemsQuantityMap]); // Runs when itemsRemaining changes
//   useEffect(() => {}, [dictionary, value.poDetailsData.length]);

//   return (
//     <Sheet
//       className="imageBackground"
//       sx={{
//         height: "90vh",
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#FFFAF3",
//         overflowY: "auto",
//         flexGrow: 1,
//       }}
//       ref={messageEl}
//     >
//       <Box
//         style={{
//           display: "flex",
//           flex: 1,
//           flexDirection: "column ",
//           padding: 2,
//           justifyContent: "flex-end",
//         }}
//       >
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={message.fromUser ? "user-message" : "bot-message"}
//           >
//             <ChatMessage
//               key={index}
//               text={message.text ? message.text : message.component}
//               fromUser={message.fromUser}
//               // isFile={pdfCardVisible}
//               isFile={message.isFile}
//             />
//           </div>
//         ))}
//       </Box>
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleMessageSubmit(input);
//         }}
//         id="form1"
//         className="chatbot-input-form"
//         // style={{ width: formWidth }}
//         // style={{
//         //   display: "flex",
//         //   backgroundColor: "#283d76",
//         //   borderRadius: "0.5rem",
//         // }}
//       >
//         <Add style={{ color: "white" }} />
//         <Smiley style={{ color: "white" }} />
//         <input
//           id="inputValue"
//           type="text"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => {
//             e.preventDefault();
//             setInput(e.target.value);
//           }}
//           style={{ margin: "0.5rem", height: "2rem" }}
//         />
//         <SendIcon
//           style={{ color: "white" }}
//           onClick={() => handleMessageSubmit(input)}
//         />
//         <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
//       </form>
//     </Sheet>
//   );
// }
//01-02-2025- Custom Quantity Handling

//30-01-2025
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  const prevPoDetailsDataRef = useRef(value.poDetailsData);

  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);

  //SAVE FORM
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

    // setInput(
    //   "Invoice type: Debit Note,Date: 26/06/2024,Supplier Id: SUP1123,Total amount: 6700,Total tax: 342,Items: ID123, ID124, Quantity: 2, 4 ,PO number: PO123"
    // );
    await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  //SUBMIT FORM
  const submitFormData = async () => {
    // await invoiceHeaderCreation();
    await handleMessageSubmit("Please submit the data provided");

    value.setFormSubmit((prevState) => !prevState);
  };
  //SCROLL TO BOTTOM
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
  console.log("checkConsole");

  const getPoDetails = useCallback(
    async (id) => {
      if (prevIdRef.current && prevIdRef.current !== id) {
        console.log(`ID has changed from ${prevIdRef.current} to ${id}`);
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
        value.setItemDetails({ items: "", quantity: "" });
        value.setItemDetailsInput({ items: "", quantity: "" });
      }

      prevIdRef.current = id; // Update the previous ID

      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
          }));

          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          let itemsListFromPo = response.data.po_details.map(
            (items) => items.itemId
          );
          value.setItemListPo(itemsListFromPo);
          console.log("Items List from Po: ", itemsListFromPo);
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
            });
          }
          let updatedInvoiceDatafromConversation = {
            ...value.invoiceDatafromConversation,
            Items: itemsListFromPo.map((item) => `"${item}"`).join(","),
            Quantity: "",
          };
          // console.log("Updated Invoice from conversation:",updatedInvoiceDatafromConversation)
          // value.setinvoiceDatafromConversation(updatedInvoiceDatafromConversation);
          // updateItemDetails(updatedInvoiceDatafromConversation); // Call updateItemDetails after state is set
          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
  );
  const [itemsQuantityMap, setItemsQuantityMap] = useState({});
  const [itemsRemaining, setItemsRemaining] = useState([]); // Track missing items
  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        setItemsQuantityMap({});
        setItemsRemaining(value.itemListPo);
        return;
      }
      const { Items: items = "", Quantity: quantity = "" } =
        invoiceDatafromConversation;
      if (items && quantity) {
        const itemsArray = Array.isArray(items)
          ? items
          : items.split(",").map((item) => item.trim());

        const quantitiesArray = Array.isArray(quantity)
          ? quantity
          : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
        const tempMap = { ...itemsQuantityMap };
        itemsArray.forEach((item, index) => {
          if (item) tempMap[item] = quantitiesArray[index];
        });

        setItemsQuantityMap(tempMap);
        console.log("Updated Item-Quantity Map:", tempMap);

        const remaining = value.itemListPo.filter(
          (item) => !(item in tempMap) || tempMap[item] === 0
        );
        setItemsRemaining(remaining);
      }
    },
    [itemsQuantityMap, value.itemListPo]
  );

  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (
  //       !invoiceDatafromConversation ||
  //       Object.keys(invoiceDatafromConversation).length === 0
  //     ) {
  //       value.setItemDetails({ items: "", quantity: "" });
  //       return;
  //     }

  //     const { Items: items = "", Quantity: quantity = "" } =
  //       invoiceDatafromConversation;

  //     const itemsArray = Array.isArray(items)
  //       ? items
  //       : items.split(", ").map((item) => item.trim());
  //     console.log("Items Array in UID and GP: ", itemsArray, value.itemListPo);
  //     const itemsRemaining = value.itemListPo.filter(
  //       (item) => !itemsArray.includes(item)
  //     );
  //     console.log("itemsRemaining: ", itemsRemaining);
  //     //If all the items of itemListpo are not present in itemsArray, create a custom message
  //     //  stating the missing item ids and ask to specify the quantity
  //     // if (itemsRemaining.length > 0 && itemsArray.length < value.itemListPo.length) {
  //     //   console.log("Inside items condition")
  //     //   setMessages((prevMessages) => [
  //     //     ...prevMessages,
  //     //     {
  //     //       text: `Please submit the quantities for the following Item IDs: ${itemsRemaining}`,
  //     //       fromUser: false,
  //     //     },
  //     //   ]);
  //     // }
  //     const quantitiesArray = Array.isArray(quantity)
  //       ? quantity
  //       : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

  //     // Create a dictionary mapping items to their quantities
  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = quantitiesArray[index];
  //       return acc;
  //     }, {});

  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setDictionary(tempDictionary);

  //     const updatedInvoiceData = { items, quantity };
  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({
  //       items: itemsArray,
  //       quantity: quantitiesArray,
  //     });

  //     // Use prevPoDetailsDataRef.current instead of value.poDetailsData
  //     const prevPoDetailsData = prevPoDetailsDataRef.current;

  //     // Only update poDetailsData if it has changed
  //     if (prevPoDetailsData?.length > 0) {
  //       value.setPoDetailsData((prevDetails) => {
  //         const updatedPoDetails = prevDetails.map((item) =>
  //           tempDictionary[item.itemId] !== undefined
  //             ? {
  //                 ...item,
  //                 invQty: tempDictionary[item.itemId],
  //                 invAmt:
  //                   tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
  //               }
  //             : item
  //         );
  //         return updatedPoDetails;
  //       });
  //     }
  //   },
  //   [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  // );
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
          }
        }
      }
      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);
      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  // Effect hook
  // useEffect(() => {
  //   if (value.invoiceDatafromConversation) {
  //     typeSelection(value.invoiceDatafromConversation);
  //     updateItemDetails(value.invoiceDatafromConversation);
  //   }
  //   // Check if `poDetailsData` has changed from the previous value
  //   if (prevPoDetailsDataRef.current !== value.poDetailsData) {
  //     // Perform logic for when poDetailsData has changed
  //     prevPoDetailsDataRef.current = value.poDetailsData; // Update ref to the current state

  //     if (value.poDetailsData?.length > 0) {
  //       updateItemDetails(value.invoiceDatafromConversation);
  //     }
  //   }
  // }, [
  //   value.invoiceData.invoiceType,
  //   value.invoiceDatafromConversation,
  //   // prevPoDetailsDataRef.current,  // Dependency on the ref to track previous state
  // ]);

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
      supplierId: "",
    });
    // getPoDetails("");
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

  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      // console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
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
      // console.log("invoice Creation Response:", response.data);
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
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const [dictionary, setDictionary] = useState({});

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
  useEffect(() => {
    console.log(
      "PO Details updated:",
      value.poDetailsData,
      value.invoiceDatafromConversation
    );
  }, [value.poDetailsData, value.invoiceDatafromConversation]);
  // Updated handleMessageSubmit function
  console.log("Value", value);
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    let existingItems = value.invoiceDatafromConversation?.Items || [];
    let existingQuantities = value.invoiceDatafromConversation?.Quantity || [];
    console.log("existing items: ", existingItems, existingQuantities);
    if (existingItems.length > 0 && existingQuantities.length > 0) {
      if (typeof existingItems === "string") {
        existingItems = existingItems.split(",").map((item) => item.trim());
      }
      if (typeof existingQuantities === "string") {
        existingQuantities = existingQuantities
          .split(",")
          .map((qty) => parseInt(qty.trim(), 10));
      }

      let newQuantities = input
        .split(",")
        .map((qty) => parseInt(qty.trim(), 10));
      let updatedQuantities = [...existingQuantities, ...newQuantities];

      let invData = {
        Items: value.itemListPo,
        Quantity: updatedQuantities,
      };

      value.setinvoiceDatafromConversation(invData);
      console.log("Updated invoice data: ", invData);

      updateItemDetails(invData);

      let itemsRemaining = value.itemListPo.filter(
        (item, index) => !updatedQuantities[index]
      );

      // if (itemsRemaining.length > 0) {
      //   return; // Don't proceed with API call yet
      // }
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      // console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );
        updateItemDetails(response.data.invoiceDatafromConversation);

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        // console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));

          setMessages([
            ...newMessages,
            { text: formattedConversation, fromUser: false },
          ]);

          // console.log("Invoice Counter", value.invoiceCounter);
          if (response.data.submissionStatus == "submitted") {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
          } else {
            // console.log("invoice Creation not submitted");
            value.setModalVisible(false);
          }
        } else {
          // console.log("condition false-not null po,VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            // console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
            const { Items: items = "", Quantity: quantity = "" } =
              response.data.invoiceDatafromConversation;

            const itemsArray = Array.isArray(items)
              ? items
              : items.split(",").map((item) => item.trim());
            const remaining = value.itemListPo.filter(
              (item) => !(item in itemsArray)
            );
            console.log("handlesubmit itemlistPo,itemsarray and remaining: ",value.itemListPo,itemsArray,remaining)
            if (remaining.length > 0 && remaining.length < value.itemListPo.length) {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  text: `Please submit the quantities for the following Item IDs: ${itemsRemaining.join(
                    ", "
                  )}`,
                  fromUser: false,
                },
              ]);
            } else {
              console.log("Item qty failed: ",remaining.length, remaining.length,value.itemListPo.length)
              setMessages([
                ...newMessages,
                { text: formattedConversation, fromUser: false },
              ]);
            }

            if (response.data.submissionStatus == "submitted") {
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
            } else {
              // console.log("invoice Creation not submitted");
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if (
      itemsRemaining.length === 0 &&
      Object.keys(itemsQuantityMap).length > 0
    ) {
      console.log("✅ All items mapped. Submitting data...");
      handleMessageSubmit(JSON.stringify(itemsQuantityMap));
    }
  }, [itemsRemaining, itemsQuantityMap]); // Runs when itemsRemaining changes
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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
        // style={{ width: formWidth }}
        // style={{
        //   display: "flex",
        //   backgroundColor: "#283d76",
        //   borderRadius: "0.5rem",
        // }}
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

//30-01-2025

//29-01-2025
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

export default function ChatbotPane() {
  const [messages, setMessages] = useState([]);
  const value = useContext(AuthContext);
  const [itemsArray, setItemsArray] = useState();
  const [quantitiesArray, setQuantitiesArray] = useState();
  const [pdfData, setPdfData] = useState();
  const [responseData, setResponseData] = useState();
  const { input, setInput } = value;
  // const [input, setInput] = useState("");
  const prevPoDetailsDataRef = useRef(value.poDetailsData);


  const formRef = useRef(null);
  const [formWidth, setFormWidth] = useState("100%");

  useEffect(() => {
    if (formRef.current) {
      setFormWidth(`${formRef.current.parentElement.offsetWidth}px`);
    }
  }, []);


  useEffect(() => {
    if (value.formSave) {
      saveFormData();
    }
    if (value.formSubmit) {
      submitFormData();
    }
  }, [value.formSave, value.formSubmit]);
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
        value.setPoDetailsData([]); // Clear old data before fetching new PO details
        value.setItemDetails({ items: "", quantity: "" });
        value.setItemDetailsInput({ items: "", quantity: "" });
      }

      prevIdRef.current = id; // Update the previous ID

      try {
        const response = await axios.get(
          `http://localhost:8000/poDetails/${id}`
        );
        if (response.status === 200 || response.status === 201) {
          const poHeader = response.data.po_header;
          const updatedPoHeaderData = {
            ...value.poHeaderData,
            currency: poHeader.currency,
            totalCost: poHeader.totalCost,
            invoiceNo: "INV" + value.invoiceCounter,
            exchangeRate: 1,
            paymentTerm: poHeader.payment_term,
          };

          value.setPoHeaderData(updatedPoHeaderData);
          const newUpdatedData = response.data.po_details.map((item) => ({
            ...item,
            invQty: 0,
            invAmt: 0,
          }));

          value.setPoDetailsData(newUpdatedData); // Update poDetailsData
          prevPoDetailsDataRef.current = newUpdatedData; // Update ref immediately after setting state

          if (newUpdatedData.length > 0) {
            value.setItemDetailsInput({
              items: newUpdatedData.map((item) => item.itemId),
              quantity: newUpdatedData.map((item) => item.invQty),
            });
          }

          updateItemDetails(value.invoiceDatafromConversation); // Call updateItemDetails after state is set
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        console.error("Error fetching PO details:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [value.invoiceDatafromConversation]
  );

  const updateItemDetails = useCallback(
    (invoiceDatafromConversation) => {
      if (
        !invoiceDatafromConversation ||
        Object.keys(invoiceDatafromConversation).length === 0
      ) {
        value.setItemDetails({ items: "", quantity: "" });
        return;
      }

      const { Items: items = "", Quantity: quantity = "" } =
        invoiceDatafromConversation;

      const itemsArray = Array.isArray(items)
        ? items
        : items.split(", ").map((item) => item.trim());
      const quantitiesArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));

      // Create a dictionary mapping items to their quantities
      const tempDictionary = itemsArray.reduce((acc, item, index) => {
        acc[item] = quantitiesArray[index];
        return acc;
      }, {});

      setItemsArray(itemsArray);
      setQuantitiesArray(quantitiesArray);
      setDictionary(tempDictionary);

      const updatedInvoiceData = { items, quantity };
      value.setItemDetails(updatedInvoiceData);
      value.setItemDetailsInput({
        items: itemsArray,
        quantity: quantitiesArray,
      });

      // Use prevPoDetailsDataRef.current instead of value.poDetailsData
      const prevPoDetailsData = prevPoDetailsDataRef.current;

      // Only update poDetailsData if it has changed
      if (prevPoDetailsData?.length > 0) {
        value.setPoDetailsData((prevDetails) => {
          const updatedPoDetails = prevDetails.map((item) =>
            tempDictionary[item.itemId] !== undefined
              ? {
                  ...item,
                  invQty: tempDictionary[item.itemId],
                  invAmt:
                    tempDictionary[item.itemId] * parseInt(item.itemCost, 10),
                }
              : item
          );
          return updatedPoDetails;
        });
      }
    },
    [value.itemDetails, value.invoiceDatafromConversation] // Don't depend on poDetailsData anymore
  );
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
              setGetPoSuccesful(false);
              if (poStatus) {
                updateItemDetails(invoiceDatafromConversation);
              } else {
                value.setinvoiceDatafromConversation({
                  ...value.invoiceDatafromConversation,
                  Items: "",
                  Quantity: "",
                });
              }
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      // updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [
      getPoDetails,
      updateItemDetails,
      value.poDetailsData,
      value.invoiceDatafromConversation,
    ]
  );
  // Effect hook
  useEffect(() => {
    if (value.invoiceDatafromConversation) {
      typeSelection(value.invoiceDatafromConversation);
      updateItemDetails(value.invoiceDatafromConversation);
    }

    // Check if `poDetailsData` has changed from the previous value
    if (prevPoDetailsDataRef.current !== value.poDetailsData) {
      // Perform logic for when poDetailsData has changed
      prevPoDetailsDataRef.current = value.poDetailsData; // Update ref to the current state

      if (value.poDetailsData?.length > 0) {
        updateItemDetails(value.invoiceDatafromConversation);
      }
    }
  }, [
    value.invoiceData.invoiceType,
    value.invoiceDatafromConversation,
    // prevPoDetailsDataRef.current,  // Dependency on the ref to track previous state
  ]);

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
      supplierId: "",
    });
    // getPoDetails("");
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

  const invoiceDetailsCreation = async () => {
    try {
      setPdfCardVisible(true);
      const updatedInvoiceItems = value.poDetailsData.map((item) => ({
        ...item,
        invoiceNumber: value.poHeaderData.invoiceNo,
        totalItemCost: item.invAmt,
        itemQuantity: item.invQty,
      }));
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
      // console.log("invoice Details Creation Response:", response.data);
    } catch (error) {
      // console.log("Invoice DEtails Creation Error:", error, error.data);
    }
  };
  const invoiceHeaderCreation = async () => {
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
      // console.log(
      //   "Creation Called",
      //   invData,
      //   formatDate(value.invoiceData.invoiceDate),
      //   sumQuantities(value.itemDetails.quantity)
      // );
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
      // console.log("invoice Creation Response:", response.data);
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
  const [pdfCardVisible, setPdfCardVisible] = useState(false);
  const [dictionary, setDictionary] = useState({});

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
  //   const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (Object.keys(invoiceDatafromConversation).length > 0) {
  //       let updatedInvoiceData = { ...value.itemDetails };
  //       const items = invoiceDatafromConversation["Items"];
  //       const quantity = invoiceDatafromConversation["Quantity"];
  //       // const items = invoiceDatafromConversation["items"];
  //       // const quantity = invoiceDatafromConversation["quantity"];
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
  //       console.log("updateItemDetails: arrayitems and array qty", arrayItems, arrayQty);

  //       const tempDictionary = {};
  //       arrayItems.forEach((item, index) => {
  //         tempDictionary[item] = arrayQty[index];
  //       });
  //       setDictionary(tempDictionary);
  //       value.setItemDetails(updatedInvoiceData);
  //       if (itemsArray && quantitiesArray &&getPoSuccessful) {
  //         value.setItemDetailsInput({
  //           items: itemsArray,
  //           quantity: quantitiesArray,
  //         });
  //         updatePo(itemsArray, quantitiesArray);
  //       }
  //       else{
  //         setItemsArray([])
  //         setQuantitiesArray([])
  //       }

  //       // if (value.poDetailsData.length > 0) {

  //       // }
  //     } else {
  //       value.setItemDetails({
  //         items: "",
  //         quantity: "",
  //       });
  //     }
  //   },
  //   [
  //     value.poDetailsData,
  //     value.invoiceData.invoiceType,
  //     value.invoiceDatafromConversation,
  //     value.setPoDetailsData,
  //     value.itemDetails,
  //   ]
  // );

  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (Object.keys(invoiceDatafromConversation).length === 0) {
  //       value.setItemDetails({ items: "", quantity: "" });
  //       return;
  //     }

  //     const { Items: items = "", Quantity: quantity = "" } = invoiceDatafromConversation;
  //     const updatedInvoiceData = { ...value.itemDetails, items, quantity };

  //     const itemsArray =items.split(", ").map((item) => item.trim());
  //     const quantitiesArray = quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     console.log("UID Items and Q array:",itemsArray,quantitiesArray)
  //     const tempDictionary = itemsArray.reduce((acc, item, index) => {
  //       acc[item] = quantitiesArray[index];
  //       return acc;
  //     }, {});

  //     setItemsArray(itemsArray);
  //     setQuantitiesArray(quantitiesArray);
  //     setDictionary(tempDictionary);

  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({ items: itemsArray, quantity: quantitiesArray });

  //     if (value.poDetailsData.length > 0) {
  //       updatePo(itemsArray, quantitiesArray);
  //     }
  //   },
  //   [value.poDetailsData, value.itemDetails]
  // );

  // const updatePo = (itemsArray, quantitiesArray) => {
  //   const data = convertItemDetailsToData({ items: itemsArray, quantity: quantitiesArray });
  //   if (!data) return;
  // console.log("updatePo data",data)
  //   value.setPoDetailsData((prevDetails) =>
  //     prevDetails.map((item) =>
  //       data[item.itemId] !== undefined
  //         ? {
  //             ...item,
  //             invQty: data[item.itemId],
  //             invAmt: data[item.itemId] * parseInt(item.itemCost, 10),
  //           }
  //         : item
  //     )
  //   );
  // };

  // const convertItemDetailsToData = ({ items = "", quantity = "" }) => {
  //   const itemArray = Array.isArray(items)
  //   ? items
  //   : items.split(",").map((item) => item.trim());

  //   console.log("tyoe:: ",typeof items)
  // const quantityArray = Array.isArray(quantity)
  //   ? quantity
  //   : quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //   return itemArray.reduce((acc, item, index) => {
  //     acc[item] = quantityArray[index];
  //     return acc;
  //   }, {});
  // };

  // useEffect(() => {
  //   if (value.invoiceDatafromConversation) {
  //     typeSelection(value.invoiceDatafromConversation);
  //     updateItemDetails(value.invoiceDatafromConversation);
  //   }
  // }, [value.invoiceData.invoiceType, value.invoiceDatafromConversation]);

  useEffect(() => {
    console.log(
      "PO Details updated:",
      value.poDetailsData,
      value.invoiceDatafromConversation
    );
  }, [value.poDetailsData, value.invoiceDatafromConversation]);
  // useEffect(() => {
  //   updatePo();
  // }, [value.itemDetails]);
  const [getPoSuccesful, setGetPoSuccesful] = useState(false);

  // Updated handleMessageSubmit function
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      // console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        // console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
          setMessages([
            ...newMessages,
            { text: formattedConversation, fromUser: false },
          ]);

          // console.log("Invoice Counter", value.invoiceCounter);
          if (response.data.submissionStatus == "submitted") {
            // updateItemDetails(response.data.invoiceDatafromConversation);
            // console.log(
            //   "submissionStatus",
            //   "Item Details before calling invoiceheadercreation",
            //   value.itemDetails
            // );
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
          } else {
            // console.log("invoice Creation not submitted");
            value.setModalVisible(false);
          }
        } else {
          // console.log("condition false-not null po,VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            // console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
            setMessages([
              ...newMessages,
              { text: formattedConversation, fromUser: false },
            ]);

            // console.log("Invoice Counter", value.invoiceCounter);
            if (response.data.submissionStatus == "submitted") {
              // updateItemDetails(response.data.invoiceDatafromConversation);
              // console.log(
              //   "submissionStatus",
              //   "Item Details before calling invoiceheadercreation",
              //   value.itemDetails
              // );
              value.setInvoiceCounter((prevCounter) => prevCounter + 1);
              await invoiceHeaderCreation();
            } else {
              // console.log("invoice Creation not submitted");
              value.setModalVisible(false);
            }
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to handle bot responses
  const handleBotResponse = (response, newMessages) => {
    const botReply = response.data.conversation.slice(-1);
    const formattedConversation = botReply.map((text, index) => (
      <ReactMarkdown key={index} className={"botText"}>
        {text.slice(5)}
      </ReactMarkdown>
    ));
    setMessages([
      ...newMessages,
      { text: formattedConversation, fromUser: false },
    ]);
  };
  // console.log("PDf data:", pdfData);
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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
        // style={{ width: formWidth }}
        // style={{
        //   display: "flex",
        //   backgroundColor: "#283d76",
        //   borderRadius: "0.5rem",
        // }}
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

//29-01-2025

//28-01-2025 -3
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
        if (response.status === 200 || response.status === 201) {
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
            updateItemDetails(value.invoiceDatafromConversation);
          }
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        updateItemDetails(value.invoiceDatafromConversation);
        console.error("Error fetching PO details:", error);
        let errorMsg =
          "Sorry, we couldn't find this Purchase Order in our database, please try another PO number";
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: errorMsg, fromUser: false },
        ]);
        return false;
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
    // getPoDetails("");
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
  const [dictionary, setDictionary] = useState({});

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
      if (Object.keys(invoiceDatafromConversation).length > 0) {
        let updatedInvoiceData = { ...value.itemDetails };
        console.log("update item details ", value.itemDetails.items);
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
        console.log("arrayitems and array qty", arrayItems, arrayQty);

        const tempDictionary = {};
        arrayItems.forEach((item, index) => {
          tempDictionary[item] = arrayQty[index];
        });
        setDictionary(tempDictionary);
        value.setItemDetails(updatedInvoiceData);
        if (itemsArray && quantitiesArray) {
          value.setItemDetailsInput({
            items: itemsArray,
            quantity: quantitiesArray,
          });
        }
        if (value.poDetailsData.length > 0) {
          updatePo(itemsArray, quantitiesArray);
        }
      } else {
        value.setItemDetails({
          items: "",
          quantity: "",
        });
      }
    },
    [
      value.poDetailsData,
      value.invoiceData.invoiceType,
      value.invoiceDatafromConversation,
      value.setPoDetailsData,
      value.itemDetails,
    ]
  );
  const updatePo = (itemsArray, quantitiesArray) => {
    const data = convertItemDetailsToData({
      items: itemsArray,
      quantity: quantitiesArray,
    });
    console.log("Data from convertItemDetailsToData:", data);
    if (!data) return;
    value.setPoDetailsData((prevDetails) => {
      const updatedPoDetails = prevDetails.map((item) => {
        if (data[item.itemId] !== undefined) {
          return {
            ...item,
            invQty: data[item.itemId],
            invAmt: data[item.itemId] * parseInt(item.itemCost, 10),
          };
        }
        return item;
      });
      console.log("Updated", updatedPoDetails,value.poDetailsData);
      return updatedPoDetails;
    });
    // const updatedPoDetails = value.poDetailsData.map((item) => {
    //   if (data[item.itemId] !== undefined) {
    //     return {
    //       ...item,
    //       invQty: data[item.itemId],
    //       invAmt: data[item.itemId] * parseInt(item.itemCost, 10),
    //     };
    //   }
    //   return item;
    // });

    // const hasChanges =
    //   JSON.stringify(updatedPoDetails) !== JSON.stringify(value.poDetailsData);

    // if (hasChanges) {
    //   value.setPoDetailsData(updatedPoDetails);
    // }
  };

  const convertItemDetailsToData = (itemDetails) => {
    const { items, quantity } = itemDetails;

    if (items && quantity) {
      const itemArray = Array.isArray(items)
        ? items
        : items.split(",").map((item) => item.trim());
      // Ensure `quantity` is processed correctly as a string to array
      const quantityArray = Array.isArray(quantity)
        ? quantity
        : quantity.split(",").map((qty) => parseInt(qty.trim(), 10));

      return itemArray.reduce((acc, item, index) => {
        acc[item] = quantityArray[index];
        return acc;
      }, {});
    }

    return null;
  };

  useEffect(() => {
    if (value.invoiceDatafromConversation) {
      typeSelection(value.invoiceDatafromConversation);
      updateItemDetails(value.invoiceDatafromConversation);
    }
  }, [value.invoiceData.invoiceType, value.invoiceDatafromConversation]);

  useEffect(() => {
    console.log("PO Details updated:", value.poDetailsData);
  }, [value.poDetailsData]);
  // useEffect(() => {
  //   updatePo();
  // }, [value.itemDetails]);

  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [getPoDetails, updateItemDetails]
  );

  // Updated handleMessageSubmit function
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          console.log("condition true-null po");
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
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
        } else {
          console.log("condition false-not null po");

          console.log("VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
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
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to handle bot responses
  const handleBotResponse = (response, newMessages) => {
    const botReply = response.data.conversation.slice(-1);
    const formattedConversation = botReply.map((text, index) => (
      <ReactMarkdown key={index} className={"botText"}>
        {text.slice(5)}
      </ReactMarkdown>
    ));
    setMessages([
      ...newMessages,
      { text: formattedConversation, fromUser: false },
    ]);
  };
  console.log("PDf data:", pdfData);
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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

//28-01-2025 -3
//28-01-2025 -2
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
        if (response.status === 200 || response.status === 201) {
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
          return true;
        } else {
          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });
        updateItemDetails(value.invoiceDatafromConversation);
        console.error("Error fetching PO details:", error);
        let errorMsg =
          "Sorry, we couldn't find this Purchase Order in our database, please try another PO number";
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: errorMsg, fromUser: false },
        ]);
        return false;
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
    // getPoDetails("");
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
      if (Object.keys(invoiceDatafromConversation).length > 0) {
        let updatedInvoiceData = { ...value.itemDetails };
        console.log("update item details ", value.itemDetails.items);
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
        console.log("arrayitems and array qty", arrayItems, arrayQty);

        const tempDictionary = {};
        arrayItems.forEach((item, index) => {
          tempDictionary[item] = arrayQty[index];
        });
        setDictionary(tempDictionary);
        value.setItemDetails(updatedInvoiceData);
        if (itemsArray && quantitiesArray) {
          value.setItemDetailsInput({
            items: itemsArray,
            quantity: quantitiesArray,
          });
        }
        if (value.poDetailsData.length > 0) {
          updatePo(itemsArray, quantitiesArray);
        }
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
  useEffect(() => {
    console.log("PO Details updated useeffect:", value.poDetailsData);
  }, [value.poDetailsData]);

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
  const updatePo = (itemsArray, quantitiesArray) => {
    // Convert item details
    const data = convertItemDetailsToData({
      items: itemsArray,
      quantity: quantitiesArray,
    });
    console.log("Item details in updatePo:", data, value.poDetailsData);
  
    // Create updated PO details
    const updatedItemsDetails = value.poDetailsData.map((item) => {
      if (data && data[item.itemId] !== undefined) {
        return {
          ...item,
          invQty: data[item.itemId],
          invAmt: parseInt(data[item.itemId], 10) * parseInt(item.itemCost, 10),
        };
      }
      return item;
    });
  
    console.log("Updated PO details:", updatedItemsDetails);
  
    // Compare new data with the old one
    const hasChanges =
      JSON.stringify(updatedItemsDetails) !== JSON.stringify(value.poDetailsData);
  
    if (hasChanges) {
      value.setPoDetailsData(updatedItemsDetails);
    }
  };
  console.log("  PO   DETAILS  DATA  :",value.poDetailsData)
  const convertItemDetailsToData = (itemDetails) => {
    const allEmpty = Object.values(itemDetails).every((value) => value === "");
    console.log("convert item details to data", itemDetails, allEmpty);
    const { items, quantity } = itemDetails;
    if (!allEmpty && items && quantity) {
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
    }
  };
  // useEffect(() => {
  //   updatePo();
  // }, [value.itemDetails]);

  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [getPoDetails, updateItemDetails]
  );

  // Updated handleMessageSubmit function
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          console.log("condition true-null po");
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
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
        } else {
          console.log("condition false-not null po");

          console.log("VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
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
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
            
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to handle bot responses
  const handleBotResponse = (response, newMessages) => {
    const botReply = response.data.conversation.slice(-1);
    const formattedConversation = botReply.map((text, index) => (
      <ReactMarkdown key={index} className={"botText"}>
        {text.slice(5)}
      </ReactMarkdown>
    ));
    setMessages([
      ...newMessages,
      { text: formattedConversation, fromUser: false },
    ]);
  };
  console.log("PDf data:", pdfData);
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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

//28-01-2025

//28-01-2025
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
        if (response.status === 200 || response.status === 201) {
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
          return true;
        } else {

          return false;
        }
      } catch (error) {
        value.setPoDetailsData([]);
        value.setPoHeaderData({
          currency: "",
          paymentTerm: "",
          invoiceNo: "",
          totalCost: "",
          exchangeRate: "",
        });


        // value.setItemDetails({
        //   items: "",
        //   quantity: "",
        // });
        // value.setItemDetailsInput({
        //   items: "",
        //   quantity: "",
        // });
        updateItemDetails(value.invoiceDatafromConversation);
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
        return false;
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
    // getPoDetails("");
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

  // const updateItemDetails = async (invoiceDatafromConversation) => {
  //   if (Object.keys(invoiceDatafromConversation).length > 0) {
  //     let updatedInvoiceData = { ...value.itemDetails };
  //     const items = invoiceDatafromConversation["Items"];
  //     const quantity = invoiceDatafromConversation["Quantity"];
  //     let arrayItems = [];
  //     let arrayQty = [];
  //     if (items && quantity) {
  //       updatedInvoiceData.items = items;
  //       arrayItems = items.split(", ").map((item) => item.trim());
  //       updatedInvoiceData.quantity = quantity;
  //       arrayQty = quantity.split(", ").map((qty) => parseInt(qty.trim(), 10));
  //     }
  //     await new Promise((resolve) => {
  //       value.setItemDetails(updatedInvoiceData);
  //       resolve();
  //     });
  //     updatePo(); // Guaranteed to execute after `value.setItemDetails` resolves.
  //   } else {
  //     value.setItemDetails({ items: "", quantity: "" });
  //   }
  // };
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
        console.log("arrayitems and array qty", arrayItems, arrayQty);

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
        // updatePo();

        if (value.poDetailsData.length > 0) {
          updatePo();
        }
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
    const { items, quantity } = itemDetails;
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
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };

      let poStatus = false;
      for (const key of Object.keys(invoiceObject)) {
        if (invoiceObject[key] !== null) {
          switch (key) {
            case "invoice type":
              updatedInvoiceData.invoiceType = invoiceObject[key];
              break;
            case "quantity":
              updatedInvoiceData.quantity = invoiceObject[key];
              break;
            case "supplier id":
              updatedInvoiceData.supplierId = invoiceObject[key];
              break;
            case "total amount":
              updatedInvoiceData.totalAmount = invoiceObject[key];
              break;
            case "date":
              updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
              break;
            case "total tax":
              updatedInvoiceData.totalTax = invoiceObject[key];
              break;
            case "items":
              updatedInvoiceData.items = invoiceObject[key];
              break;
            case "po number":
              updatedInvoiceData.poNumber = invoiceObject[key];

              poStatus = await getPoDetails(invoiceObject[key]);
              console.log("PO status INSIDE GET PO DETAILS:", poStatus);
            // if(!poStatus){
            //   break
            // }
          }
        }
      }

      value.setInvoiceData(updatedInvoiceData);
      typeSelection(invoiceDatafromConversation);
      updateItemDetails(invoiceDatafromConversation);

      return poStatus; // Default success when no PO validation is involved.
    },
    [getPoDetails, updateItemDetails]
  );

  // Updated handleMessageSubmit function
  const handleMessageSubmit = async (input) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, fromUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        `http://localhost:8000/creation/response?query=${input}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Data response", response.data);

      if (response.data.test_model_reply === "Creation") {
        value.setIsActive(true);
      } else if (
        response.data.test_model_reply === "Fetch" ||
        response.data.submissionStatus === "submitted"
      ) {
        value.setIsActive(false);
      }

      if (response.status === 200 || response.status === 201) {
        const invoice_json = JSON.parse(response.data.invoice_json);
        value.setinvoiceDatafromConversation(
          response.data.invoiceDatafromConversation
        );

        const invoiceCheckStatus = await invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        );

        console.log("Invoice Check Status:", invoiceCheckStatus);
        if (value.invoiceData.poNumber === "") {
          console.log("condition true-null po");
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
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
        } else {
          console.log("condition false-not null po");

          console.log("VALUE of inv STATUS:", invoiceCheckStatus);
          if (invoiceCheckStatus) {
            console.log("invoiceCheckStatus:true");
            const botReply = response.data.conversation.slice(-1);
            const reply = botReply[0].slice(5);
            const formattedConversation = response.data.conversation
              .slice(-1)
              .map((text, index) => (
                <ReactMarkdown key={index} className={"botText"}>
                  {text.slice(5)}
                </ReactMarkdown>
              ));
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
          } else {
            console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
            //   const botReply = response.data.conversation.slice(-1);
            //   const reply = botReply[0].slice(5);
            //   const formattedConversation = response.data.conversation
            //     .slice(-1)
            //     .map((text, index) => (
            //       <ReactMarkdown key={index} className={"botText"}>
            //         {text.slice(5)}
            //       </ReactMarkdown>
            //     ));
            //   setMessages([
            //     ...newMessages,
            //     { text: formattedConversation, fromUser: false },
            //   ]);

            //   console.log("Invoice Counter", value.invoiceCounter);
            //   if (response.data.submissionStatus == "submitted") {
            //     updateItemDetails(response.data.invoiceDatafromConversation);
            //     console.log(
            //       "submissionStatus",
            //       "Item Details before calling invoiceheadercreation",
            //       value.itemDetails
            //     );
            //     value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            //     await invoiceHeaderCreation();
            //   } else {
            //     console.log("invoice Creation not submitted");
            //     value.setModalVisible(false);
            //   }
          }
        }
        // if (!invoice_json.poNumber) {
        //   console.log("No PO Number Provided.");
        //   handleBotResponse(response, newMessages);

        //   if (response.data.submissionStatus === "submitted") {
        //     updateItemDetails(response.data.invoiceDatafromConversation);
        //     value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        //     await invoiceHeaderCreation();
        //   } else {
        //     value.setModalVisible(false);
        //   }
        // } else if (invoiceCheckStatus) {
        //   console.log("PO Number Validated Successfully.");
        //   handleBotResponse(response, newMessages);

        //   if (response.data.submissionStatus === "submitted") {
        //     updateItemDetails(response.data.invoiceDatafromConversation);
        //     value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        //     await invoiceHeaderCreation();
        //   } else {
        //     value.setModalVisible(false);
        //   }
        // } else {
        //   console.log("PO Validation Failed.");
        //   value.setModalVisible(false);
        // }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to handle bot responses
  const handleBotResponse = (response, newMessages) => {
    const botReply = response.data.conversation.slice(-1);
    const formattedConversation = botReply.map((text, index) => (
      <ReactMarkdown key={index} className={"botText"}>
        {text.slice(5)}
      </ReactMarkdown>
    ));
    setMessages([
      ...newMessages,
      { text: formattedConversation, fromUser: false },
    ]);
  };

  // const invoiceCheck2 = useCallback(
  //   (invoiceObject, invoiceDatafromConversation) => {
  //     let updatedInvoiceData = { ...value.invoiceData };

  //     Object.keys(invoiceObject).forEach(async (key) => {
  //       if (key === "invoice type" && invoiceObject[key] !== null) {
  //         updatedInvoiceData.invoiceType = invoiceObject[key];
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
  //         updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
  //       }
  //       if (key === "total tax" && invoiceObject[key] !== null) {
  //         updatedInvoiceData.totalTax = invoiceObject[key];
  //       }
  //       if (key === "items" && invoiceObject[key] !== null) {
  //         updatedInvoiceData.items = invoiceObject[key];
  //       }
  //       if (key === "po number" && invoiceObject[key] !== null) {
  //         updatedInvoiceData.poNumber = invoiceObject[key];

  //         const poStatus = await getPoDetails(invoiceObject[key]);
  //         console.log("po status INSIDE GET PO DETAILS", poStatus)
  //         if (poStatus) {
  //           return true;
  //         } else {
  //           return false;
  //         }

  //       }
  //     });
  //     value.setInvoiceData(updatedInvoiceData);
  //     typeSelection(invoiceDatafromConversation);
  //     console.log("update item details:");
  //     updateItemDetails(invoiceDatafromConversation);
  //   },
  //   [getPoDetails, updateItemDetails]
  // );

  console.log("PDf data:", pdfData);
  useEffect(() => {}, [dictionary, value.poDetailsData.length]);

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

//28-01-2025

//15/01/2025//
const handleMessageSubmit = async (input) => {
  // e.preventDefault();
  if (!input.trim()) return;
  const newMessages = [...messages, { text: input, fromUser: true }];
  setMessages(newMessages);
  setInput("");

  try {
    const response = await axios({
      method: "post",
      url: http://localhost:8000/creation/response?query=${input},
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

    if (response.status === 200 || response.status === 201) {
      console.log("Conversation data:", response.data.conversation);
      const invoice_json = JSON.parse(response.data.invoice_json);
      console.log("Invoice JSON:", invoice_json);
      value.setinvoiceDatafromConversation(
        response.data.invoiceDatafromConversation
      );
      const invoiceCheckStatus = await invoiceCheck2(
        invoice_json,
        response.data.invoiceDatafromConversation
      );

      console.log(
        "VALUE of inv STATUS outside if condtn:",
        typeof invoiceCheck2(
          invoice_json,
          response.data.invoiceDatafromConversation
        ),
        invoiceCheckStatus
      );
      // const invoiceCheckStatus=invoiceCheck2(invoice_json, response.data.invoiceDatafromConversation);
      console.log("invoic json po number:",invoice_json.poNumber," context po number: ",value.invoiceData.poNumber)
      if (value.invoiceData.poNumber === "") {
        console.log("condition true-null po");
        const botReply = response.data.conversation.slice(-1);
        const reply = botReply[0].slice(5);
        const formattedConversation = response.data.conversation
          .slice(-1)
          .map((text, index) => (
            <ReactMarkdown key={index} className={"botText"}>
              {text.slice(5)}
            </ReactMarkdown>
          ));
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
      } else {
        console.log("condition false-not null po");

        console.log("VALUE of inv STATUS:", invoiceCheckStatus);
        if (invoiceCheckStatus) {
          console.log("invoiceCheckStatus:true");
          const botReply = response.data.conversation.slice(-1);
          const reply = botReply[0].slice(5);
          const formattedConversation = response.data.conversation
            .slice(-1)
            .map((text, index) => (
              <ReactMarkdown key={index} className={"botText"}>
                {text.slice(5)}
              </ReactMarkdown>
            ));
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
        } else {
          console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
        //   const botReply = response.data.conversation.slice(-1);
        //   const reply = botReply[0].slice(5);
        //   const formattedConversation = response.data.conversation
        //     .slice(-1)
        //     .map((text, index) => (
        //       <ReactMarkdown key={index} className={"botText"}>
        //         {text.slice(5)}
        //       </ReactMarkdown>
        //     ));
        //   setMessages([
        //     ...newMessages,
        //     { text: formattedConversation, fromUser: false },
        //   ]);

        //   console.log("Invoice Counter", value.invoiceCounter);
        //   if (response.data.submissionStatus == "submitted") {
        //     updateItemDetails(response.data.invoiceDatafromConversation);
        //     console.log(
        //       "submissionStatus",
        //       "Item Details before calling invoiceheadercreation",
        //       value.itemDetails
        //     );
        //     value.setInvoiceCounter((prevCounter) => prevCounter + 1);
        //     await invoiceHeaderCreation();
        //   } else {
        //     console.log("invoice Creation not submitted");
        //     value.setModalVisible(false);
        //   }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

//15/01/2025//

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
    // getPoDetails("");
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

      if (response.status === 200 || response.status === 201) {
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

        // const formattedMessage = reply.split(/- /g).map((part, index) => {
        //   if (index === 0) {
        //     return <React.Fragment key={index}>{part}</React.Fragment>;
        //   } else {
        //     // Add line break after each "- "
        //     return (
        //       <React.Fragment key={index}>
        //         <br />
        //         {`•${part}`}
        //       </React.Fragment>
        //     );
        //   }
        // });
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

//15/01/2025//



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
