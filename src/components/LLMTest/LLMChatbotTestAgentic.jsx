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
import { AuthContext } from "../../context/ContextsMasterFile";
import ChatbotInputForm from "../ChatMessage/ChatbotInputForm";
import PdfCard from "../PDF Generation/PdfCard";
import EmailPdf from "../PDF Generation/EmailPdf";
import "../../styles/chatbot.css";
import "../../styles/general.css";
import ChatMessage from "../ChatMessage/ChatMessage";
import TypingIndicatorComponent from "../ChatMessage/TypingIndicatorComponent";
import ReactMarkdown from "react-markdown";


// WebSocket hook for managing connection
const useWebSocket = (threadId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:8000/ws/promotion_chat/${threadId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttemptsRef.current = 0;
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      return ws;
    };

    const ws = connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [threadId]);

  // Heartbeat mechanism
  useEffect(() => {
    if (!socket || !isConnected) return;

    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [socket, isConnected]);

  return { socket, isConnected };
};


export default function LLMChatbotTest() {
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

   const threadId = 'admin'; // Your thread ID
  const { socket, isConnected } = useWebSocket(threadId);

  // Setup WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);

        switch (data.type) {
          case 'ack':
            console.log('Message acknowledged:', data.message);
            break;

          case 'stream_chunk':
            // Update the last bot message with streaming content
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              
              if (lastMessage && !lastMessage.fromUser) {
                // Append to existing bot message
                return [
                  ...prevMessages.slice(0, -1),
                  { ...lastMessage, text: lastMessage.text + data.content }
                ];
              } else {
                // Create new bot message
                return [
                  ...prevMessages,
                  { 
                    text: data.content, 
                    fromUser: false, 
                    key: `bot-${Date.now()}` 
                  }
                ];
              }
            });

            // Stop typing indicator on first chunk
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = null;
            }
            setTyping(false);
            break;

          case 'extracted_details':
            console.log('Extracted details:', data.extracted_details);
            console.log('User intent:', data.user_intent);
            setExtractedDetails({
              details: data.extracted_details,
              intent: data.user_intent
            });
            break;

          case 'stream_complete':
            console.log('Stream complete. Full response:', data.full_response);
            setTyping(false);
            break;

          case 'error':
            console.error('Server error:', data.message);
            setTyping(false);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: `Error: ${data.message}`,
                fromUser: false,
                isError: true,
                key: `error-${Date.now()}`
              }
            ]);
            break;

          case 'pong':
            console.log('Heartbeat pong received');
            break;

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [socket]);

  //DATE FORMATTING
  function formatDate(date) {
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = date?.match(regex);
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
      const match = data?.match(promotionTypeRegex);
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
  // Modified promotionCheck to handle snake_case keys inside extracted_details
  const promotionCheck = useCallback(
    async (dataObject) => {
      // If the object has 'extracted_details', use it
      const invoiceObject = dataObject.extracted_details || dataObject;
      console.log("Inside Promotion Check", invoiceObject);
      let updatedPromotionData = { ...value.promotionData };
      if (invoiceObject) {
        // Map snake_case keys to camelCase keys in promotionData
        if (invoiceObject.promotion_type !== undefined)
          updatedPromotionData.promotionType = invoiceObject.promotion_type;
        if (invoiceObject.hierarchy_type !== undefined)
          updatedPromotionData.hierarchyType = invoiceObject.hierarchy_type;
        if (invoiceObject.hierarchy_value !== undefined)
          updatedPromotionData.hierarchyValue = invoiceObject.hierarchy_value;
        if (invoiceObject.brand !== undefined)
          updatedPromotionData.brand = invoiceObject.brand;
        if (invoiceObject.items !== undefined)
          updatedPromotionData.itemList = Array.isArray(invoiceObject.items)
            ? invoiceObject.items
            : [invoiceObject.items];
        if (invoiceObject.excluded_items !== undefined)
          updatedPromotionData.excludedItemList = Array.isArray(
            invoiceObject.excluded_items
          )
            ? invoiceObject.excluded_items
            : [invoiceObject.excluded_items];
        if (invoiceObject.discount_type !== undefined)
          updatedPromotionData.discountType = invoiceObject.discount_type;
        if (invoiceObject.discount_value !== undefined)
          updatedPromotionData.discountValue = invoiceObject.discount_value;
        if (invoiceObject.start_date !== undefined)
          updatedPromotionData.startDate = formatDate(invoiceObject.start_date);
        if (invoiceObject.end_date !== undefined)
          updatedPromotionData.endDate = formatDate(invoiceObject.end_date);
        if (invoiceObject.stores !== undefined)
          updatedPromotionData.locationList = Array.isArray(
            invoiceObject.stores
          )
            ? invoiceObject.stores
            : [invoiceObject.stores];
        if (invoiceObject.excluded_stores !== undefined)
          updatedPromotionData.excludedLocationList = Array.isArray(
            invoiceObject.excluded_stores
          )
            ? invoiceObject.excluded_stores
            : [invoiceObject.excluded_stores];
        // Type selection for promotion_type
        if (invoiceObject.promotion_type !== undefined) {
          await typeSelection(invoiceObject.promotion_type);
          console.log(
            "Type Selection parameter: ",
            invoiceObject.promotion_type
          );
        }
      }
      value.setPromotionData(updatedPromotionData);
      console.log("Final Invoice Data:  ", updatedPromotionData);
      return true;
    },
    [value.promotionData]
  );
  //API CALLS
  const getPromotionDetails = async (threadId = "admin") => {
    try {
      const response = await fetch(
        // `http://localhost:8000/promotion_extract_details/`,
        `http://localhost:8000/promotion_extract_details_agentic/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ thread_id: threadId, message: "" }), // or message if needed
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch promotion details: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Promotion Details Response New Function:", data);
      // Update your state as needed
      await promotionCheck(data);
      setExtractedDetails(data.extracted_details);
      setUserIntent(data.user_intent);
      console.log("Data User Intent: ", data.user_intent);

      if (data.user_intent && data.user_intent.intent == "Submission") {
        value.setPromotionCounter((prevCounter) => prevCounter + 1);
        await promotionHeaderCreation();
      }
      const email = data?.extracted_details?.email;
      console.log("Email extracted: ", email);
      if (email) {
        console.log("Inside Email: ", email, value.promotionCounter - 1);
        await sendEmail({
          emailUsed: email,
          documentId: `PROMO${value.promotionCounter - 1}`,
        });
      }
      return data;
    } catch (error) {
      console.error("Error fetching promotion details:", error);
      throw error;
    }
  };

  // const handleMessageSubmit = async (input, inputFromUpload) => {
  //   console.log("Input: ", input);
  //   const textToSend = input.trim();
  //   if (!textToSend && !inputFromUpload) return;
  //   // Add User Message (if applicable)
  //   if (!inputFromUpload) {
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { text: textToSend, fromUser: true, key: `user-${Date.now()}` },
  //     ]);
  //     setInput("");
  //   }
  //   // Start Typing Indicator
  //   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => setTyping(true), 1000);
  //   try {
  //     // const response = await fetch("http://localhost:8000/promotion_chat/", {
  //     const response = await fetch("http://localhost:8000/promotion_chat_agentic/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", Accept: "text/plain" },
  //       body: JSON.stringify({
  //         thread_id: "admin",
  //         message: textToSend || inputFromUpload,
  //       }),
  //     });
  //     // Stop Typing Indicator
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Server Error Body:", errorBody);
  //       throw new Error(
  //         `Failed to fetch data: ${response.status} ${response.statusText}`
  //       );
  //     }
  //     // Add Initial Bot Message Placeholder
  //     const botMessageKey = `bot-${Date.now()}`;
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { text: "", fromUser: false, key: botMessageKey },
  //     ]);
  //     // --- Process Stream ---
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let done = false;
  //     console.log("Starting stream reading loop..."); // Log loop start
  //     while (!done) {
  //       const { value, done: doneReading } = await reader.read();
  //       done = doneReading;
  //       // !!! ADD LOGS HERE !!!
  //       console.log("Reader Read:", { value, done }); // Log raw reader output
  //       if (value) {
  //         // Check if value (Uint8Array) exists
  //         const chunkStr = decoder.decode(value, { stream: !done });
  //         // !!! ADD LOG HERE !!!
  //         console.log("Decoded Chunk:", chunkStr); // Log the decoded string
  //         if (chunkStr) {
  //           // !!! ADD LOG HERE !!!
  //           console.log("Attempting to update state with chunk:", chunkStr);
  //           setMessages((prevMessages) =>
  //             prevMessages.map((msg) =>
  //               msg.key === botMessageKey
  //                 ? { ...msg, text: msg.text + chunkStr }
  //                 : msg
  //             )
  //           );
  //         } else {
  //           console.log("Decoded chunk is empty, not updating state.");
  //         }
  //       } else if (done) {
  //         console.log("Stream finished (done is true, no more values).");
  //       }
  //     }
  //     console.log("Finished stream reading loop."); // Log loop end
  //     await getPromotionDetails("admin");
  //   } catch (error) {
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     console.error("Error fetching or processing stream:", error);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         text: `Error: ${error.message}`,
  //         fromUser: false,
  //         isError: true,
  //         key: `error-${Date.now()}`,
  //       },
  //     ]);
  //   }
  // };
  
  const handleMessageSubmit = async (input, inputFromUpload) => {
    console.log('Input:', input);
    const textToSend = input.trim();
    
    if (!textToSend && !inputFromUpload) return;
    
    if (!isConnected || !socket) {
      console.error('WebSocket not connected');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Error: Not connected to server. Please refresh the page.',
          fromUser: false,
          isError: true,
          key: `error-${Date.now()}`
        }
      ]);
      return;
    }

    // Add user message
    if (!inputFromUpload) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: textToSend, fromUser: true, key: `user-${Date.now()}` }
      ]);
      setInput('');
    }

    // Start typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(true), 500);

    try {
      // Send message via WebSocket
      socket.send(JSON.stringify({
        type: 'message',
        content: textToSend || inputFromUpload,
        thread_id: threadId
      }));

      console.log('Message sent via WebSocket');
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      setTyping(false);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `Error: ${error.message}`,
          fromUser: false,
          isError: true,
          key: `error-${Date.now()}`
        }
      ]);
    }
  };

  const [extractedDetails, setExtractedDetails] = useState(null);
  const [userIntent, setUserIntent] = useState(null);

  // const handleMessageSubmit = async (input, inputFromUpload) => {
  //   console.log("Input: ", input);
  //   const textToSend = input.trim();
  //   // Ensure inputFromUpload is a string if it's the primary content
  //   const messageContent =
  //     textToSend ||
  //     (typeof inputFromUpload === "string" ? inputFromUpload : "");
  //   if (!messageContent) return; // Simplified check if there's any content to send
  //   // Add User Message (if applicable and not an upload-only scenario)
  //   if (!inputFromUpload && textToSend) {
  //     // Only add user message if textToSend is present
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       // User messages can remain simple text objects
  //       { text: textToSend, fromUser: true, key: `user-${Date.now()}` },
  //     ]);
  //     setInput("");
  //   }
  //   // Start Typing Indicator
  //   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => setTyping(true), 1000);
  //   try {
  //     const response = await fetch("http://localhost:8000/promotion_chat/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", Accept: "text/plain" }, // Server should stream plain text (Markdown)
  //       body: JSON.stringify({
  //         thread_id: "admin",
  //         message: messageContent, // Use the prepared message content
  //       }),
  //     });
  //     // Stop Typing Indicator
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Server Error Body:", errorBody);
  //       throw new Error(
  //         `Failed to fetch data: ${response.status} ${response.statusText}`
  //       );
  //     }
  //     // Add Initial Bot Message Placeholder
  //     const botMessageKey = `bot-${Date.now()}`;
  //     const initialMarkdownString = "";
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         key: botMessageKey,
  //         fromUser: false,
  //         // Store the raw Markdown string for accumulation
  //         rawMarkdown: initialMarkdownString,
  //         // The 'text' field will hold the ReactMarkdown component
  //         text: <ReactMarkdown>{initialMarkdownString}</ReactMarkdown>,
  //       },
  //     ]);
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let done = false;
  //     let sseBuffer = ""; // Buffer for SSE lines

  //     // CHANGE: Create a dedicated SSE parser
  //     const createSSEParser = () => {
  //       let buffer = "";
  //       return (chunk) => {
  //         buffer += chunk;
  //         const events = [];
  //         let eventEnd;

  //         while ((eventEnd = buffer.indexOf("\n\n")) !== -1) {
  //           const eventData = buffer.slice(0, eventEnd);
  //           buffer = buffer.slice(eventEnd + 2);

  //           let eventName = "message";
  //           let data = "";

  //           eventData.split("\n").forEach((line) => {
  //             if (line.startsWith("event:")) {
  //               eventName = line.replace("event:", "").trim();
  //             } else if (line.startsWith("data:")) {
  //               data += line.replace("data:", "").trim();
  //             }
  //           });

  //           if (data) events.push({ type: eventName, data });
  //         }
  //         return events;
  //       };
  //     };

  //     const parseSSE = createSSEParser();
  //     let buffer = "";

  //     while (!done) {
  //       const { value, done: doneReading } = await reader.read();
  //       done = doneReading;

  //       if (value) {
  //         const chunk = decoder.decode(value, { stream: true });
  //         buffer += chunk;

  //         // Process complete events
  //         const events = parseSSE(chunk);

  //         for (const event of events) {
  //           if (event.type === "extracted_details") {
  //             try {
  //               const extracted = JSON.parse(event.data);
  //               console.log("Extracted Details:", extracted);
  //               setExtractedDetails(extracted.extracted_details);
  //               setUserIntent(extracted.user_intent);
  //             } catch (err) {
  //               console.error("JSON parse error:", err);
  //             }
  //           } else if (event.type === "message") {
  //             // Handle text chunks
  //             setMessages((prev) =>
  //               prev.map((msg) =>
  //                 msg.key === botMessageKey
  //                   ? {
  //                       ...msg,
  //                       rawMarkdown: (msg.rawMarkdown || "") + event.data,
  //                       text: (
  //                         <ReactMarkdown>
  //                           {msg.rawMarkdown + event.data}
  //                         </ReactMarkdown>
  //                       ),
  //                     }
  //                   : msg
  //               )
  //             );
  //           }
  //         }
  //       }
  //     }

  //     // CHANGE: Process any remaining buffer
  //     if (buffer) {
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg.key === botMessageKey
  //             ? {
  //                 ...msg,
  //                 rawMarkdown: (msg.rawMarkdown || "") + buffer,
  //                 text: (
  //                   <ReactMarkdown>{msg.rawMarkdown + buffer}</ReactMarkdown>
  //                 ),
  //               }
  //             : msg
  //         )
  //       );
  //     }
  //     console.log("Finished stream reading loop.");
  //     await getPromotionDetails("admin");
  //   } catch (error) {
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     console.error("Error fetching or processing stream:", error);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         // Error messages can also be simple text or styled differently
  //         text: `Error: ${error.message}`,
  //         fromUser: false,
  //         isError: true,
  //         key: `error-${Date.now()}`,
  //       },
  //     ]);
  //   }
  // };

  //Email Functionality
  const emailError =
    "An error occurred while sending the email. Please try again later.";
  const sendEmail = async ({ emailUsed, documentId }) => {
    const emailStatus = await EmailPdf({
      emailUsed: emailUsed,
      bodyUsed: { documentType: "Promotion" },
      promotion: true,
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
  // const handleMessageSubmit = async (input, inputFromUpload) => {
  //   console.log("Input: ", input);
  //   const textToSend = input.trim();
  //   // Ensure inputFromUpload is a string if it's the primary content
  //   const messageContent =
  //     textToSend ||
  //     (typeof inputFromUpload === "string" ? inputFromUpload : "");
  //   if (!messageContent) return; // Simplified check if there's any content to send
  //   // Add User Message (if applicable and not an upload-only scenario)
  //   if (!inputFromUpload && textToSend) {
  //     // Only add user message if textToSend is present
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       // User messages can remain simple text objects
  //       { text: textToSend, fromUser: true, key: `user-${Date.now()}` },
  //     ]);
  //     setInput("");
  //   }
  //   // Start Typing Indicator
  //   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => setTyping(true), 1000);
  //   try {
  //     const response = await fetch("http://localhost:8000/promotion_chat/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", Accept: "text/plain" }, // Server should stream plain text (Markdown)
  //       body: JSON.stringify({
  //         thread_id: "admin",
  //         message: messageContent, // Use the prepared message content
  //       }),
  //     });
  //     // Stop Typing Indicator
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Server Error Body:", errorBody);
  //       throw new Error(
  //         `Failed to fetch data: ${response.status} ${response.statusText}`
  //       );
  //     }
  //     // Add Initial Bot Message Placeholder
  //     const botMessageKey = `bot-${Date.now()}`;
  //     const initialMarkdownString = "";
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         key: botMessageKey,
  //         fromUser: false,
  //         // Store the raw Markdown string for accumulation
  //         rawMarkdown: initialMarkdownString,
  //         // The 'text' field will hold the ReactMarkdown component
  //         text: <ReactMarkdown>{initialMarkdownString}</ReactMarkdown>,
  //       },
  //     ]);
  //     // --- Process Stream ---
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let done = false;
  //     console.log("Starting stream reading loop...");
  //     while (!done) {
  //       const { value, done: doneReading } = await reader.read();
  //       done = doneReading;
  //       console.log("Reader Read:", { value, done });
  //       if (value) {
  //         const chunkStr = decoder.decode(value, { stream: !done });
  //         console.log("Decoded Chunk:", chunkStr);
  //         if (chunkStr) {
  //           console.log("Attempting to update state with chunk:", chunkStr);
  //           setMessages((prevMessages) =>
  //             prevMessages.map((msg) => {
  //               // Ensure this is the bot message we intend to update
  //               if (msg.key === botMessageKey && !msg.fromUser) {
  //                 const newRawMarkdown = (msg.rawMarkdown || "") + chunkStr;
  //                 return {
  //                   ...msg,
  //                   rawMarkdown: newRawMarkdown,
  //                   // Update the 'text' field with a new ReactMarkdown component
  //                   text: <ReactMarkdown>{newRawMarkdown}</ReactMarkdown>,
  //                 };
  //               }
  //               return msg;
  //             })
  //           );
  //         } else {
  //           console.log("Decoded chunk is empty, not updating state.");
  //         }
  //       } else if (done) {
  //         console.log("Stream finished (done is true, no more values).");
  //       }
  //     }
  //     console.log("Finished stream reading loop.");
  //   } catch (error) {
  //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //     typingTimeoutRef.current = null;
  //     setTyping(false);
  //     console.error("Error fetching or processing stream:", error);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         // Error messages can also be simple text or styled differently
  //         text: `Error: ${error.message}`,
  //         fromUser: false,
  //         isError: true,
  //         key: `error-${Date.now()}`,
  //       },
  //     ]);
  //   }
  // };
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
  // useEffect(() => {
  //   getItemDetails();
  //   getStoreDetails();
  // }, []);
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
        height: "100vh",
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
