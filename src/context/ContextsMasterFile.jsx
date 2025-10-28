import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
} from "react";

export const AuthContext = createContext();

// export function useAuthContext() {
//    return useContext(AuthContext);
// }
const poInitialState = {
  poNumber: "",
  supplierId: "",
  leadTime: "",
  estDeliveryDate: "",
  totalQuantity: "",
  totalCost: "",
  totalTax: "",
  comments: "",
};

// Define reducer function
const poReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_PO_DATA":
      return { ...state, ...action.payload }; // Update the entire state with fetched data
    default:
      return state;
  }
};

export default function AuthProvider({ children }) {
  //    const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // useState hook to manage counter state
  // const [counter, setCounter] = useState(getInitialCounter);
  const getInitialCounter = () => {
    const savedCounter = localStorage.getItem("counter");
    return savedCounter !== null ? JSON.parse(savedCounter) : 150;
  };
  // const getInitialPoCounter = () => {
  //   const savedCounter = localStorage.getItem("poCounter");
  //   console.log("Saved po counter: ",savedCounter == null ? JSON.parse(savedCounter) : 150,JSON.parse(savedCounter))
  //   return savedCounter !== null ? JSON.parse(savedCounter) : 335; // Default to "PO150" if not set
  // };
  const getInitialPoCounter = () => {
    const savedCounter = localStorage.getItem("poCounter");
    return savedCounter !== null ? JSON.parse(savedCounter) : 350;
  };
  const getInitialPromoCounter = () => {
    const savedCounter = localStorage.getItem("promotionCounter");
    return savedCounter !== null ? JSON.parse(savedCounter) : 447;
  };

  const [invoiceCounter, setInvoiceCounter] = useState(getInitialCounter);
  const [poCounter, setPoCounter] = useState(getInitialPoCounter);
  const [promotionCounter, setPromotionCounter] = useState(
    getInitialPromoCounter
  );
  const [promotionCounterId, setPromotionCounterId] = useState(
    `PROMO${getInitialPromoCounter()}`
  );
  const [systemDocumentId, setSystemDocumentId] = useState(
    `INV${getInitialCounter()}`
  );
  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(invoiceCounter));
    localStorage.setItem("poCounter", JSON.stringify(poCounter));
    localStorage.setItem("promotionCounter", JSON.stringify(promotionCounter));
  }, [invoiceCounter, poCounter, promotionCounter]);

  const [poCounterId, setPoCounterId] = useState(`PO${getInitialPoCounter()}`);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDetails, setModalDetails] = useState({
    visible: false,
    text: "",
    isSuccessful: false,
  });
  // const [modalText, setModalText] = useState("");
  const [formSave, setFormSave] = useState(false);
  const [formSubmit, setFormSubmit] = useState(false);
  const [input, setInput] = useState("");
  const [invoiceDatafromConversation, setinvoiceDatafromConversation] =
    useState({});

  const [invoiceData, setInvoiceData] = useState({
    invoiceType: "",
    invoiceDate: "",
    poNumber: "",
    totalAmount: "",
    totalTax: "",
    items: "",
    quantity: "",
    supplierId: "",
    userInvNo: "",
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
    invoiceCost: "",
  });
  const [supplierDetails, setSupplierDetails] = useState({
    apiResponse: "",
    supplierId: "",
    leadTime: "",
    supplierStatus: false,
    supplierInsights:""
  });
  const [itemDetailsInput, setItemDetailsInput] = useState({
    items: "",
    quantity: "",
    invoiceCost: "",
  });
  const [itemListPo, setItemListPo] = useState([]);
  const [uploadedFile, setUploadedFile] = useState({
    status: false,
    name: null,
    file: null,
  });

  //PO
  const [state, dispatch] = useReducer(poReducer, poInitialState);
  const [purchaseItemDetails, setPurchaseItemDetails] = useState([]);
  const [purchaseOrderApiRes, setPurchaseOrderApiRes] = useState([]);
  const [purchaseContext, setPurchaseContext] = useState(poInitialState);
  //PROMO
  const [promotionData, setPromotionData] = useState({
    promotionType: "",
    hierarchyType: [],
    hierarchyValue: [],
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
  // const [promotionData, setPromotionData] = useState({
  //   promotionType: "",
  //   hierarchyType: "",
  //   hierarchyValue: "",
  //   brand: "",
  //   itemList: [],
  //   excludedItemList: [],
  //   discountType: "",
  //   discountValue: "",
  //   startDate: "",
  //   endDate: "",
  //   locationList: [],
  //   excludedLocationList: [],
  //   totalItemsArray: [],
  // });

  const [promoTotalItemsArray, setPromoTotalItemsArray] = useState([]);
  const [itemUpload, setItemUpload] = useState({
    eventItems: null,
    eventExcludedItems: null,
    items: false,
    excludedItems: false,
  });
  const [typeOfPromotion, setTypeOfPromotion] = useState({
    simple: false,
    buyXGetY: false,
    threshold: false,
    giftWithPurchase: false,
  });
  const [promoStoreListArray, setPromoStoreListArray] = useState([]);
  const [storeUpload, setStoreUpload] = useState({
    eventStores: null,
    eventExcludedStores: null,
    stores: false,
    excludedStores: false,
  });
    const [itemCreationData, setItemCreationData] = useState({
    itemType: "",
    itemDepartment: "",
    itemClass: "",
    itemSubClass: "",
    itemLevel: "",
    unitOfMeasurement: "",
    supplierId: "",
    unitCost: "",
  });
  const value = {
    isActive,
    setIsActive,
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
    modalText,
    setModalText,
    invoiceCounter,
    setInvoiceCounter,
    formSave,
    setFormSave,
    extractedData,
    setExtractedData,
    input,
    setInput,
    formSubmit,
    setFormSubmit,
    itemDetailsInput,
    setItemDetailsInput,
    itemListPo,
    setItemListPo,
    uploadedFile,
    setUploadedFile,
    modalDetails,
    setModalDetails,
    purchaseOrderData: state,
    dispatch,
    systemDocumentId,
    setSystemDocumentId,
    purchaseItemDetails,
    setPurchaseItemDetails,
    purchaseOrderApiRes,
    setPurchaseOrderApiRes,
    poCounter,
    setPoCounter,
    poCounterId,
    setPoCounterId,
    supplierDetails,
    setSupplierDetails,
    purchaseContext,
    setPurchaseContext,
    promotionCounter,
    setPromotionCounter,
    promotionCounterId,
    setPromotionCounterId,
    promotionData,
    setPromotionData,
    typeOfPromotion,
    setTypeOfPromotion,
    itemUpload,
    setItemUpload,
    promoTotalItemsArray,
    setPromoTotalItemsArray,
    promoStoreListArray,
    setPromoStoreListArray,
    storeUpload,
    setStoreUpload,
    itemCreationData, 
    setItemCreationData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
