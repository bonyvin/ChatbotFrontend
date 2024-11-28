import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// export function useAuthContext() {
//    return useContext(AuthContext);
// }

export default function AuthProvider({ children }) {
  //    const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // useState hook to manage counter state
  // const [counter, setCounter] = useState(getInitialCounter);
  const getInitialCounter = () => {
    const savedCounter = localStorage.getItem("counter");
    return savedCounter !== null ? JSON.parse(savedCounter) : 150;
  };
  const [invoiceCounter, setInvoiceCounter] = useState(getInitialCounter);
  const [modalVisible, setModalVisible] = useState(false);
  const [formSave, setFormSave] = useState(false);
  const [formSubmit, setFormSubmit] = useState(false);
  const [input, setInput] = useState("");
  //   const [invoiceType, setInvoiceType] = useState("");
  //   const [invoiceDate, setInvoiceDate] = useState("");
  //   const [poNumber, setPoNumber] = useState("");
  //   const [totalAmount, setTotalAmount] = useState("");
  //   const [totalTax, setTotalTax] = useState("");
  //   const [items, setItems] = useState([""]);
  //   const [quantity, setQuantity] = useState([""]);
  const [invoiceDatafromConversation, setinvoiceDatafromConversation] =
    useState({});

  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(invoiceCounter));
  }, [invoiceCounter]);

  const [invoiceData, setInvoiceData] = useState({
    invoiceType: "",
    invoiceDate: "",
    poNumber: "",
    totalAmount: "",
    totalTax: "",
    items: "",
    quantity: "",
    supplierId: "",
  });
  const [extractedData, setExtractedData] = useState({
    invoiceType: "",
    invoiceDate: "",
    poNumber: "",
    totalAmount: "",
    totalTax: "",
    items: "",
    quantity: "",
    // supplierId: "",
  });
  const [poHeaderData, setPoHeaderData] = useState({
    currency: "",
    paymentTerm: "",
    invoiceNo: "",
    totalCost: "",
    exchangeRate: "",
  });
  const [poDetailsData, setPoDetailsData] = useState([
    //   {
    //   itemDescription: "",
    //   id: "",
    //   totalItemCost: "",
    //   itemQuantity: "",
    //   itemId: "",
    //   itemCost: "",
    //   poId: ""
    // }
  ]);
  const [typeOfInvoice, setTypeOfInvoice] = useState({
    merchandise: false,
    nonMerchandise: false,
    debitNote: false,
    creditNote: false,
  });
  const [itemDetails, setItemDetails] = useState({
    items: "",
    quantity: "",
  });
  const [itemDetailsInput,setItemDetailsInput] = useState({
    items: "",
    quantity: "",
  });


  const value = {
    //   user,
    //   setUser,
    isActive,
    setIsActive,
    // invoiceType,
    // setInvoiceType,
    // invoiceDate,
    // setInvoiceDate,
    // poNumber,
    // setPoNumber,
    // totalAmount,
    // setTotalAmount,
    // totalTax,
    // setTotalTax,
    // items,
    // setItems,
    // quantity,
    // setQuantity,
    invoiceData,
    setInvoiceData,
    poHeaderData,
    setPoHeaderData,
    poDetailsData,
    setPoDetailsData,
    invoiceDatafromConversation,
    setinvoiceDatafromConversation,
    typeOfInvoice,
    setTypeOfInvoice,
    itemDetails,
    setItemDetails,
    modalVisible,
    setModalVisible,
    invoiceCounter,
    setInvoiceCounter,
    formSave,
    setFormSave,
    extractedData,
    setExtractedData,
    input,
    setInput,
    formSubmit,
    setFormSubmit,itemDetailsInput,setItemDetailsInput
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
