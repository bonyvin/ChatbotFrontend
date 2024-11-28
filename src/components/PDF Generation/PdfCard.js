import React from "react";
import { CgFileDocument } from "react-icons/cg";
import { HiOutlineDownload, HiOutlinePrinter } from "react-icons/hi";
import { FiShare2 } from "react-icons/fi";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import Invoice from "./Invoice";
import { saveAs } from "file-saver";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PrintIcon from "@mui/icons-material/Print";
import "../../styles/PdfCard.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

const PdfCard = ({ title, invoiceID }) => {

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

  // console.log("PDF Card invoice",invoiceID)
  const array=[
    {
      "itemQuantity": 2,
      "itemId": "ID123",
      "itemCost": 20000,
      "poId": "PO123",
      "id": 1,
      "itemDescription": "Item1",
      "totalItemCost": 40000,
      "invoiceNumber": "INV123"
    },
    {
      "itemQuantity": 2,
      "itemId": "ID123",
      "itemCost": 20000,
      "poId": "PO123",
      "id": 3,
      "itemDescription": "Item1",
      "totalItemCost": 40000,
      "invoiceNumber": "INV123"
    },
    {
      "itemQuantity": 2,
      "itemId": "ID125",
      "itemCost": 20000,
      "poId": "PO123",
      "id": 4,
      "itemDescription": "Item2",
      "totalItemCost": 40000,
      "invoiceNumber": "INV123"
    },
    {
      "itemQuantity": 10,
      "itemId": "ID123",
      "itemCost": 0,
      "poId": "PO123",
      "id": 6,
      "itemDescription": "Items",
      "totalItemCost": 0,
      "invoiceNumber": "INV123"
    }
  ]
  const handleShare = async (blob) => {
    await saveAs(blob, `invoice.pdf`);
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Invoice`
    )}&body=${encodeURIComponent(`Kindly find attached invoice`)}`;
  };

  return (
    <div class="fileContainer">
      <div class="flex">
        <div>
          <CgFileDocument color="#90e0ef" size={20}className="fileIcon" />
          <span className="bold">{title}</span>
        </div>
        <div>
          <PDFDownloadLink document={<Invoice />} fileName="invoice.pdf">
            <DownloadIcon size={14} className="buttons" />
          </PDFDownloadLink>
          <BlobProvider
            document={
              <Invoice
                invoiceId={invoiceID}
              />
            }
          >
            {({ url, blob }) => (
              <a href={url} target="_blank">
                <VisibilityIcon size={14} className="buttons" />
              </a>
            )}
          </BlobProvider>
        </div>
      </div>
      {/* <div class="thin}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus eligendi reiciendis fuga doloremque
            </div> */}

      {/*<div style={{ ...styles.flex, ...{ justifyContent: "space-between" } }}>
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
      </div> */}
    </div>
  );
};

export default PdfCard;
