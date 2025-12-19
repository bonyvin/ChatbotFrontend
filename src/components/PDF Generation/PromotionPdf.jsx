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
      <View></View>
    </View>
  </View>
);

const Address = ({header}) => (
  <View style={styles.titleContainer}>
    <View style={styles.spaceBetween}>
      <View>
        <Text style={styles.poTitle}>
          {header?.promotionType}
          {` Promotion`}{" "}
        </Text>
        <Text style={styles.bodyText}>Start Date: {header.startDate}</Text>
        <Text style={styles.bodyText}>End Date: {header.endDate}</Text>
      </View>
      <View></View>
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

const TableBody = ({details}) =>
  details?.map((item, index) => (
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
export default function PromotionPdf({ header, details }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PoTitle />
        <Address  header={header}/>
        <TableHead />
        <TableBody details={details}/>
      </Page>
    </Document>
  );
}
