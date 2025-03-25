import React, { Fragment, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Image,
  Text,
  View,
  Page,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import logo from "../../images/symbolBlue.png";
import { AuthContext } from "../../context/ContextsMasterFile";
import { popoverClasses } from "@mui/material";

const PreviewDocs = ({
  invoicePreview = false,
  poPreview = false,
  promoPreview = false,
  value,
}) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const stylesInvoice = StyleSheet.create({
    viewer: {
      width: w, // the pdf viewer will take up all of the width and height
      height: h,
    },
    page: {
      fontSize: w * 0.01,
      paddingTop: h * 0.02,
      paddingLeft: w * 0.04,
      paddingRight: w * 0.04,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      color: "#3E3E3E",
      justifyContent: "space-between",
    },
    titleContainer: { flexDirection: "row", marginTop: h * 0.03 },
    topContainer: {
      flexDirection: "row",
      marginTop: h * 0.03,
      borderBottom: w * 0.001,
      // borderColor: "#DEDEDE",
    },

    logo: { width: w * 0.03 },
    reportTitle: {
      fontSize: w * 0.015,
      textAlign: "center",
      marginTop: h * 0.005,
      fontWeight: "bold", // Make the text bold
    },
    bodyText: { fontSize: w * 0.005 },
    invoice: { fontWeight: "bold", fontSize: w * 0.0075 },
    invoiceNumber: { fontSize: w * 0.01, fontWeight: "bold" },
    address: { fontWeight: "normal", fontSize: w * 0.01 },
    theader: {
      marginTop: 20,
      fontSize: 10,
      fontWeight: "bold",
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      height: 20,
      backgroundColor: "#DEDEDE",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    // theader: {
    //   marginTop: 20,
    //   fontSize: w * 0.006,
    //   fontWeight: "bold",
    //   paddingTop: 4,
    //   paddingLeft: 7,
    //   flex: 1,
    //   height: 20,
    //   backgroundColor: "#DEDEDE",
    //   borderColor: "whitesmoke",
    //   borderRightWidth: 1,
    //   borderBottomWidth: 1,
    // },
    theader2: { flex: 2, borderRightWidth: 1, borderBottomWidth: 1 },
    tbody: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    total: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      borderLeftWidth: 1,
    },
    tbody2: { flex: 2, borderRightWidth: 1, borderLeftWidth: 1 },
  });
  const stylesPromo = StyleSheet.create({
    viewer: { width: w, height: h },
    page: {
      fontSize: w * 0.01,
      paddingTop: h * 0.02,
      paddingLeft: w * 0.04,
      paddingRight: w * 0.04,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      color: "#3E3E3E",
      justifyContent: "space-between",
    },
    titleContainer: { flexDirection: "row", marginTop: h * 0.03 },
    logo: { width: w * 0.03 },
    reportTitle: {
      fontSize: w * 0.015,
      textAlign: "center",
      marginTop: h * 0.005,
      fontWeight: "bold", // Make the text bold
    },
    bodyText: { fontSize: w * 0.005 },
    poTitle: { fontWeight: "bold", fontSize: w * 0.0075 },
    poNumber: { fontSize: w * 0.01, fontWeight: "bold" },
    theader: {
      marginTop: 20,
      fontSize: 10,
      fontWeight: "bold",
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      height: 20,
      backgroundColor: "#DEDEDE",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    theader2: { flex: 2, borderRightWidth: 1, borderBottomWidth: 1 },

    total: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      borderLeftWidth: 1,
    },
    tbody: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbody2: { flex: 2, borderRightWidth: 1, borderLeftWidth: 1 },
    topContainer: {
      flexDirection: "row",
      marginTop: h * 0.03,
      borderBottom: w * 0.001,
      // borderColor: "#DEDEDE",
    },
  });
  const stylesPo = StyleSheet.create({
    viewer: { width: w, height: h },
    page: {
      fontSize: w * 0.01,
      paddingTop: h * 0.02,
      paddingLeft: w * 0.04,
      paddingRight: w * 0.04,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      color: "#3E3E3E",
      justifyContent: "space-between",
    },
    titleContainer: { flexDirection: "row", marginTop: h * 0.03 },
    logo: { width: w * 0.03 },
    reportTitle: {
      fontSize: w * 0.015,
      textAlign: "center",
      marginTop: h * 0.005,
      fontWeight: "bold", // Make the text bold
    },
    bodyText: { fontSize: w * 0.005 },
    poTitle: { fontWeight: "bold", fontSize: w * 0.0075 },
    poNumber: { fontSize: w * 0.01, fontWeight: "bold" },
    theader: {
      marginTop: 20,
      fontSize: 10,
      fontWeight: "bold",
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      height: 20,
      backgroundColor: "#DEDEDE",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    theader2: { flex: 2, borderRightWidth: 1, borderBottomWidth: 1 },

    total: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      borderLeftWidth: 1,
    },
    tbody: {
      fontSize: w * 0.005,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbody2: { flex: 2, borderRightWidth: 1, borderLeftWidth: 1 },
    topContainer: {
      flexDirection: "row",
      marginTop: h * 0.03,
      borderBottom: w * 0.001,
      // borderColor: "#DEDEDE",
    },
  });
  // const value = useContext(AuthContext)
  useEffect(() => {}, [value, invoicePreview, poPreview, promoPreview]);
  //INVOICE
  const TitleInvoice = () => (
    <View style={stylesInvoice.topContainer}>
      <View style={[stylesInvoice.spaceBetween, {}]}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Image style={stylesInvoice.logo} src={logo} />
          <Text style={stylesInvoice.reportTitle}>Exp X</Text>
        </View>
        <View style={{ width: w * 0.06 }}>
          <Text style={stylesInvoice.bodyText}>
            Date:{value?.invoiceData?.invoiceDate}{" "}
          </Text>
          <Text style={stylesInvoice.bodyText}>
            Invoice no:{`INV${value?.invoiceCounter}`}
          </Text>
        </View>
      </View>
    </View>
  );
  const AddressInvoice = () => (
    <View style={stylesInvoice.titleContainer}>
      <View style={stylesInvoice.spaceBetween}>
        <View>
          <Text style={stylesInvoice.invoice}>Invoice </Text>
          <Text style={stylesInvoice.bodyText}>
            Invoice type: {value?.invoiceData?.invoiceType}
          </Text>
          <Text style={stylesInvoice.bodyText}>
            Payment Term: {value?.poHeaderData?.paymentTerm}
          </Text>
        </View>
        <View style={{ width: w * 0.06 }}>
          <Text style={stylesInvoice.bodyText}>
            4th Floor, Building, 10 B, DLF Phase 2, Sector 25, Gurugram, Haryana
            122002
          </Text>
        </View>
      </View>
    </View>
  );
  const UserAddressInvoice = () => (
    <View style={stylesInvoice.titleContainer}>
      <View style={stylesInvoice.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={stylesInvoice.bodyText}>Bill to:</Text>
          <Text style={stylesInvoice.bodyText}>Recipient Address:</Text>
        </View>
      </View>
    </View>
  );
  const TableHeadInvoice = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[stylesInvoice.theader, stylesInvoice.theader2]}>
        <Text>Description</Text>
      </View>
      <View style={stylesInvoice.theader}>
        <Text>Items</Text>
      </View>
      <View style={stylesInvoice.theader}>
        <Text>Price</Text>
      </View>
      <View style={stylesInvoice.theader}>
        <Text>Qty</Text>
      </View>
      <View style={stylesInvoice.theader}>
        <Text>Total</Text>
      </View>
    </View>
  );
  const TableBodyInvoice = () => {
    const items = value?.poDetailsData;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }

    return items?.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[stylesInvoice.tbody, stylesInvoice.tbody2]}>
            <Text style={stylesInvoice.bodyText}>{item.itemDescription}</Text>
          </View>
          <View style={stylesInvoice.tbody}>
            <Text style={stylesInvoice.bodyText}>{item.itemId}</Text>
          </View>
          <View style={stylesInvoice.tbody}>
            <Text style={stylesInvoice.bodyText}>{item.invCost}</Text>
          </View>
          <View style={stylesInvoice.tbody}>
            <Text style={stylesInvoice.bodyText}>{item.invQty}</Text>
          </View>
          <View style={stylesInvoice.tbody}>
            <Text style={stylesInvoice.bodyText}>{item.invAmt}</Text>
          </View>
        </View>
      </Fragment>
    ));
  };
  const TableTotalInvoice = () => {
    const items = value?.poDetailsData;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }
    return (
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>Total Cost</Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>
            {items?.reduce((sum, item) => sum + parseFloat(item?.invAmt), 0)}
          </Text>
        </View>
      </View>
    );
  };
  const TableTaxTotalInvoice = () => {
    const items = value?.poDetailsData;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }
    return (
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>Total Cost</Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>
            {items?.reduce((sum, item) => sum + parseFloat(item?.total_tax), 0)}
          </Text>
        </View>
      </View>
    );
  };
  const TableAmountTotalInvoice = () => {
    const items = value?.poDetailsData;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }
    return (
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.total}>
          <Text></Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>Total Cost</Text>
        </View>
        <View style={stylesInvoice.tbody}>
          <Text>
            {items?.reduce(
              (sum, item) => sum + parseFloat(item?.total_amount),
              0
            )}
          </Text>
        </View>
      </View>
    );
  };
  //PURCHASE ORDER
  const TitlePo = () => (
    <View style={stylesPo.topContainer}>
      <View style={stylesPo.spaceBetween}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Image style={stylesPo.logo} src={logo} />
          <Text style={stylesPo.reportTitle}>Exp X</Text>
        </View>
        <View>
          <Text style={stylesPo.bodyText}>
            Estimated Delivery Date: {value?.purchaseOrderData?.estDeliveryDate}
          </Text>
          <Text style={stylesPo.bodyText}>PO Number: {`PO${value?.poCounter}`}</Text>
          <Text style={stylesPo.bodyText}>
            Supplier Name: {value?.supplierDetails?.apiResponse?.name}
          </Text>
        </View>
      </View>
    </View>
  );
  const AddressPo = () => (
    <View style={stylesPo.titleContainer}>
      <View style={stylesPo.spaceBetween}>
        <View>
          <Text style={stylesPo.poTitle}>Purchase Order</Text>
          <Text style={stylesPo.bodyText}>
            Supplier ID: {value?.supplierDetails?.apiResponse?.supplierId}
          </Text>
          <Text style={stylesPo.bodyText}>
            Supplier email: {value?.supplierDetails?.apiResponse?.email}
          </Text>
          <Text style={stylesPo.bodyText}>
            Supplier Address: {value?.supplierDetails?.apiResponse?.address}
          </Text>
        </View>
        <View>
          <Text style={stylesPo.bodyText}>
            Total Cost: {value?.purchaseOrderData?.totalCost} { "USD"}
          </Text>
          <Text style={stylesPo.bodyText}>
            Total Tax: {value?.purchaseOrderData?.totalTax}
            { "USD"}
          </Text>
          <Text style={stylesPo.bodyText}>
            Payment Terms: {value?.purchaseOrderData?.payment_term}
          </Text>
        </View>
      </View>
    </View>
  );
  const TableHeadPo = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[stylesPo.theader, stylesPo.theader2]}>
        <Text>Description</Text>
      </View>
      <View style={stylesPo.theader}>
        <Text>Item ID</Text>
      </View>
      <View style={stylesPo.theader}>
        <Text>Price</Text>
      </View>
      <View style={stylesPo.theader}>
        <Text>Quantity</Text>
      </View>
      <View style={stylesPo.theader}>
        <Text>Total</Text>
      </View>
    </View>
  );
  const TableBodyPo = () => {
    const items = value.purchaseItemDetails;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }
    return items?.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[stylesPo.tbody, stylesPo.tbody2]}>
            <Text>{item.itemDescription}</Text>
          </View>
          <View style={stylesPo.tbody}>
            <Text>{item.itemId}</Text>
          </View>
          <View style={stylesPo.tbody}>
            <Text>{item.itemCost}</Text>
          </View>
          <View style={stylesPo.tbody}>
            <Text>{item.itemQuantity}</Text>
          </View>
          <View style={stylesPo.tbody}>
            <Text>{parseFloat(item.itemCost) * parseFloat(item.itemQuantity)}</Text>
          </View>
        </View>
      </Fragment>
    ));
  };
  const TableTotalPo = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[stylesPo.tbody, stylesPo.tbody2]}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>Total Cost</Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>{value?.purchaseOrderData?.totalCost}</Text>
      </View>
    </View>
  );
  const TableTotalQuantityPo = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[stylesPo.tbody, stylesPo.tbody2]}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>Total Quantity</Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>{value?.purchaseOrderData?.totalQuantity}</Text>
      </View>
    </View>
  );
  const TableTotalTaxPo = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[stylesPo.tbody, stylesPo.tbody2]}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>Total Tax</Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>{value?.purchaseOrderData?.totalTax}</Text>
      </View>
    </View>
  );
  const TableTotalAmountPo = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[stylesPo.tbody, stylesPo.tbody2]}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.total}>
        <Text></Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>Total Amount</Text>
      </View>
      <View style={stylesPo.tbody}>
        <Text>{value?.purchaseOrderData?.totalTax + value?.purchaseOrderData?.totalCost}</Text>
      </View>
    </View>
  );
  //PROMOTION
  const TitlePromotion = () => (
    <View style={stylesPromo.topContainer}>
      <View style={stylesPromo.spaceBetween}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Image style={stylesPromo.logo} src={logo} />
          <Text style={stylesPromo.reportTitle}>Exp X</Text>
        </View>
        <View></View>
      </View>
    </View>
  );
  const AddressPromotion = () => (
    <View style={stylesPromo.titleContainer}>
      <View style={stylesPromo.spaceBetween}>
        <View>
          <Text style={stylesPromo.poTitle}>
            {value?.promotionData?.promotionType
              ? value?.promotionData?.promotionType
              : "________"}
            {` Promotion`}
          </Text>
          <Text style={stylesPromo.bodyText}>
            Start Date: {value?.promotionData?.startDate}
          </Text>
          <Text style={stylesPromo.bodyText}>
            End Date: {value?.promotionData?.endDate}
          </Text>
        </View>
        <View></View>
      </View>
    </View>
  );
  const TableHeadPromotion = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[stylesPromo.theader, stylesPromo.theader2]}>
        <Text>Promotion ID</Text>
      </View>
      <View style={stylesPromo.theader}>
        <Text>Component ID</Text>
      </View>
      <View style={stylesPromo.theader}>
        <Text>Item ID</Text>
      </View>
      <View style={stylesPromo.theader}>
        <Text>Discount Type</Text>
      </View>
      <View style={stylesPromo.theader}>
        <Text>Discount Value</Text>
      </View>
    </View>
  );
  console.log("Promotion preview: ", promoPreview, value);
  const TableBodyPromotion = () => {
    const items = value?.promotionData?.itemList;
    if (!items || items.length === 0) {
      return null; // Return null or <></> to avoid undefined
    }

    return items.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[stylesPromo.tbody, stylesPromo.tbody2]}>
            <Text>{`PROMO${value.promotionCounter}`}</Text>
          </View>
          <View style={stylesPromo.tbody}>
            <Text>{`COMP${value.promotionCounter}`}</Text>
          </View>
          <View style={stylesPromo.tbody}>
            <Text>{item}</Text>
          </View>
          <View style={stylesPromo.tbody}>
            <Text>{value?.promotionData?.discountType}</Text>
          </View>
          <View style={stylesPromo.tbody}>
            <Text>{value?.promotionData?.discountValue}</Text>
          </View>
        </View>
      </Fragment>
    ));
  };
  return (
    <Document>
      {invoicePreview ? (
        <Page size="A4" style={stylesInvoice.page}>
          <TitleInvoice />
          <AddressInvoice />
          <TableHeadInvoice />
          <TableBodyInvoice />
          <TableTotalInvoice />
          <TableTaxTotalInvoice />
          <TableAmountTotalInvoice />
        </Page>
      ) : poPreview ? (
        <Page size="A4" style={stylesPo.page}>
          <TitlePo />
          <AddressPo />
          <TableHeadPo />
          <TableBodyPo />
          <TableTotalPo />
          <TableTotalQuantityPo />
          <TableTotalTaxPo />
          <TableTotalAmountPo />
        </Page>
      ) : promoPreview ? (
        <Page size="A4" style={stylesPromo.page}>
          <TitlePromotion />
          <AddressPromotion />
          <TableHeadPromotion />
          <TableBodyPromotion />
        </Page>
      ) : null}
    </Document>
  );
};

export default PreviewDocs;
