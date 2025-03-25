import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import BasicDocument from './BasicDocument';
import PurchaseOrder from './PDF Generation/PurchaseOrder';
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

// Create Document Component
const MyDocument = () => (
  <div>
    <a href={<PurchaseOrder poId={"PO123"} />} style={{fontSize:'30rem'}}>PDF</a>
  </div>
);
export default MyDocument