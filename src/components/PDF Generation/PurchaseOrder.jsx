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

import logo from "../../images/symbol-blue.png";

import { AuthContext } from "../../context/ContextsMasterFile";

import { FETCH_PO_BY_ID, FETCH_SUPPLIER_BYID } from "../../const/ApiConst";

const PurchaseOrder = ({ poId }) => {

  const [poData, setPoData] = useState(null);

  const [poHeader, setPoHeader] = useState(null);

  const [supplierData, setSupplierData] = useState(null);

  const getPoDetails = async (id) => {

    console.log("PO ID:", id);

    try {

      const response = await axios.get(

        FETCH_PO_BY_ID(id),

        {

          headers: {

            "Content-Type": "application/json",

            accept: "application/json",

          },

        }

      );

      console.log("PO Response: ", response.data);

      setPoData(response.data);

      setPoHeader(response.data.po_header);

      await getSupplierDetails(response.data.po_details[0]?.supplierId);

    } catch (error) {

      console.log("Get PO Error:", error);

    }

  };

  const getSupplierDetails = async (id) => {

    try {

      const response = await axios.get(FETCH_SUPPLIER_BYID(id));

      if (response.status === 200 || response.status === 201) {

        console.log("Supplier Response: ", response.data);

        setSupplierData(response.data);

      } else {

        console.log("False Supplier Details");

      }

    } catch (error) {

      console.log("Error fetching Supplier details:", error);

    }

  };

  useEffect(() => {

    if (poId) {

      getPoDetails(poId);

    }

  }, [poId]);

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
          <Text style={styles.bodyText}>

            Estimated Delivery Date: {poHeader?.estimatedDeliveryDate}
          </Text>
          <Text style={styles.bodyText}>PO Number: {poHeader?.poNumber}</Text>
          <Text style={styles.bodyText}>

            Supplier Name: {supplierData?.name}
          </Text>
        </View>
      </View>
    </View>

  );

  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.poTitle}>Purchase Order</Text>
          <Text style={styles.bodyText}>

            Supplier ID: {supplierData?.supplierId}
          </Text>
          <Text style={styles.bodyText}>

            Supplier email: {supplierData?.email}
          </Text>
          <Text style={styles.bodyText}>

            Supplier Address: {supplierData?.address}
          </Text>
        </View>
        <View>
          <Text style={styles.bodyText}>

            Total Cost: {poHeader?.totalCost} {poHeader?.currency}
          </Text>
          <Text style={styles.bodyText}>

            Total Tax: {poHeader?.totalTax}

            {poHeader?.currency}
          </Text>
          <Text style={styles.bodyText}>

            Payment Terms: {poHeader?.payment_term}
          </Text>
        </View>
      </View>
    </View>

  );

  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text>Description</Text>
      </View>
      <View style={styles.theader}>
        <Text>Item ID</Text>
      </View>
      <View style={styles.theader}>
        <Text>Price</Text>
      </View>
      <View style={styles.theader}>
        <Text>Quantity</Text>
      </View>
      <View style={styles.theader}>
        <Text>Total</Text>
      </View>
    </View>

  );

  const TableBody = () =>

    poData?.po_details?.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[styles.tbody, styles.tbody2]}>
            <Text>{item.itemDescription}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.itemId}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.itemCost}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.itemQuantity}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{item.totalItemCost}</Text>
          </View>
        </View>
      </Fragment>

    ));

  const TableTotal = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[styles.tbody, styles.tbody2]}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total Cost</Text>
      </View>
      <View style={styles.tbody}>
        <Text>{poHeader?.totalCost}</Text>
      </View>
    </View>

  );

  const TableTotalQuantity = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[styles.tbody, styles.tbody2]}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total Quantity</Text>
      </View>
      <View style={styles.tbody}>
        <Text>{poHeader?.totalQuantity}</Text>
      </View>
    </View>

  );

  const TableTotalTax = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[styles.tbody, styles.tbody2]}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total Tax</Text>
      </View>
      <View style={styles.tbody}>
        <Text>{poHeader?.totalTax}</Text>
      </View>
    </View>

  );

  const TableTotalAmount = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={[styles.tbody, styles.tbody2]}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total Amount</Text>
      </View>
      <View style={styles.tbody}>
        <Text>{poHeader?.totalTax + poHeader?.totalCost}</Text>
      </View>
    </View>

  );

  return (
    <Document>

      {poId && poData && poData.po_details && (
        <Page size="A4" style={styles.page}>
          <PoTitle />
          <Address />
          <TableHead />
          <TableBody />
          <TableTotal />
          <TableTotalQuantity />
          <TableTotalTax />
          <TableTotalAmount />
        </Page>

      )}
    </Document>

  );

};

export default PurchaseOrder;

