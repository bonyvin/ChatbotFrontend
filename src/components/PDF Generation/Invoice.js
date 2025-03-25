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

const Invoice = ({ invoiceId }) => {
  const [invData, setInvData] = useState(null); // Initialize with null
  const [invoiceHeader, setInvoiceHeader] = useState(null); // Initialize with null

  const getInvDetails = async (id) => {
    console.log("po id:", id);
    try {
      const response = await axios({
        method: "get",
        url: `http://localhost:8000/invoiceDetails/${id}`,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      console.log("Invoice js : PO response: ", response.data);
      setInvData(response.data);
      setInvoiceHeader(response.data.inv_header);
    } catch (error) {
      console.log("Get Po Error:", error);
    }
  };
  function camelToTitleCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space before capital letters
      .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
  }
  useEffect(() => {
    if (invoiceId) {
      getInvDetails(invoiceId);
    }
  }, [invoiceId]);

  const value = useContext(AuthContext);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const styles = StyleSheet.create({
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

  const InvoiceTitle = () => (
    <View style={styles.topContainer}>
      <View style={[styles.spaceBetween, {}]}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.reportTitle}>Exp X</Text>
        </View>
        <View style={{ width: w * 0.06 }}>
          <Text style={styles.bodyText}>
            Date:{invoiceHeader?.invoicedate}{" "}
          </Text>
          <Text style={styles.bodyText}>
            Invoice no:{invoiceHeader?.userInvNo}
          </Text>
        </View>
      </View>
    </View>
  );
  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.invoice}>Invoice </Text>
          <Text style={styles.bodyText}>
            Invoice type: {invoiceHeader?.invoiceType}
          </Text>
          <Text style={styles.bodyText}>
            Payment Term: {invoiceHeader?.payment_term}
          </Text>
        </View>
        <View style={{ width: w * 0.06 }}>
          <Text style={styles.bodyText}>
            4th Floor, Building, 10 B, DLF Phase 2, Sector 25, Gurugram, Haryana
            122002
          </Text>
        </View>
      </View>
    </View>
  );
  const UserAddress = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={styles.bodyText}>Bill to:</Text>
          <Text style={styles.bodyText}>Recipient Address:</Text>
        </View>
        {/* <Text style={styles.bodyText}>Date:{invoiceHeader?.invoicedate}</Text> */}
      </View>
    </View>
  );
  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text>Description</Text>
      </View>
      <View style={styles.theader}>
        <Text>Items</Text>
      </View>
      <View style={styles.theader}>
        <Text>Price</Text>
      </View>
      <View style={styles.theader}>
        <Text>Qty</Text>
      </View>
      <View style={styles.theader}>
        <Text>Total</Text>
      </View>
    </View>
  );

  const TableBody = () =>
    invData?.inv_details?.map((item, index) => (
      <Fragment key={index}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[styles.tbody, styles.tbody2]}>
            <Text style={styles.bodyText}>{item.itemDescription}</Text>
          </View>
          <View style={styles.tbody}>
            <Text style={styles.bodyText}>{item.itemId}</Text>
          </View>
          <View style={styles.tbody}>
            <Text style={styles.bodyText}>{item.itemCost}</Text>
          </View>
          <View style={styles.tbody}>
            <Text style={styles.bodyText}>{item.itemQuantity}</Text>
          </View>
          <View style={styles.tbody}>
            <Text style={styles.bodyText}>
              {item.totalItemCost}
              {/* {parseFloat(item.totalItemCost) * parseFloat(item.itemQuantity)} */}
            </Text>
          </View>
        </View>
      </Fragment>
    ));

  const TableTotal = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
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
        <Text>
          {invData?.inv_details?.reduce(
            (sum, item) => sum + parseFloat(item.totalItemCost),
            // sum + parseFloat(item.itemCost) * parseFloat(item.itemQuantity),
            0
          )}
        </Text>
      </View>
    </View>
  );
  const TableTaxTotal = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
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
        <Text>
          {/* {invData?.inv_details?.reduce(
            (sum, item) => sum + parseFloat(item.total_tax),
            // sum + parseFloat(item.itemCost) * parseFloat(item.itemQuantity),
            0
          )} */}
          {invoiceHeader?.total_tax}
        </Text>
      </View>
    </View>
  );
  const TableAmountTotal = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
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
        <Text>{invoiceHeader?.total_amount}</Text>
      </View>
    </View>
  );
  return (
    <Document>
      {invoiceId && invData && invData.inv_details && (
        <Page size="A4" style={styles.page}>
          <InvoiceTitle />
          <Address />
          {/* <UserAddress /> */}
          <TableHead />
          <TableBody />
          <TableTotal />
          <TableTaxTotal />
          <TableAmountTotal />
        </Page>
      )}
    </Document>
  );
};

export default Invoice;

// reciept_data.items.map((receipt) => (
//   <Fragment key={receipt.id}>
//     <View style={{ width: "100%", flexDirection: "row" }}>
//       <View style={[styles.tbody, styles.tbody2]}>
//         <Text>{receipt.desc}</Text>
//       </View>
//       <View style={styles.tbody}>
//         <Text>{receipt.price} </Text>
//       </View>
//       <View style={styles.tbody}>
//         <Text>{receipt.price} </Text>
//       </View>
//       <View style={styles.tbody}>
//         <Text>{receipt.qty}</Text>
//       </View>
//       <View style={styles.tbody}>
//         <Text>{(receipt.price * receipt.qty).toFixed(2)}</Text>
//       </View>
//     </View>
//   </Fragment>
// ));
