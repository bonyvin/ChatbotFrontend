
export const API_URL = "http://localhost:8000";

export const SUPPLIER_RISK_INSIGHT = (supplierId) =>
  `${API_URL}/supplier-risk-insights?supplierId=${supplierId}`;
export const FETCH_SUPPLIER_BYID = (id) => `${API_URL}/suppliers/${id}`;
export const SUPPLIER_API = (supplierId) => `${API_URL}/suppliers/${supplierId}`;


export const FETCH_PO_BY_ID = (id) => `${API_URL}/poDetails/${id}`;

export const NEW_RESPONSE_CREATION = API_URL + "/creation/response_new";

export const ADD_INVOICE_DETAILS = API_URL + "/invDetailsAdd/";
export const INVOICE_CREATION = API_URL + "/invCreation/";
export const FETCH_INVOICE_BY_ID = (id) => `${API_URL}/invoiceDetails/${id}`;

export const UPLOAD_GPT = API_URL + "/uploadGpt/";

export const CLEAR_DATA = API_URL + "/clearData?submitted=submitted";

export const CHAT = API_URL + "/chat";
export const PROMO_CHAT = API_URL + "/promo-chat";
export const PROMO_LIST= API_URL + "/promotionDetails/";
export const PROMO_HEADER = API_URL + "/promotionHeader/";
export const UPLOAD_PROMO = API_URL+"/uploadPromo/";
export const FETCH_PROMO_BY_ID = (id) => `${API_URL}/promotionHeader/${id}`

export const ITEMS = API_URL +"/items";
export const STORE_LIST = API_URL +"/storeList";

export const ADD_PO_DETAILS = API_URL + "/poDetailsAdd/";
export const PO_CREATION = API_URL + "/poCreation/";
export const UPLOAD_PO = API_URL + "/uploadPo/";

export const NEW_FILE = API_URL + "/filenew";

// export const UPLOAD_SUPPLIER_DOC=(supplierId,docConfigId,docNumber)=>
//   `${API_URL}/v1/suppliers/doc/upload/${supplierId}/${docConfigId}?docNumber=${encodeURIComponent(docNumber)}`
// export const DELETE_SUPPLIER_DOC=(docNumber)=>`${API_URL}/v1/suppliers/doc/delete/${docNumber}`;


// export const FETCH_ALL_SUPPLIER_SITE = API_URL + "/v1/supplierSite/fetch/all";
// export const CREATE_SUPPLIER_SITE = API_URL + "/v1/supplierSite/create";
// export const UPDATE_SUPPLIER_SITE = API_URL + "/v1/supplierSite/update";
// export const DELETE_SUPPLIER_SITE = API_URL + "/v1/supplierSite/remove";
// export const FETCH_SUPPLIER_SITE_BYSUPPLIER = (id) =>
//   `${API_URL}/v1/supplierSite/fetch/bysupplier?id=${id}`;


// export const FETCH_ALL_PO = API_URL + "/v1/po/fetch/AssociatedPO";
// export const ACKNOWLEDGE_PO=(id)=> `${API_URL}/v1/po/acknowledge/${id}`;


// export const CREATE_DOC_COUNTRY_CONFIG =
//   API_URL + DOC_COUNTRY_CONFIG_URL + "/creates";
// export const UPDATE_DOC_COUNTRY_CONFIG =
//   API_URL + DOC_COUNTRY_CONFIG_URL + "/update";
// export const DELETE_DOC_COUNTRY_CONFIG = (country, docName) =>
//   `${API_URL}${DOC_COUNTRY_CONFIG_URL}/remove?countryName=${country}&docName=${docName}`;
// export const FETCH_DOCS_BY_COUNTRY = (countryName) =>
//   `${API_URL}${DOC_COUNTRY_CONFIG_URL}/fetch/doc/?country=${encodeURIComponent(
//     countryName
//   )}`;
// export const FETCH_ASSOCIATED_SUPPLIER_WITH_USER =
//   API_URL + "/v1/users/listSuppliers";
// export const FETCH_USER_INFO = API_URL + "/v1/users/info";
// export const RESET_PASSWORD_SELECTEDUSER = (username) =>
//   `${RESET_PASSWORD_USER}/${username}`;


