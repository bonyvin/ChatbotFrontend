import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import BasicDocument from './BasicDocument';
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
    <a href={<BasicDocument />} style={{fontSize:'30rem'}}>PDF</a>
  </div>
);
export default MyDocument