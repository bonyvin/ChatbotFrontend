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
import { FETCH_PROMO_BY_ID } from "../../const/ApiConst";

const Promotion = ({ promoId }) => {
  const [promoData, setPromoData] = useState(null);
  const [promoHeader, setPromoHeader] = useState(null);
 console.log("Inside Promotion document",promoId)
  const getPromoDetails = async (id) => {
    console.log("PROMO ID:", id);
    try {
      const response = await axios.get(
        FETCH_PROMO_BY_ID,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );
      console.log("Promo Response: ", response.data);
      setPromoData(response.data);
      setPromoHeader(response.data.promotion_header);
      // await getSupplierDetails(response.data.po_details[0]?.supplierId);
    } catch (error) {
      console.log("Get PO Error:", error);
    }
  };
  // const getSupplierDetails = async (id) => {
  //   try {
  //     const response = await axios.get(`http://localhost:8000/suppliers/${id}`);
  //     if (response.status === 200 || response.status === 201) {
  //       console.log("Supplier Response: ", response.data);
  //       setSupplierData(response.data);
  //     } else {
  //       console.log("False Supplier Details");
  //     }
  //   } catch (error) {
  //     console.log("Error fetching Supplier details:", error);
  //   }
  // };
  useEffect(() => {
    if (promoId) {
      getPromoDetails(promoId);
    }
  }, [promoId]);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const styles = StyleSheet.create({
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

  const PoTitle = () => (
    <View style={styles.topContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.reportTitle}>Exp X</Text>
        </View>
        <View>
          {/* <Text style={styles.bodyText}>
            Estimated Delivery Date: {promoHeader?.estimatedDeliveryDate}
          </Text>
          <Text style={styles.bodyText}>PO Number: {promoHeader?.poNumber}</Text>
          <Text style={styles.bodyText}>
            Supplier Name: {supplierData?.name}
          </Text> */}
        </View>
      </View>
    </View>
  );

  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.poTitle}>{promoData?.promotion_header?.promotionType}{` Promotion`} </Text>
          <Text style={styles.bodyText}>
            Start Date: {promoData?.promotion_header.startDate}
          </Text>
          <Text style={styles.bodyText}>
            End Date: {promoData?.promotion_header.endDate}
          </Text>
          {/* <Text style={styles.bodyText}>
            Supplier Address: {supplierData?.address}
          </Text> */}
        </View>
        <View>
          {/* <Text style={styles.bodyText}>
            Total Cost: {promoHeader?.totalCost} {promoHeader?.currency}
          </Text>
          <Text style={styles.bodyText}>
            Total Tax: {promoHeader?.totalTax}
            {promoHeader?.currency}
          </Text>
          <Text style={styles.bodyText}>
            Payment Terms: {promoHeader?.payment_term}
          </Text> */}
        </View>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text>Promotion ID</Text>
      </View>
      <View style={styles.theader}>
        <Text>Component ID</Text>
      </View>
      <View style={styles.theader}>
        <Text>Item ID</Text>
      </View>
      <View style={styles.theader}>
        <Text>Discount Type</Text>
      </View>
      <View style={styles.theader}>
        <Text>Discount Value</Text>
      </View>
    </View>
  );

  const TableBody = () =>
    promoData?.promotion_details?.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[styles.tbody, styles.tbody2]}>
            <Text>{item.promotionId}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.componentId}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.itemId}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.discountType}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.discountValue}</Text>
          </View>
        </View>
      </Fragment>
    ));

  // const TableTotal = () => (
  //   <View style={{ width: "100%", flexDirection: "row" }}>
  //     <View style={[styles.tbody, styles.tbody2]}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>Total Cost</Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>{promoHeader?.totalCost}</Text>
  //     </View>
  //   </View>
  // );
  // const TableTotalQuantity = () => (
  //   <View style={{ width: "100%", flexDirection: "row" }}>
  //     <View style={[styles.tbody, styles.tbody2]}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>Total Quantity</Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>{promoHeader?.totalQuantity}</Text>
  //     </View>
  //   </View>
  // );
  // const TableTotalTax = () => (
  //   <View style={{ width: "100%", flexDirection: "row" }}>
  //     <View style={[styles.tbody, styles.tbody2]}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>Total Tax</Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>{promoHeader?.totalTax}</Text>
  //     </View>
  //   </View>
  // );
  // const TableTotalAmount = () => (
  //   <View style={{ width: "100%", flexDirection: "row" }}>
  //     <View style={[styles.tbody, styles.tbody2]}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.total}>
  //       <Text></Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>Total Amount</Text>
  //     </View>
  //     <View style={styles.tbody}>
  //       <Text>{promoHeader?.totalTax + promoHeader?.totalCost}</Text>
  //     </View>
  //   </View>
  // );

  return (
    <Document>
      {promoId && promoData && promoData.promotion_details && (
        <Page size="A4" style={styles.page}>
          <PoTitle />
          <Address />
          <TableHead />
          <TableBody />
        </Page>
      )}
    </Document>
  );
};

export default Promotion;
