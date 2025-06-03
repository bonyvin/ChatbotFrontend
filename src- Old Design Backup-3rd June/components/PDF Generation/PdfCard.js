import React, { useState, useEffect } from "react";
import { CgFileDocument } from "react-icons/cg";
import { HiOutlineDownload, HiOutlinePrinter } from "react-icons/hi";
import { FiShare2 } from "react-icons/fi";
import {
  BlobProvider,
  PDFDownloadLink,
  Document,
  Page,
} from "@react-pdf/renderer";
import Invoice from "./Invoice";
import { saveAs } from "file-saver";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PrintIcon from "@mui/icons-material/Print";
import "../../styles/PdfCard.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PurchaseOrder from "./PurchaseOrder";
import Promotion from "./Promotion";

const PdfCard = ({
  title,
  invoiceID,
  uploadedFile,
  systemDocId,
  poFile,
  promoFile,
}) => {
  const uploadedFileStatus = uploadedFile && uploadedFile.status;
  // console.log("uploaded file in pdf card: ", uploadedFile);
  console.log("PRomo data: ",promoFile)
  const handleDownload = (blob) => {
    saveAs(
      blob,
      poFile && poFile?.status
        ? `PO${poFile?.poNumber}.pdf`
        : promoFile && promoFile?.status
        ? `PROMO${promoFile?.promoId}.pdf`
        : `invoice${invoiceID}.pdf`
    );
  };
  let file = uploadedFile && uploadedFile.file;
  let fileUrl = uploadedFile && URL.createObjectURL(file);
  const handleDownloadUploadedFile = (file) => {
    if (file) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.name; // Use file name from the input
      link.click();
    }
  };
  return (
    <div className={uploadedFileStatus ? "fileContainerUser" : "fileContainer"}>
      {uploadedFileStatus ? (
        <div className="flex">
          <div>
            <CgFileDocument
              color={uploadedFileStatus ? "#FFFFF" : "#90e0ef"}
              size={20}
              className="fileIcon"
            />
            <span className="bold">{uploadedFile.name}</span>
          </div>
          {file.type.startsWith("image/") ? (
            <img src={fileUrl} alt="Preview" className="max-w-full h-auto" />
          ) : file.type === "application/pdf" ? (
            <div>
              <DownloadIcon
                size={14}
                className="buttons"
                onClick={() => handleDownloadUploadedFile(file)}
              />
              <VisibilityIcon
                size={14}
                className="buttons"
                onClick={() => window.open(fileUrl, "_blank")}
              />
            </div>
          ) : (
            <p>Unsupported file format</p>
          )}
        </div>
      ) : (
        <div className="flex">
          <div>
            <CgFileDocument color="#90e0ef" size={20} className="fileIcon" />
            <span className="bold">{title}</span>
          </div>
          <div>
            {/* Using BlobProvider for both downloading and viewing */}
            <BlobProvider
              document={
                poFile && poFile?.poNumber ? (
                  <PurchaseOrder poId={poFile?.poNumber} />
                ) : promoFile && promoFile?.status ? (
                  <Promotion   promoId={promoFile?.promoId} />
                ) : (
                  <Invoice invoiceId={systemDocId} />
                )
              }
            >
              {({ url, blob }) => (
                <>
                  <DownloadIcon
                    size={14}
                    className="buttons"
                    onClick={() => handleDownload(blob)}
                  />{" "}
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <VisibilityIcon size={14} className="buttons" />
                  </a>
                </>
              )}
            </BlobProvider>
          </div>
        </div>
      )}
    </div>
  );
};
export default PdfCard;
// const PdfCard = ({ title, invoiceID, uploadedFile }) => {
//   const uploadedFileStatus = uploadedFile?.status;
//   const [fileUrl, setFileUrl] = useState(null);

//   useEffect(() => {
//     if (uploadedFile?.file) {
//       const blobUrl = URL.createObjectURL(uploadedFile.file);
//       setFileUrl(blobUrl);
//     }
//   }, [uploadedFile]);

//   const handleDownload = () => {
//     if (uploadedFile?.file) {
//       saveAs(uploadedFile.file, uploadedFile.name || `invoice${invoiceID}.pdf`);
//     }
//   };
//   return (
//     <div className="fileContainer">
//       <div className="flex">
//         <div>
//           <CgFileDocument color="#90e0ef" size={20} className="fileIcon" />
//           <span className="bold">{title}</span>
//         </div>
//         <div>
//           {/* Render the uploaded PDF */}
//           {uploadedFileStatus && fileUrl ? (
//             <Document file={fileUrl} onLoadError={(error) => console.error("Error loading PDF:", error)}>
//               <Page pageNumber={1} />
//             </Document>
//           ) : null}

//           {/* BlobProvider is not needed for uploaded files, but kept for generated PDFs */}
//           <BlobProvider document={<Invoice invoiceId={invoiceID} />}>
//             {({ url, blob }) => (
//               <>
//                 <DownloadIcon size={14} className="buttons" onClick={handleDownload} />{" "}
//                 <a href={url} target="_blank" rel="noopener noreferrer">
//                   <VisibilityIcon size={14} className="buttons" />
//                 </a>
//               </>
//             )}
//           </BlobProvider>
//         </div>
//       </div>
//     </div>
//   );
//   // return (
//   //   <div className="fileContainer">
//   //     <div className="flex">
//   //       <div>
//   //         <CgFileDocument color="#90e0ef" size={20} className="fileIcon" />
//   //         <span className="bold">{title}</span>
//   //       </div>
//   //       <div>
//   //         {/* Using BlobProvider for both downloading and viewing */}

//   //         {uploadedFileStatus ? (
//   //           <Document
//   //             file={uploadedFile.file}
//   //             onLoadError={(error) =>
//   //               console.error("Error loading PDF:", error)
//   //             }
//   //           >
//   //           </Document>
//   //         ) : null}
//   //         <BlobProvider document={<Invoice invoiceId={invoiceID} />}>
//   //           {({ url, blob }) => (
//   //             <>
//   //               <DownloadIcon
//   //                 size={14}
//   //                 className="buttons"
//   //                 onClick={() => handleDownload(blob)}
//   //               />{" "}
//   //               <a href={url} target="_blank" rel="noopener noreferrer">
//   //                 <VisibilityIcon size={14} className="buttons" />
//   //               </a>
//   //             </>
//   //           )}
//   //         </BlobProvider>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// };
// export default PdfCard;
{
  /* <div class="thin}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus eligendi reiciendis fuga doloremque
            </div> */
}

{
  /*<div style={{ ...styles.flex, ...{ justifyContent: "space-between" } }}>
        <PDFDownloadLink document={<Invoice />} fileName="invoice.pdf">
          <div class="btn}>
            <HiOutlineDownload size={14} />
            <span>Download</span>
          </div>
        </PDFDownloadLink>

        <BlobProvider document={<Invoice />}>
          {({ url, blob }) => (
            <a href={url} target="_blank" class="btn}>
              <HiOutlinePrinter size={14} />
              <span>Print</span>
            </a>
          )}
        </BlobProvider>

         <BlobProvider document={<Invoice />}>
                    {({ url, blob }) => (
                        <div class="btn} onClick={() => handleShare(url, blob)} >
                            <FiShare2 size={14} />
                            <span>Share</span>
                        </div>
                    )}
                </BlobProvider>
      </div> */
}
//   const styles = {
//     container: {
//       width: "240px",
//       borderRadius: "5px",
//       padding: "15px 12px",
//       display: "flex",
//       flexDirection: "column",
//       gap: "15px",
//       boxShadow: "0 3px 10px rgb(0 0 0 / 0.2)",
//       backgroundColor: "white",
//     },
//     flex: { width: "100%", display: "flex", gap: "10px", alignItems: "center" },
//     bold: { fontSize: "13px", fontWeight: 600 },
//     thin: { fontSize: "11px", color: "#6f6f6f", fontWeight: 500 },
//     btn: {
//       borderRadius: "3px",
//       border: "1px solid gray",
//       display: "flex",
//       alignItems: "center",
//       gap: "2px",
//       padding: "3px",
//       fontSize: "11px",
//       color: "#4f4f4f",
//       fontWeight: 600,
//       cursor: "pointer",
//       userSelect: "none",
//     },
//   };
// // console.log("PDF Card invoice",invoiceID)
// const array=[
//   {
//     "itemQuantity": 2,
//     "itemId": "ID123",
//     "itemCost": 20000,
//     "poId": "PO123",
//     "id": 1,
//     "itemDescription": "Item1",
//     "totalItemCost": 40000,
//     "invoiceNumber": "INV123"
//   },
//   {
//     "itemQuantity": 2,
//     "itemId": "ID123",
//     "itemCost": 20000,
//     "poId": "PO123",
//     "id": 3,
//     "itemDescription": "Item1",
//     "totalItemCost": 40000,
//     "invoiceNumber": "INV123"
//   },
//   {
//     "itemQuantity": 2,
//     "itemId": "ID125",
//     "itemCost": 20000,
//     "poId": "PO123",
//     "id": 4,
//     "itemDescription": "Item2",
//     "totalItemCost": 40000,
//     "invoiceNumber": "INV123"
//   },
//   {
//     "itemQuantity": 10,
//     "itemId": "ID123",
//     "itemCost": 0,
//     "poId": "PO123",
//     "id": 6,
//     "itemDescription": "Items",
//     "totalItemCost": 0,
//     "invoiceNumber": "INV123"
//   }
// ]
// const handleShare = async (blob) => {
//   await saveAs(blob, `invoice.pdf`);
//   window.location.href = `mailto:?subject=${encodeURIComponent(
//     `Invoice`
//   )}&body=${encodeURIComponent(`Kindly find attached invoice`)}`;
// };
