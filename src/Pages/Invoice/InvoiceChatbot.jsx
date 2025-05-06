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
    [value.setItemDetails, value.setItemDetailsInput, value.setPoDetailsData]
  );
  //PO DETAILS
  const getPoDetails = useCallback(
    async (id, invoiceDatafromConversation) => {
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
            text: "Sorry, we couldn't find this Purchase Order in our database, please try another PO number",
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
  //EXTRACTING FIELD DATA FROM BACKEND
  const invoiceCheck2 = useCallback(
    async (invoiceObject, invoiceDatafromConversation) => {
      let updatedInvoiceData = { ...value.invoiceData };
      console.log("invoiceObject: ", invoiceObject);
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

              poStatus = await getPoDetails(
                invoiceObject[key],
                invoiceDatafromConversation
              );
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
    // [
    //   getPoDetails,
    //   updateItemDetails,
    //   value.poDetailsData,
    //   value.invoiceDatafromConversation,
    // ]
    [
      getPoDetails,
      updateItemDetails,
      //   value.poDetailsData, // Remove unstable dependency
      value.invoiceDatafromConversation,
      value.setInvoiceData, // Add stable setters
      value.setinvoiceDatafromConversation,
      value.invoiceData,
    ]
  );
  const prevInvoiceDataRef = useRef();

  useEffect(() => {
    if (
      value.invoiceDatafromConversation &&
      JSON.stringify(prevInvoiceDataRef.current) !==
        JSON.stringify(value.invoiceDatafromConversation)
    ) {
      updateItemDetails(value.invoiceDatafromConversation);
      prevInvoiceDataRef.current = value.invoiceDatafromConversation; // Update ref
    }
  }, [value.invoiceDatafromConversation, updateItemDetails]);
  //API CALLS
  //user input
  // const handleMessageSubmit = async (
  //   inputText,
  //   inputFromUpload,
  //   isPoTriggered = false
  // ) => {
  //   if (!inputText.trim()) return;

  //   // Update messages and clear input field
  //   setMessages((prevMessages) => {
  //     const newMessages =
  //       inputFromUpload || isPoTriggered
  //         ? [...prevMessages]
  //         : [...prevMessages, { text: inputText, fromUser: true }];
  //     if (!inputFromUpload) setInput("");
  //     return newMessages;
  //   });
  //   setInput("");
  //   setLoading(true);

  //   // Start a typing indicator
  //   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => setTyping(true), 1500);

  //   try {
  //     const response = await axios.post(
  //       `http://localhost:8000/creation/response`,
  //       {
  //         user_id: "admin",
  //         message: inputText,
  //       },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     console.log("Data response", response.data);

  //     if (response.status === 200 || response.status === 201) {
  //       const invoice_json = response.data.invoice_json;
  //       // Convert numeric fields if necessary
  //       console.log("Invoice_json: ",invoice_json)
  //       // normalize strings → numbers
  //       const totalAmount = parseFloat(
  //         String(invoice_json["Total Amount"]).replace(/,/g, "")
  //       );
  //       const totalTax = parseFloat(
  //         String(invoice_json["Total Tax"]).replace(/,/g, "")
  //       );
  //       console.log("Total amount,total tax:",totalAmount,totalTax)
  //       const updatedInvoiceJson = {
  //         ...invoice_json,
  //         "Total Amount": totalAmount,
  //         "Total Tax":    totalTax,
  //       };

  //       // let updatedInvoiceJson = {
  //       //   ...invoice_json,
  //       //   ...(invoice_json["Total Amount"] && {
  //       //     "Total Amount": parseFloat(
  //       //       invoice_json["Total Amount"].replace(/,/g, "")
  //       //     ),
  //       //   }),
  //       //   ...(invoice_json["Total Tax"] && {
  //       //     "Total Tax": parseFloat(
  //       //       invoice_json["Total Tax"].replace(/,/g, "")
  //       //     ),
  //       //   }),
  //       // };
  //       console.log("Updated Invoice json: ",updatedInvoiceJson)
  //       value.setinvoiceDatafromConversation(
  //         response.data.invoiceDatafromConversation
  //       );
  //       // Only run the invoice check (which triggers PO lookup) on a normal user query.
  //       if (
  //         !isPoTriggered &&
  //         prevIdRef.current !== updatedInvoiceJson["PO Number"]
  //       ) {
  //         prevIdRef.current = updatedInvoiceJson["PO Number"];
  //         const invoiceCheckStatus = await invoiceCheck2(
  //           updatedInvoiceJson,
  //           response.data.invoiceDatafromConversation
  //         );
  //         // updateItemDetails(response.data?.invoiceDatafromConversation);

  //         // If a PO number is found and details were fetched successfully,
  //         // call handleMessageSubmit a second time with the PO items.
  //         if (
  //           updatedInvoiceJson["PO Number"] &&
  //           invoiceCheckStatus &&
  //           response.data?.po_items?.length > 0
  //         ) {
  //           await handleMessageSubmit(
  //             `Add these items with cost=0 and quantities=0 : ${JSON.stringify(
  //               response.data?.po_items?.map((item) => item.itemId)
  //             )}`,
  //             inputFromUpload,
  //             true
  //           );
  //         } else {
  //           // Process a normal non-PO response
  //           const botReply = response.data.chat_history.slice(-1);
  //           const formattedConversation = response.data.chat_history
  //             .slice(-1)
  //             .map((text, index) => (
  //               <ReactMarkdown key={index} className="botText">
  //                 {inputFromUpload
  //                   ? "Here is what I could extract from the uploaded document:\n" +
  //                     text.slice(5)
  //                   : text.slice(5)}
  //               </ReactMarkdown>
  //             ));
  //           setMessages((prevMessages) => [
  //             ...prevMessages,
  //             { text: formattedConversation, fromUser: false },
  //           ]);
  //           if (response.data.submissionStatus === "submitted") {
  //             value.setInvoiceCounter((prevCounter) => prevCounter + 1);
  //             await invoiceHeaderCreation();
  //           }
  //         }
  //       } else {
  //         // For a PO-triggered submission, handle the response as needed.
  //         const botReply = response.data.chat_history.slice(-1);
  //         const formattedConversation = response.data.chat_history
  //           .slice(-1)
  //           .map((text, index) => (
  //             <ReactMarkdown key={index} className="botText">
  //               {inputFromUpload
  //                 ? "Here are the PO Items details:\n" + text.slice(5)
  //                 : text.slice(5)}
  //             </ReactMarkdown>
  //           ));
  //         setMessages((prevMessages) => [
  //           ...prevMessages,
  //           { text: formattedConversation, fromUser: false },
  //         ]);
  //         if (response.data.submissionStatus === "submitted") {
  //           value.setInvoiceCounter((prevCounter) => prevCounter + 1);
  //           await invoiceHeaderCreation();
  //         }
  //       }

  //       if (typingTimeoutRef.current) {
  //         clearTimeout(typingTimeoutRef.current);
  //         typingTimeoutRef.current = null;
  //       }
  //       setTyping(false);
  //     }
  //   } catch (error) {
  //     if (typingTimeoutRef.current) {
  //       clearTimeout(typingTimeoutRef.current);
  //       typingTimeoutRef.current = null;
  //     }
  //     setTyping(false);
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
        `http://localhost:8000/creation/response_new`, // API endpoint
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
        const totalAmount =
          invoice_json["Total Amount"] &&
          parseFloat(String(invoice_json["Total Amount"]).replace(/,/g, ""));
        const totalTax =
          invoice_json["Total Tax"] &&
          parseFloat(String(invoice_json["Total Tax"]).replace(/,/g, ""));
        console.log("Total amount,total tax:", totalAmount, totalTax);
        const updatedInvoiceJson = {
          ...invoice_json,  
          "Total Amount": totalAmount?totalAmount:null,
          "Total Tax": totalTax?totalTax:null,
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
          // updatedInvoiceJson["PO Number"] &&
          // invoiceCheckStatus &&
          // response.data?.po_items?.length > 0
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
          if (
            invoiceCheckStatus) {
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
      storeId: "STORE001",
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
    <Card className="chatbot-card">
      <Sheet
        // className="imageBackground"
        // style={{
        //   height: "83.75vh", //height-all
        //   display: "flex",
        //   flexDirection: "column",
        //   // backgroundColor: "#FFFAF3",
        //   overflowY: "auto",
        //   flexGrow: 1,
        //   borderTopLeftRadius:'1rem',
        //   borderTopRightRadius:'1rem',
        // }}
        className="chatbot-area imageBackground"
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
          {typing && (
            <TypingIndicatorComponent scrollToBottom={scrollToBottom} />
          )}
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
      </form> */}
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
    </Card>
  );
}
