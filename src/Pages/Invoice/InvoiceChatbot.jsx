import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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
import PdfCard from "../../components/PDF Generation/PdfCard";
import { AuthContext } from "../../context/ContextsMasterFile";
import "../../styles/chatbot.css";
import "../../styles/general.css";
import "../../styles/chatbot.css";

// import ChatbotInputForm from "../../components/ChatMessage/ChatbotInputForm";
import { Card } from "@mui/joy";
import ChatbotInputForm from "../../components/ChatMessage/ChatbotInputForm";
import TypingIndicatorComponent from "../../components/ChatMessage/TypingIndicatorComponent";
import {
  ADD_INVOICE_DETAILS,
  FETCH_PO_BY_ID,
  NEW_RESPONSE_CREATION,
  INVOICE_CREATION,
  UPLOAD_GPT,
  CLEAR_DATA,
  SUPPLIER_RISK_INSIGHT,
  CLEAR_DATA_NEW,
} from "../../const/ApiConst";
import EmailPdf from "../../components/PDF Generation/EmailPdf";

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function InvoiceChatbot() {
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
  const errorMessage = "Sorry, an unexpected error occured";
  const poErrorMessage =
    "Sorry, we couldn't find this Purchase Order Id in our database, please try another PO number";
  const invoiceErrorMessage = "An Error occured while creating Invoice";
  const uploadError = "An error occured while uploading";
  const emailError = "An error occured while sending email";
  //FORM ACTIONS
  //save
  const [connected, setConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState(() => uuidv4()); // session-level thread id (optional)
  const [allowConcurrentRuns, setAllowConcurrentRuns] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState(null);
  const [userIntent, setUserIntent] = useState(null);

  const wsRef = useRef(null);
  const hostRef = useRef({}); // stores reconnect/backoff state
  hostRef.current.shouldReconnect = true;
  hostRef.current.retries = 0;

  const outgoingQueueRef = useRef([]); // if socket down, queue messages
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const PORT = 8000;
  const WS_PATH = "/ws/invoice_chat";

  // --- Connect function with exponential backoff ---
  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    const url = `${protocol}//${host}:${PORT}${WS_PATH}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("ws open");
      hostRef.current.retries = 0;
      setConnected(true);

      // flush queued messages
      if (outgoingQueueRef.current.length > 0) {
        outgoingQueueRef.current.forEach((m) => ws.send(m));
        outgoingQueueRef.current = [];
      }
    };
    ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (err) {
        console.error("Invalid WS message (non-JSON):", evt.data);
        return;
      }

      // Handle different message types from backend
      if (msg.type === "token") {
        const tokenText = String(msg.text ?? "");
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.fromUser === false && last.streaming) {
            const copy = [...prev];
            copy[copy.length - 1] = { ...last, text: last.text + tokenText };
            return copy;
          }
          return [
            ...prev,
            { fromUser: false, text: tokenText, streaming: true, id: uuidv4() },
          ];
        });
        setIsStreaming(true);
      } else if (msg.type === "event") {
        // Extract text from event data
        const data = msg.data;
        let text = "";

        if (typeof data === "string") {
          text = data;
        } else if (data && typeof data === "object") {
          text =
            data.text || data.content || data.message || JSON.stringify(data);
        } else {
          text = String(data ?? "");
        }

        if (text) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.fromUser === false && last.streaming) {
              const copy = [...prev];
              copy[copy.length - 1] = { ...last, text: last.text + text };
              return copy;
            }
            return [
              ...prev,
              { fromUser: false, text, streaming: true, id: uuidv4() },
            ];
          });
          setIsStreaming(true);
        }
      } else if (msg.type === "done") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.fromUser === false && last.streaming) {
            const copy = [...prev];
            copy[copy.length - 1] = { ...last, streaming: false };
            return copy;
          }
          return prev;
        });
        setIsStreaming(false);
      } else if (msg.type === "error") {
        const detail = msg.detail ?? "Unknown error from server";
        setMessages((prev) => [
          ...prev,
          {
            fromUser: false,
            text: `Error: ${detail}`,
            streaming: false,
            id: uuidv4(),
          },
        ]);
        setIsStreaming(false);
      } else if (msg.type === "extraction") {
        // Handle extraction message
        const { extracted_details, user_intent } = msg.data;
        console.log(
          "Extraction data received:",
          extracted_details,
          user_intent
        );
      } else {
        // Unknown message type
        console.warn("Unknown message type:", msg);
      }

      scrollToBottom();
    };
    ws.onclose = (e) => {
      console.log("ws closed", e);
      setConnected(false);
      if (hostRef.current.shouldReconnect) {
        const nextRetry = Math.min(
          30_000,
          500 * Math.pow(2, hostRef.current.retries)
        );
        hostRef.current.retries += 1;
        console.log(`Reconnecting in ${nextRetry}ms`);
        setTimeout(() => connect(), nextRetry);
      }
    };

    ws.onerror = (e) => {
      console.error("ws error", e);
    };
  };

  useEffect(() => {
    hostRef.current.shouldReconnect = true;
    connect();

    return () => {
      hostRef.current.shouldReconnect = false;
      try {
        wsRef.current && wsRef.current.close();
      } catch (err) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    await sendMessage(savedData);
    // await handleMessageSubmit(savedData);
    value.setFormSave((prevState) => !prevState);
  };
  //submit
  const submitFormData = async () => {
    await sendMessage("Please submit the data provided");
    // await handleMessageSubmit("Please submit the data provided");
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

  //GET INV DETAILS
  const handleRadioChange = (type) => {
    value.setTypeOfInvoice({
      merchandise: type === "merchandise",
      nonMerchandise: type === "nonMerchandise",
      debitNote: type === "debitNote",
      creditNote: type === "creditNote",
    });
  };
  // const updateItemDetails = useCallback(
  //   (invoiceDatafromConversation) => {
  //     if (
  //       !invoiceDatafromConversation ||
  //       !Array.isArray(invoiceDatafromConversation.items) ||
  //       invoiceDatafromConversation.items.length === 0
  //     ) {
  //       value.setItemDetails({
  //         items: [],
  //         quantity: [],
  //         invoiceCost: [],
  //       });
  //       return;
  //     }
  //     // console.log(Array.isArray(invoiceDatafromConversation.items).length);
  //     const { items: itemsArray = [] } = invoiceDatafromConversation; // Extract "Items" array
  //     console.log("updateitemdetails invdfc: ", itemsArray);
  //     // NEW: if *all* items have *all* keys null, bail out
  //     const allNullEntries = itemsArray.every((item) =>
  //       Object.values(item).every((v) => v === null)
  //     );
  //     if (allNullEntries) {
  //       // do nothing further
  //       return;
  //     }
  //     // Ensure correct mapping of extracted values
  //     const tempDictionary = itemsArray.reduce((acc, item) => {
  //       acc[item["item_id"]] = {
  //         quantity: item.quantity || 0,
  //         invoiceCost: item["invoice_cost"] || 0,
  //       };
  //       return acc;
  //     }, {});

  //     // Extract structured arrays for state update
  //     const updatedItems = itemsArray.map((item) => item["item_id"]);
  //     const updatedQuantities = itemsArray.map((item) => item.quantity || 0);
  //     const updatedInvoiceCosts = itemsArray.map(
  //       (item) => item["invoice_cost"] || 0
  //     );

  //     setItemsArray(updatedItems);
  //     setQuantitiesArray(updatedQuantities);
  //     setInvoiceCostArray(updatedInvoiceCosts);

  //     const updatedInvoiceData = {
  //       items: updatedItems,
  //       quantity: updatedQuantities,
  //       invoiceCost: updatedInvoiceCosts,
  //     };
  //     console.log("UpdatedInvoiceData: ", updatedInvoiceData, tempDictionary);

  //     value.setItemDetails(updatedInvoiceData);
  //     value.setItemDetailsInput({
  //       items: updatedItems,
  //       quantity: updatedQuantities,
  //       invoiceCost: updatedInvoiceCosts,
  //     });

  //     // Use prevPoDetailsDataRef.current for comparison
  //     const prevPoDetailsData = prevPoDetailsDataRef.current || [];

  //     const updatedPoDetails = prevPoDetailsData.map((item) =>
  //       tempDictionary[item.itemId]
  //         ? {
  //             ...item,
  //             invQty: tempDictionary[item.itemId].quantity,
  //             invAmt:
  //               tempDictionary[item.itemId].quantity *
  //               tempDictionary[item.itemId].invoiceCost,
  //             invCost: tempDictionary[item.itemId].invoiceCost,
  //           }
  //         : item
  //     );

  //     // Identify new items not present in prevPoDetailsData
  //     const newItems = Object.keys(tempDictionary)
  //       .filter(
  //         (itemId) =>
  //           !prevPoDetailsData.some((entry) => entry.itemId === itemId)
  //       )
  //       .map((itemId) => ({
  //         itemId,
  //         invQty: tempDictionary[itemId].quantity,
  //         invAmt:
  //           tempDictionary[itemId].quantity *
  //           tempDictionary[itemId].invoiceCost,
  //         invCost: tempDictionary[itemId].invoiceCost,
  //         itemQuantity: 0,
  //         itemDescription: "",
  //         totalItemCost: 0,
  //         supplierId: "",
  //         itemCost: 0,
  //         poId: prevPoDetailsData[0]?.poId || "", // Preserve existing PO ID
  //       }));

  //     // Merge updates and new items
  //     value.setPoDetailsData([...updatedPoDetails, ...newItems]);
  //   },
  //   [value.setItemDetails, value.setItemDetailsInput, value.setPoDetailsData]
  // );

  //PO DETAILS
  const updateItemDetails = useCallback(
  (invoiceDatafromConversation) => {
    // Defensive: normalize input
    if (!invoiceDatafromConversation) {
      value.setItemDetails({ items: [], quantity: [], invoiceCost: [] });
      value.setItemDetailsInput({ items: [], quantity: [], invoiceCost: [] });
      return;
    }

    const itemsArray = Array.isArray(invoiceDatafromConversation.items)
      ? invoiceDatafromConversation.items
      : [];

    if (itemsArray.length === 0) {
      value.setItemDetails({ items: [], quantity: [], invoiceCost: [] });
      value.setItemDetailsInput({ items: [], quantity: [], invoiceCost: [] });
      return;
    }

    console.log("updateItemDetails - incoming items:", itemsArray);

    // If every item is empty-like, bail out
    const allEmpty = itemsArray.every((it) =>
      Object.values(it).every((v) => v === null || v === undefined || v === "")
    );
    if (allEmpty) {
      console.log("updateItemDetails - all invoice items are empty; skipping");
      return;
    }

    // Build dictionary with normalized string keys (support both item_id and itemId)
    const tempDictionary = itemsArray.reduce((acc, item) => {
      const key = String(item.item_id ?? item.itemId ?? item.id ?? "");
      if (!key) return acc;
      acc[key] = {
        quantity: Number(item.quantity ?? 0),
        invoiceCost: Number(item.invoice_cost ?? item.inv_cost ?? 0),
      };
      return acc;
    }, {});

    // Structured arrays for UI controls
    const updatedItems = itemsArray.map((it) =>
      String(it.item_id ?? it.itemId ?? it.id ?? "")
    );
    const updatedQuantities = itemsArray.map((it) => Number(it.quantity ?? 0));
    const updatedInvoiceCosts = itemsArray.map((it) =>
      Number(it.invoice_cost ?? it.inv_cost ?? 0)
    );

    // update local UI arrays (if you still use them)
    setItemsArray(updatedItems);
    setQuantitiesArray(updatedQuantities);
    setInvoiceCostArray(updatedInvoiceCosts);

    const updatedInvoiceData = {
      items: updatedItems,
      quantity: updatedQuantities,
      invoiceCost: updatedInvoiceCosts,
    };

    console.log("updateItemDetails - prepared invoice data:", updatedInvoiceData);
    value.setItemDetails(updatedInvoiceData);
    value.setItemDetailsInput(updatedInvoiceData);

    // Use the ref snapshot for prev PO details (ensure it's an array)
    const prevPoDetailsData = Array.isArray(prevPoDetailsDataRef.current)
      ? prevPoDetailsDataRef.current
      : [];

    // Map over previous PO items and update values when we have match
    const updatedPoDetails = prevPoDetailsData.map((poItem) => {
      const poKey = String(poItem.itemId ?? poItem.item_id ?? "");
      const found = tempDictionary[poKey];
      if (found) {
        return {
          ...poItem,
          invQty: found.quantity,
          invCost: found.invoiceCost,
          invAmt: found.quantity * found.invoiceCost,
        };
      }
      return poItem;
    });

    // Find invoice items that are new (not in prevPoDetailsData)
    const newItems = Object.keys(tempDictionary)
      .filter(
        (k) => !prevPoDetailsData.some((entry) => String(entry.itemId) === k)
      )
      .map((k) => ({
        itemId: k,
        invQty: tempDictionary[k].quantity,
        invCost: tempDictionary[k].invoiceCost,
        invAmt: tempDictionary[k].quantity * tempDictionary[k].invoiceCost,
        itemQuantity: 0,
        itemDescription: "",
        totalItemCost: 0,
        supplierId: "",
        itemCost: 0,
        poId: prevPoDetailsData[0]?.poId ?? "",
      }));

    const merged = [...updatedPoDetails, ...newItems];

    // Update state and the ref synchronously so future calls see latest
    value.setPoDetailsData(merged);
    prevPoDetailsDataRef.current = merged;

    console.log("updateItemDetails - merged PO details:", merged);
  },
  // include everything used inside the callback that could change
  [
    value.setItemDetails,
    value.setItemDetailsInput,
    value.setPoDetailsData,
    // If setItemsArray/setQuantitiesArray/setInvoiceCostArray are stable functions from useState,
    // it's ok to omit them; otherwise include them.
  ]
);
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
        const response = await axios.get(FETCH_PO_BY_ID(id));
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
          if (response.data.po_details[0]?.supplierId) {
            // await supplierRiskApi(response.data.po_details[0]?.supplierId);
          }
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

          // updateItemDetails(invoiceDatafromConversation); // Call updateItemDetails after state is set
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
            text: poErrorMessage,
            fromUser: false,
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      value.setPoDetailsData,
      value.setItemDetails,
      value.setItemDetailsInput,
      value.setPoHeaderData,
      value.setItemListPo,
      updateItemDetails,
    ]
  );
  //SUPPLIER INSIGHTS
  const supplierRiskApi = async (supplierId) => {
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
      value.setSupplierDetails((prev) => ({
        ...prev,
        supplierInsights: response.data,
      }));
      // console.log("invoice Clear Response:", response.data);
    } catch (error) {
      console.log("Supplier Risk Error:", error, error.data);
    }
  };
  //EXTRACTING FIELD DATA FROM BACKEND
const invoiceCheck = useCallback(
  async (invoiceObject) => {
    let updatedInvoiceData = { ...value.invoiceData };
    console.log("invoiceObject:", invoiceObject);
    let poStatus = false;

    for (const key of Object.keys(invoiceObject)) {
      if (invoiceObject[key] !== null) {
        switch (key) {

          // Matches: 'invoice_type'
          case "invoice_type":
            updatedInvoiceData.invoiceType = invoiceObject[key];
            break;

          // No direct equivalent for "Quantities" — infer from items?
          // Keeping this optional if you want to attach quantity separately:
          case "quantity":
          case "quantities":
            updatedInvoiceData.quantity = invoiceObject[key];
            break;

          // Matches: 'invoice_number'
          case "invoice_number":
            updatedInvoiceData.userInvNo = invoiceObject[key];
            break;

          // Matches: 'total_amount'
          case "total_amount":
            updatedInvoiceData.totalAmount = invoiceObject[key];
            break;

          // Matches: 'date'
          case "date":
            updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
            break;

          // Matches: 'total_tax'
          case "total_tax":
            updatedInvoiceData.totalTax = invoiceObject[key];
            break;

          // Matches: 'items'
          case "items":
            updatedInvoiceData.items = invoiceObject[key];
            break;

          // Matches: 'po_number'
          case "po_number":
            updatedInvoiceData.poNumber = invoiceObject[key];

            poStatus = await getPoDetails(
              invoiceObject[key]
            );

            console.log("PO status INSIDE GET PO DETAILS:", poStatus);

            if (poStatus) {
              updateItemDetails(invoiceObject);
            } else {
              value.setinvoiceData({
                ...value.invoiceData,
                items: "",
                quantity: "",
              });
            }
            break;

          // Optional fields
          case "supplier_id":
            updatedInvoiceData.supplierId = invoiceObject[key];
            break;

          case "email":
            updatedInvoiceData.email = invoiceObject[key];
            break;
        }
      }
    }

    value.setInvoiceData(updatedInvoiceData);
    typeSelection(invoiceObject);

    return poStatus;
  },
  [
    getPoDetails,
    updateItemDetails,
    // value.invoiceDatafromConversation,
    value.setInvoiceData,
    // value.setinvoiceDatafromConversation,
    value.invoiceData,
  ]
);

  // const invoiceCheck = useCallback(
  //   async (invoiceObject, invoiceDatafromConversation) => {
  //     let updatedInvoiceData = { ...value.invoiceData };
  //     console.log("invoiceObject: ", invoiceObject);
  //     let poStatus = false;
  //     for (const key of Object.keys(invoiceObject)) {
  //       if (invoiceObject[key] !== null) {
  //         switch (key) {
  //           case "Invoice Type":
  //             updatedInvoiceData.invoiceType = invoiceObject[key];
  //             break;
  //           case "Quantities":
  //             updatedInvoiceData.quantity = invoiceObject[key];
  //             break;
  //           case "Invoice Number":
  //             updatedInvoiceData.userInvNo = invoiceObject[key];
  //             break;
  //           case "Total Amount":
  //             updatedInvoiceData.totalAmount = invoiceObject[key];
  //             break;
  //           case "Date":
  //             updatedInvoiceData.invoiceDate = formatDate(invoiceObject[key]);
  //             break;
  //           case "Total Tax":
  //             updatedInvoiceData.totalTax = invoiceObject[key];
  //             break;
  //           case "Items":
  //             updatedInvoiceData.items = invoiceObject[key];
  //             break;
  //           case "PO Number":
  //             updatedInvoiceData.poNumber = invoiceObject[key];

  //             poStatus = await getPoDetails(
  //               invoiceObject[key],
  //               invoiceDatafromConversation
  //             );
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
  //         }
  //       }
  //     }

  //     value.setInvoiceData(updatedInvoiceData);
  //     typeSelection(invoiceDatafromConversation);

  //     return poStatus;
  //   },
  //   [
  //     getPoDetails,
  //     updateItemDetails,
  //     //   value.poDetailsData, // Remove unstable dependency
  //     value.invoiceDatafromConversation,
  //     value.setInvoiceData, // Add stable setters
  //     value.setinvoiceDatafromConversation,
  //     value.invoiceData,
  //   ]
  // );

  const prevInvoiceDataRef = useRef();

  // useEffect(() => {
  //   if (
  //     value.invoiceDatan &&
  //     JSON.stringify(prevInvoiceDataRef.current) !==
  //       JSON.stringify(value.invoiceData)
  //   ) {
  //     updateItemDetails(value.invoiceData);
  //     prevInvoiceDataRef.current = value.invoiceData; // Update ref
  //   }
  // }, [value.invoiceData, updateItemDetails]);

  // const handleMessageSubmit = async (input, inputFromUpload) => {
  //   if (!input.trim()) return;
  //   setMessages((prevMessages) => {
  //     const newMessages = inputFromUpload
  //       ? [...prevMessages] // Do not add any new message for inputFromUpload
  //       : [...prevMessages, { text: input, fromUser: true }];

  //     if (!inputFromUpload) {
  //       setInput(""); // Clear input if it's not from an upload
  //     }

  //     return newMessages;
  //   });
  //   // setMessages(newMessages);
  //   setInput("");
  //   //typingIndicator
  //   typingTimeoutRef.current = setTimeout(() => {
  //     setTyping(true);
  //   }, 1500);

  //   //typingIndicator
  //   try {
  //     const response = await axios.post(
  //       // `http://localhost:8000/creation/response?query=${input}`,
  //       NEW_RESPONSE_CREATION, // API endpoint
  //       {
  //         user_id: "admin", // The user_id value
  //         message: input, // The message value
  //       },

  //       { headers: { "Content-Type": "application/json" } }
  //     );

  //     console.log("Data response", response.data);
  //     if (response.data.test_model_reply === "Creation") {
  //       value.setIsActive(true);
  //     } else if (response.data.test_model_reply === "Fetch") {
  //       value.setIsActive(false);
  //       // await getInvoiceDetails("INV498");
  //     } else if (response.data.submissionStatus === "submitted") {
  //       value.setIsActive(false);
  //     }
  //     if (response.status === 200 || response.status === 201) {
  //       const invoice_json = response.data.invoice_json;
  //       // const invoice_json = JSON.parse(response.data.invoice_json);
  //       const totalAmount =
  //         invoice_json["Total Amount"] &&
  //         parseFloat(String(invoice_json["Total Amount"]).replace(/,/g, ""));
  //       const totalTax =
  //         invoice_json["Total Tax"] &&
  //         parseFloat(String(invoice_json["Total Tax"]).replace(/,/g, ""));
  //       console.log("Total amount,total tax:", totalAmount, totalTax);
  //       const updatedInvoiceJson = {
  //         ...invoice_json,
  //         "Total Amount": totalAmount ? totalAmount : null,
  //         "Total Tax": totalTax ? totalTax : null,
  //       };

  //       value.setinvoiceDatafromConversation(
  //         response.data.invoiceDatafromConversation
  //       );

  //       const invoiceCheckStatus = await invoiceCheck(
  //         updatedInvoiceJson,
  //         response.data.invoiceDatafromConversation
  //       );
  //       const uploadText =
  //         "Here is what I could extract from the uploaded document: \n";
  //       // if (value.invoiceData.poNumber === "") {
  //       if (
  //         response.data.invoice_json["PO Number"] === undefined ||
  //         response.data.invoice_json["PO Number"] === "" ||
  //         response.data.invoice_json["PO Number"] === null
  //         // updatedInvoiceJson["PO Number"] &&
  //         // invoiceCheckStatus &&
  //         // response.data?.po_items?.length > 0
  //       ) {
  //         const botReply = response.data.chat_history.slice(-1);
  //         const reply = botReply[0].slice(5);
  //         const formattedConversation = response.data.chat_history
  //           .slice(-1)
  //           .map((text, index) => (
  //             <ReactMarkdown key={index} className={"botText"}>
  //               {/* {text.slice(5)} */}
  //               {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
  //             </ReactMarkdown>
  //           ));
  //         setMessages((prevMessages) => [
  //           ...prevMessages,
  //           { text: formattedConversation, fromUser: false },
  //         ]);
  //         // }
  //         const email = response.data.invoice_email;
  //         if (email) {
  //           console.log("Inside Email: ", email, value.invoiceCounter - 1);
  //           await sendEmail({
  //             emailUsed: email,
  //             documentId: `INV${value.invoiceCounter - 1}`,
  //           });
  //         }
  //         if (response.data.submissionStatus == "submitted") {
  //           // let validationStatus = await itemQuantityValidation();
  //           // if (validationStatus) {
  //           value.setInvoiceCounter((prevCounter) => prevCounter + 1);
  //           await invoiceHeaderCreation();
  //           // }
  //         } else {
  //           value.setModalVisible(false);
  //         }
  //       } else {
  //         if (invoiceCheckStatus) {
  //           const botReply = response.data.chat_history.slice(-1);
  //           const reply = botReply[0].slice(5);
  //           const formattedConversation = response.data.chat_history
  //             .slice(-1)
  //             .map((text, index) => (
  //               <ReactMarkdown key={index} className={"botText"}>
  //                 {inputFromUpload ? uploadText + text.slice(5) : text.slice(5)}
  //               </ReactMarkdown>
  //             ));
  //           setMessages((prevMessages) => [
  //             ...prevMessages,
  //             { text: formattedConversation, fromUser: false },
  //           ]);

  //           if (response.data.submissionStatus == "submitted") {
  //             // let validationStatus = await itemQuantityValidation();
  //             // if (validationStatus) {
  //             value.setInvoiceCounter((prevCounter) => prevCounter + 1);
  //             await invoiceHeaderCreation();
  //             // }
  //           } else {
  //             value.setModalVisible(false);
  //           }
  //           const email = response.data.invoice_email;
  //           if (email) {
  //             console.log("Inside Email: ", email, value.invoiceCounter - 1);
  //             await sendEmail({
  //               emailUsed: email,
  //               documentId: `INV${value.invoiceCounter - 1}`,
  //             });
  //           }
  //         } else {
  //           console.log("invoiceCheckStatus:FALSEEEEEEEEEEEEEEEEEEEEE");
  //         }
  //       }
  //       //typingIndicator
  //       if (typingTimeoutRef.current) {
  //         clearTimeout(typingTimeoutRef.current);
  //         typingTimeoutRef.current = null;
  //       }
  //       setTyping(false);
  //       //typingIndicator
  //     }
  //   } catch (error) {
  //     //typingIndicator
  //     if (typingTimeoutRef.current) {
  //       clearTimeout(typingTimeoutRef.current);
  //       typingTimeoutRef.current = null;
  //     }
  //     setTyping(false);
  //     //typingIndicator
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { text: errorMessage, fromUser: false },
  //     ]);

  //     console.error("Error fetching data:", error);
  //   }
  // };

  //create invoice details

  const sendMessage = async (text = null) => {
    const messageText = (text ?? input).trim();
    if (!messageText) return;

    if (isStreaming && !allowConcurrentRuns) {
      setMessages((prev) => [
        ...prev,
        {
          fromUser: false,
          text: "Please wait for current response to finish.",
          streaming: false,
          id: uuidv4(),
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { fromUser: true, text: messageText, id: uuidv4() },
    ]);
    setInput("");

    const outgoing = JSON.stringify({
      message: messageText,
      thread_id: threadId,
    });

    // Attach a temporary WS listener that accumulates the streaming response
    // and calls promotionCheck with the combined response when the stream is done.
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      let buffer = "";
      const listener = async (evt) => {
        let msg;
        try {
          msg = JSON.parse(evt.data);
        } catch (err) {
          return;
        }

        if (msg.type === "token") {
          buffer += String(msg.text ?? "");
        } else if (msg.type === "extraction") {
          // **NEW: Handle extraction data immediately**
          console.log("Received extraction data:", msg.data);
          await invoiceCheck(msg.data.extracted_details);
          setExtractedDetails(msg.data.extracted_details);
          setUserIntent(msg.data.user_intent);

          // Handle submission intent
          if (msg.data.user_intent?.intent === "Submission") {
            value.setInvoiceCounter((prevCounter) => prevCounter + 1);
            await invoiceHeaderCreation();
          }

          // Handle email
          const email = msg.data.extracted_details?.email;
          if (email) {
            console.log("Sending email to:", email);
            await sendEmail({
              emailUsed: email,
              documentId: `INV${value.invoiceCounter - 1}`,
            });
          }
        } else if (msg.type === "event") {
          const data = msg.data;
          let text =
            typeof data === "string"
              ? data
              : data?.text ||
                data?.content ||
                data?.message ||
                JSON.stringify(data);
          buffer += text;
        } else if (msg.type === "done") {
          // Stream finished - cleanup
          console.log("Stream complete");
          try {
            wsRef.current.removeEventListener("message", listener);
          } catch (e) {
            /* ignore */
          }
        }
      };

      try {
        wsRef.current.addEventListener("message", listener);
        try {
          wsRef.current.send(outgoing);
          setIsStreaming(true);
        } catch (err) {
          console.error("Send failed, queueing", err);
          outgoingQueueRef.current.push(outgoing);
          try {
            wsRef.current.removeEventListener("message", listener);
          } catch (e) {
            /* ignore */
          }
        }
      } catch (err) {
        // fallback if addEventListener isn't available
        try {
          wsRef.current.send(outgoing);
          setIsStreaming(true);
        } catch (err2) {
          console.error("Send failed, queueing", err2);
          outgoingQueueRef.current.push(outgoing);
        }
      }
    } else {
      // queue the outgoing message and attempt reconnect
      outgoingQueueRef.current.push(outgoing);
      setMessages((prev) => [
        ...prev,
        {
          fromUser: false,
          text: "Message queued — connecting to server...",
          streaming: false,
          id: uuidv4(),
        },
      ]);
      if (!connected) {
        connect();
      }
    }
  };

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
        url: ADD_INVOICE_DETAILS,
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: invoiceErrorMessage, fromUser: false },
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
      storeIds: ["STORE001"],
    };
    try {
      const response = await axios({
        method: "post",
        url: INVOICE_CREATION,
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
      let invoiceFileDetails = {
        status: true,
        invoiceId: value.invoiceData.userInvNo,
      };
      console.log("Invoice File Details: ", invoiceFileDetails);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: (
            <PdfCard
              title={"Invoice Number: " + value.invoiceData.userInvNo}
              invoiceID={value.invoiceData.userInvNo}
              systemDocId={value.systemDocumentId}
              invoiceFile={invoiceFileDetails}
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: invoiceErrorMessage, fromUser: false },
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
        url: UPLOAD_GPT,
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
          await sendMessage(formatInvoice(response.data.structured_data), true);
          // await handleMessageSubmit(
          //   formatInvoice(response.data.structured_data),
          //   true
          // );
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: uploadError, fromUser: false },
      ]);
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
        url: CLEAR_DATA_NEW,
        data: { user_id: "admin" },
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
  const clearAllData = async () => {
    try {
      const response = await axios({
        method: "post",
        url: CLEAR_DATA,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      console.log("cleared all data");
      clearFormData();
    } catch (error) {
      console.log("Clear Error:", error, error.data);
    }
  };
  console.log("checkConsole", value);

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
      console.log(
        "Email sending was successful! Now calling another function...",
        emailStatus
      );
      clearFormData();
    } else {
      console.log("Email sending failed or returned no status.");
      console.error("Error message:", emailStatus?.message || "Unknown error");

      setMessages((prevMessages) => {
        // Check if there are messages and if so, update the last one
        if (prevMessages.length > 0) {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = {
            text: emailError,
            fromUser: false,
          };
          return updatedMessages;
        }

        // If there are no messages, just return the error message
        return [{ text: emailError, fromUser: false }];
      });
    }
  };
  return (
    <div className="chatbot-card">
      <div className="chatbot-area imageBackground" ref={messageEl}>
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
          handleMessageSubmit={sendMessage}
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
