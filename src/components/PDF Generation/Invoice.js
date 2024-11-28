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

  useEffect(() => {
    if (invoiceId) {
      getInvDetails(invoiceId);
    }
  }, [invoiceId]);

  const value = useContext(AuthContext);

  const styles = StyleSheet.create({
    page: {
      fontSize: 11,
      paddingTop: 20,
      paddingLeft: 40,
      paddingRight: 40,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#3E3E3E",
    },
    titleContainer: { flexDirection: "row", marginTop: 24 },
    logo: { width: 90 },
    reportTitle: { fontSize: 16, textAlign: "center" },
    addressTitle: { fontSize: 11, fontWeight: "bold" },
    invoice: { fontWeight: "bold", fontSize: 20 },
    invoiceNumber: { fontSize: 11, fontWeight: "bold" },
    address: { fontWeight: 400, fontSize: 10 },
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
    tbody: {
      fontSize: 9,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    total: {
      fontSize: 9,
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
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.reportTitle}>Exp X</Text>
      </View>
    </View>
  );

  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.invoice}>Invoice </Text>
          <Text style={styles.invoiceNumber}>
            Invoice number: {invoiceHeader?.invoiceId}
          </Text>
          <Text style={styles.invoiceNumber}>
            Supplier Id: {invoiceHeader?.supplierId}
          </Text>
        </View>
        <View>
          <Text style={styles.addressTitle}>7, Ademola Odede, </Text>
          <Text style={styles.addressTitle}>Ikeja,</Text>
          <Text style={styles.addressTitle}>Lagos, Nigeria.</Text>
        </View>
      </View>
    </View>
  );

  const UserAddress = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={styles.addressTitle}>Bill to </Text>
          <Text style={styles.address}>Recipient Address</Text>
        </View>
        <Text style={styles.addressTitle}>{invoiceHeader?.invoicedate}</Text>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text>Items</Text>
      </View>
      <View style={styles.theader}>
        <Text>Price</Text>
      </View>
      <View style={styles.theader}>
        <Text>Description</Text>
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
            <Text>
              {parseFloat(item.itemCost) * parseFloat(item.itemQuantity)}
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
      <View style={styles.tbody}>
        <Text>Total</Text>
      </View>
      <View style={styles.tbody}>
        <Text>
          {invData?.inv_details?.reduce(
            (sum, item) =>
              sum + parseFloat(item.itemCost) * parseFloat(item.itemQuantity),
            0
          )}
        </Text>
      </View>
    </View>
  );

  return (
    <Document>
      {invoiceId && invData && invData.inv_details && (
        <Page size="A4" style={styles.page}>
          <InvoiceTitle />
          <Address />
          <UserAddress />
          <TableHead />
          <TableBody />
          <TableTotal />
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
