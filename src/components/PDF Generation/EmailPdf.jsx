import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import PromotionPdf from "./PromotionPdf";
import { PurchaseOrderPdf } from "./PurchaseOrderPdf";
import { InvoicePdf } from "./InvoicePdf";
import { CLEAR_DATA, FETCH_INVOICE_BY_ID, FETCH_PO_BY_ID, FETCH_PROMO_BY_ID, NEW_FILE, SUPPLIER_API } from "../../const/ApiConst";

// Helper to POST the file
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
  } catch (error) {
    console.log("Clear Error:", error, error.data);
  }
};

async function sendFile(file, email, body) {
  const form = new FormData();
  form.append("file", file);
  form.append("email", email);
  form.append("body", JSON.stringify(body));

  try {
    const { status } = await axios.post(
      NEW_FILE,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (status === 200) {
      await clearAllData();
      console.log("Email sent successfully");
      return { success: true, message: "Email sent successfully" }; // Indicate success
    }
    return { success: false, message: `Failed with status: ${status}` }; // Indicate failure with status
  } catch (err) {
    console.error("Error sending file:", err.response?.data?.message || err.message);
    return { success: false, message: err.response?.data?.message || err.message }; // Indicate failure with error message
  }
}

// Centralize each “type”’s fetch, component, and filename
const docConfigs = {
  promotion: {
    fetch: async (id) => {
      const { data } = await axios.get(FETCH_PROMO_BY_ID(id));
      return {
        header: data.promotion_header,
        details: data.promotion_details,
      };
    },
    component: ({ header, details }) => (
      <PromotionPdf header={header} details={details} />
    ),
    filename: (id) => `Promotion-${id}.pdf`,
  },
  purchaseOrder: {
    fetch: async (id) => {
      const { data } = await axios.get(FETCH_PO_BY_ID(id));
      
      const supplierId = data.po_details[0]?.supplierId;
      const apiUrl = SUPPLIER_API(supplierId);

      const supplierResp = await axios.get(
        apiUrl
      );
      return {
        poHeader: data.po_header,
        details: data.po_details,
        supplierData: supplierResp.data,
      };
    },
    component: ({ poHeader, details, supplierData }) => (
      <PurchaseOrderPdf
        poHeader={poHeader}
        details={details}
        supplierData={supplierData}
      />
    ),
    filename: (id) => `PO-${id}.pdf`,
  },
  invoice: {
    fetch: async (id) => {
      const { data } = await axios.get(FETCH_INVOICE_BY_ID(id));
      return {
        invoiceHeader: data.inv_header,
        inv_details: data.inv_details,
      };
    },
    component: ({ invoiceHeader, inv_details }) => (
      <InvoicePdf invoiceHeader={invoiceHeader} inv_details={inv_details} />
    ),
    filename: (id) => `Invoice-${id}.pdf`,
  },
};

export default async function EmailPdf({
  emailUsed,
  bodyUsed,
  promotion = false,
  purchaseOrder = false,
  invoice = false,
  documentId,
}) {
  try {
    // 1. Determine which type
    const type = promotion
      ? "promotion"
      : purchaseOrder
      ? "purchaseOrder"
      : invoice
      ? "invoice"
      : null;
    if (!type) {
      console.warn("No document type selected");
      // Explicitly return a failure status if no type is selected
      return { success: false, message: "No document type selected" };
    }

    // 2. Fetch data & build component
    const config = docConfigs[type];
    const props = await config.fetch(documentId);
    if (!props || Object.values(props).some((v) => v == null)) {
      console.warn(`No data for ${type}`, props);
      // Explicitly return a failure status if data is missing
      return { success: false, message: `No data for ${type}` };
    }
    const Doc = config.component(props);

    // 3. Generate PDF blob
    const blob = await pdf(Doc).toBlob();

    // 4. Wrap in File and send
    const file = new File([blob], config.filename(documentId), {
      type: "application/pdf",
    });
    
    // Crucial: Return the result of sendFile
    return await sendFile(file, emailUsed, bodyUsed);
  } catch (err) {
    console.error("Error in EmailPdf:", err);
    // Always return a consistent error object
    return { success: false, message: err.message || "An unexpected error occurred in EmailPdf." };
  }
}
// // Helper to POST the file
// const clearAllData = async () => {
//   try {
//     const response = await axios({
//       method: "post",
//       url: CLEAR_DATA,
//       headers: {
//         "Content-Type": "application/json",
//         accept: "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });
//     console.log("cleared all data");
//   } catch (error) {
//     console.log("Clear Error:", error, error.data);
//   }
// };
// // async function sendFile(file, email, body) {
// //   const form = new FormData();
// //   form.append("file", file);
// //   form.append("email", email);
// //   form.append("body", JSON.stringify(body));

// //   try {
// //     const { status } = await axios.post(
// //       NEW_FILE,
// //       form,
// //       { headers: { "Content-Type": "multipart/form-data" } }
// //     );
// //     if (status === 200){
// //       await clearAllData();
// //       console.log("Email sent successfully")
// //     };
// //   } catch (err) {
// //     console.error("Error sending file:", err.response?.data?.message || err.message);
// //   }
// // }
// async function sendFile(file, email, body) {
//   const form = new FormData();
//   form.append("file", file);
//   form.append("email", email);
//   form.append("body", JSON.stringify(body));

//   try {
//     const { status } = await axios.post(
//       NEW_FILE,
//       form,
//       { headers: { "Content-Type": "multipart/form-data" } }
//     );
//     if (status === 200) {
//       await clearAllData();
//       console.log("Email sent successfully");
//       return { success: true, message: "Email sent successfully" }; // Indicate success
//     }
//     return { success: false, message: `Failed with status: ${status}` }; // Indicate failure with status
//   } catch (err) {
//     console.error("Error sending file:", err.response?.data?.message || err.message);
//     return { success: false, message: err.response?.data?.message || err.message }; // Indicate failure with error message
//   }
// }

// // Centralize each “type”’s fetch, component, and filename
// const docConfigs = {
//   promotion: {
//     fetch: async (id) => {
//       const { data } = await axios.get(FETCH_PROMO_BY_ID(id));
//       return {
//         header: data.promotion_header,
//         details: data.promotion_details,
//       };
//     },
//     component: ({ header, details }) => (
//       <PromotionPdf header={header} details={details} />
//     ),
//     filename: (id) => `Promotion-${id}.pdf`,
//   },
//   purchaseOrder: {
//     fetch: async (id) => {
//       const { data } = await axios.get(FETCH_PO_BY_ID(id));
      
//       const supplierId = data.po_details[0]?.supplierId;
//       const apiUrl = SUPPLIER_API(supplierId);

//       const supplierResp = await axios.get(
//         apiUrl
//       );
//       return {
//         poHeader: data.po_header,
//         details: data.po_details,
//         supplierData: supplierResp.data,
//       };
//     },
//     component: ({ poHeader, details, supplierData }) => (
//       <PurchaseOrderPdf
//         poHeader={poHeader}
//         details={details}
//         supplierData={supplierData}
//       />
//     ),
//     filename: (id) => `PO-${id}.pdf`,
//   },
//   invoice: {
//     fetch: async (id) => {
//       const { data } = await axios.get(FETCH_INVOICE_BY_ID(id));
//       return {
//         invoiceHeader: data.inv_header,
//         inv_details: data.inv_details,
//       };
//     },
//     component: ({ invoiceHeader, inv_details }) => (
//       <InvoicePdf invoiceHeader={invoiceHeader} inv_details={inv_details} />
//     ),
//     filename: (id) => `Invoice-${id}.pdf`,
//   },
// };

// export default async function EmailPdf({
//   emailUsed,
//   bodyUsed,
//   promotion = false,
//   purchaseOrder = false,
//   invoice = false,
//   documentId,
// }) {
//   try {
//     // 1. Determine which type
//     const type = promotion
//       ? "promotion"
//       : purchaseOrder
//       ? "purchaseOrder"
//       : invoice
//       ? "invoice"
//       : null;
//     if (!type) {
//       console.warn("No document type selected");
//       return;
//     }

//     // 2. Fetch data & build component
//     const config = docConfigs[type];
//     const props = await config.fetch(documentId);
//     if (!props || Object.values(props).some((v) => v == null)) {
//       console.warn(`No data for ${type}`, props);
//       return;
//     }
//     const Doc = config.component(props);

//     // 3. Generate PDF blob
//     const blob = await pdf(Doc).toBlob();

//     // 4. Wrap in File and send
//     const file = new File([blob], config.filename(documentId), {
//       type: "application/pdf",
//     });
//     await sendFile(file, emailUsed, bodyUsed);
//   } catch (err) {
//     console.error("Error in EmailPdf:", err);
//   }
// }


// // Working Email PDF Code:
// import { BlobProvider, pdf } from "@react-pdf/renderer";
// import axios from "axios";
// import ReactDOMServer from "react-dom/server";
// import PurchaseOrder from "./PurchaseOrder";
// import Promotion from "./Promotion";
// import Invoice from "./Invoice";
// import PromotionPdf from "./PromotionPdf";
// import { PurchaseOrderPdf } from "./PurchaseOrderPdf";
// import { InvoicePdf } from "./InvoicePdf";

// // sendFile function to upload the file
// const sendFile = async (file, email, body) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("email", email);
//   formData.append("body", JSON.stringify(body)); // Convert body to JSON string
//   console.log("Inside send file");

//   try {
//     const response = await axios.post(
//       "http://localhost:8000/filenew",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data", // Required for file uploads
//         },
//       }
//     );

//     if (response.status === 200) {
//       console.log("Email has been sent");
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error("Error sending file:", error.response.data.message);
//     } else if (error.request) {
//       console.error("No response received from server:", error.request);
//     } else {
//       console.error("Error:", error.message);
//     }
//   }
// };

// // A normal function that generates the PDF and sends it via email
// const EmailPdf = async ({
//   emailUsed,
//   bodyUsed,
//   invoice = false,
//   purchaseOrder = false,
//   promotion = false,

//   documentId,
// }) => {
//   try {
//     if (!invoice && !purchaseOrder && !promotion) {
//       console.log("No document type selected");
//       return null;
//     }

//     //promotion
//     let promoHeader;
//     let promoDetails;
//     const getPromoDetails = async (id) => {
//       console.log("PROMO ID:", id);
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/promotionHeader/${id}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               accept: "application/json",
//             },
//           }
//         );
//         console.log("Promo Response: PDF", response.data);
//         promoHeader = response.data.promotion_header;
//         promoDetails = response.data.promotion_details;
//         // await getSupplierDetails(response.data.po_details[0]?.supplierId);
//       } catch (error) {
//         console.log("Get PO Error:", error);
//       }
//     };

//     //purchase order
//     let poHeader;
//     let poDetails;
//     let supplierDetails;

//     const getPoDetails = async (id) => {
//       console.log("PO ID:", id);
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/poDetails/${id}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               accept: "application/json",
//             },
//           }
//         );
//         console.log("PO Response: ", response.data);
//         poHeader = response.data.po_header;
//         poDetails = response.data.po_details;
//         await getSupplierDetails(response.data.po_details[0]?.supplierId);
//       } catch (error) {
//         console.log("Get PO Error:", error);
//       }
//     };
//     const getSupplierDetails = async (id) => {
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/suppliers/${id}`
//         );
//         if (response.status === 200 || response.status === 201) {
//           console.log("Supplier Response: ", response.data);
//           supplierDetails = response.data;
//         } else {
//           console.log("False Supplier Details");
//         }
//       } catch (error) {
//         console.log("Error fetching Supplier details:", error);
//       }
//     };

//     let invoiceHeader;
//     let invoiceDetails;

//     const getInvDetails = async (id) => {
//       console.log("inv id:", id);
//       try {
//         const response = await axios({
//           method: "get",
//           url: `http://localhost:8000/invoiceDetails/${id}`,
//           headers: {
//             "Content-Type": "application/json",
//             accept: "application/json",
//           },
//         });
//         console.log("Invoice js : PO response: ", response.data);
//         invoiceHeader = response.data.inv_header;
//         invoiceDetails = response.data.inv_details;
//       } catch (error) {
//         console.log("Get Po Error:", error);
//       }
//     };
//     let DocComponent;
//     if (promotion) {
//       await getPromoDetails(documentId);
//       if (promoHeader == null || promoDetails == null) {
//         console.log("Empty Promo");
//         return null;
//       }
//       DocComponent = (
//         <PromotionPdf header={promoHeader} details={promoDetails} />
//       );
//     } else if (purchaseOrder) {
//       await getPoDetails(documentId);
//       if (poHeader == null || poDetails == null) {
//         console.log("Empty PO");
//         return null;
//       }
//       DocComponent = (
//         <PurchaseOrderPdf
//           poHeader={poHeader}
//           details={poDetails}
//           supplierData={supplierDetails}
//         />
//       );
//     } else if (invoice) {
//       await getInvDetails(documentId);
//       if (invoiceHeader == null || invoiceDetails == null) {
//         return null;
//       }
//       DocComponent = (
//         <InvoicePdf
//           invoiceHeader={invoiceHeader}
//           inv_details={invoiceDetails}
//         />
//       );
//     } else {
//       throw new Error("No document type selected");
//     }

//     // 2. Use react-pdf's `pdf()` API to generate a Blob
//     const blob = await pdf(DocComponent).toBlob();

//     // 3. Wrap that Blob in a File object
//     const filename = promotion
//       ? `Promotion-${documentId}.pdf`
//       : purchaseOrder
//       ? `PO-${documentId}.pdf`
//       : `Invoice-${documentId}.pdf`;
//     const file = new File([blob], filename, { type: "application/pdf" });
//     await sendFile(file, emailUsed, bodyUsed);
//   } catch (error) {
//     console.error("Error in EmailPdf:", error);
//   }
// };

// export default EmailPdf;
