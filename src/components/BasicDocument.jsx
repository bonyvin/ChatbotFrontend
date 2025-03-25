import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import logo from "../images/symbolBlue.png";
const styles1 = StyleSheet.create({
  page: {
    backgroundColor: "white",
    color: "black",
    padding: 20,
    paddingLeft: window.innerWidth * 0.025,
    paddingRight: window.innerWidth * 0.025,
  },
  viewer: {
    width: window.innerWidth, // the pdf viewer will take up all of the width and height
    height: window.innerHeight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "heavy",
  },
  logo: {
    alignItems: "flex-end",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  billTo: {
    marginBottom: 20,
  },
  billToTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  billToDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailTitle: {
    fontWeight: "bold",
  },
  table: {
    marginBottom: 20,
  },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    backgroundColor: "#12304A",
    color: "white",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    textAlign: "center",

    //   paddingVertical: 8,
  },
  tableHeader: {
    fontWeight: "bold",
    flex: 1,
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    //   borderLeftRightWidth:1,
    //   borderLeftColor:'#ddd',
    textAlign: "center",
  },
  notes: {
    marginBottom: 20,
  },
  notesTitle: {
    fontWeight: "bold",
  },
  summary: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  signatureItem: {
    width: "23%",
    alignItems: "center",
  },
  terms: {
    marginTop: 20,
  },
  termsTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  spaceBetween: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    color: "#3E3E3E",
  },
});
// Create styles
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

  logo: { width: w * 0.022 },
  reportTitle: {
    fontSize: w * 0.015,
    textAlign: "center",
    marginTop: h * 0.005,
    fontWeight: "bold", // Make the text bold
  },
  addressTitle: { fontSize: w * 0.0075, fontWeight: "bold", width: w * 0.08 },
  invoice: { fontWeight: "bold", fontSize: w * 0.015 },
  invoiceNumber: { fontSize: w * 0.01, fontWeight: "bold" },
  address: { fontWeight: "normal", fontSize: w * 0.01 },
  theader: {
    marginTop: h * 0.02,
    fontSize: w * 0.01,
    fontWeight: "bold",
    paddingTop: h * 0.005,
    paddingLeft: w * 0.007,
    flex: 1,
    height: h * 0.03,
    backgroundColor: "#DEDEDE",
    borderColor: "whitesmoke",
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  theader2: { flex: 2, borderRightWidth: 1, borderBottomWidth: 1 },
  tbody: {
    fontSize: w * 0.009,
    paddingTop: h * 0.005,
    paddingLeft: w * 0.007,
    flex: 1,
    borderColor: "whitesmoke",
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  total: {
    fontSize: w * 0.009,
    paddingTop: h * 0.005,
    paddingLeft: w * 0.007,
    flex: 1.5,
    borderColor: "whitesmoke",
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  tbody2: { flex: 2, borderRightWidth: 1, borderLeftWidth: 1 },
});

const InvoiceTitle = () => (
  <View style={styles.topContainer}>
    <View style={styles.spaceBetween}>
      <View>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.reportTitle}>Exp X</Text>
      </View>
      <View>
        <Text style={styles.addressTitle}>Date: </Text>
        <Text style={styles.addressTitle}>Invoice no:</Text>
      </View>
    </View>
  </View>
);
const Address = () => (
  <View style={styles.titleContainer}>
    <View style={styles.spaceBetween}>
      <View>
        <Text style={styles.invoice}>Invoice </Text>
        <Text style={styles.addressTitle}>Invoice type:</Text>
        <Text style={styles.addressTitle}>Supplier Id:</Text>
      </View>
      <View>
        <Text style={styles.addressTitle}>
          4th Floor, Building, 10 B, DLF
          Phase 2, Sector 25, Gurugram, Haryana 122002
        </Text>
      </View>
    </View>
  </View>
);
const UserAddress = () => (
  <View style={styles.titleContainer}>
    <View style={styles.spaceBetween}>
      <View style={{ maxWidth: 200 }}>
        <Text style={styles.addressTitle}>Bill to:</Text>
        <Text style={styles.addressTitle}>Recipient Address:</Text>
      </View>
      <Text style={styles.addressTitle}>Date:</Text>
    </View>
  </View>
);

// Create Document Component
function BasicDocument() {
  return (
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.page}>
          <InvoiceTitle />
          <Address />
          <UserAddress />
        </Page>
      </Document>
    </PDFViewer>
    // <PDFViewer style={styles.viewer}>
    //   {/* Start of the document*/}
    //   <Document>
    //     {/*render a single page*/}
    //     <Page size="A4" style={styles.page}>
    //       <View style={styles.header}>
    //         <Text style={styles.invoiceTitle}>Invoice</Text>
    //         {/* <View style={styles.logo}>
    //           <Text style={styles.logoText}>Garden Delights</Text>
    //         </View> */}
    //       </View>

    //       <View style={styles.billTo}>
    //         <Text style={styles.billToTitle}>Bill to</Text>
    //         <View style={styles.billToDetails}>
    //           <View>
    //             <Text style={styles.detailTitle}>Client Name</Text>
    //             <Text>Mark Thomas</Text>
    //           </View>
    //           <View>
    //             <Text style={styles.detailTitle}>Company Name</Text>
    //             <Text>FusionD Solutions</Text>
    //           </View>
    //           <View>
    //             <Text style={styles.detailTitle}>Client Address</Text>
    //             <Text>Street X, City X</Text>
    //           </View>
    //           <View>
    //             <Text style={styles.detailTitle}>Phone Number</Text>
    //             <Text>+00 000 000 000</Text>
    //           </View>
    //         </View>
    //       </View>

    //       <View style={styles.table}>
    //         <View style={styles.tableRowHeader}>
    //           <Text style={styles.tableHeader}>Quantity</Text>
    //           <Text style={styles.tableHeader}>Item ID</Text>
    //           <Text style={styles.tableHeader}>Description</Text>
    //           <Text style={styles.tableHeader}>Unit Price</Text>
    //           <Text style={styles.tableHeader}>Total</Text>
    //         </View>
    //         <View style={styles.tableRow}>
    //           <Text style={styles.tableCell}>1</Text>
    //           <Text style={styles.tableCell}>2138</Text>
    //           <Text style={styles.tableCell}>Seeding</Text>
    //           <Text style={styles.tableCell}>$30</Text>
    //           <Text style={styles.tableCell}>$30</Text>
    //         </View>
    //         {/* Add more rows as needed */}
    //       </View>

    //       <View style={styles.notes}>
    //         <Text><Text style={styles.notesTitle}>Notes:</Text></Text>
    //       </View>

    //       <View style={styles.summary}>
    //         <View style={styles.summaryItem}>
    //           <Text>Subtotal</Text>
    //           <Text>$30</Text>
    //         </View>
    //         <View style={styles.summaryItem}>
    //           <Text>Sales Tax</Text>
    //           <Text>$0</Text>
    //         </View>
    //         <View style={styles.summaryTotal}>
    //           <Text>TOTAL</Text>
    //           <Text>$30</Text>
    //         </View>
    //       </View>

    //       <View style={styles.footer}>
    //         <View style={styles.signatureSection}>
    //           <View style={styles.signatureItem}>
    //             <Text>Signature</Text>
    //           </View>
    //           <View style={styles.signatureItem}>
    //             <Text>Printed Name</Text>
    //           </View>
    //           <View style={styles.signatureItem}>
    //             <Text>Date</Text>
    //           </View>
    //           <View style={styles.signatureItem}>
    //             <Text>Payment method</Text>
    //           </View>
    //         </View>
    //         <View style={styles.terms}>
    //           <Text style={styles.termsTitle}>Terms & Conditions</Text>
    //           <Text>
    //             A constellation consists of visible stars that form a perceived outline or pattern, usually
    //             representing an animal, a person or mythological creature, or an inanimate object.
    //           </Text>
    //         </View>
    //       </View>
    //     </Page>
    //   </Document>
    // </PDFViewer>
  );
}

export default BasicDocument;
