import React from 'react'
import "../styles/InvoiceTemplate.css";
const InvoiceTemplate = () => {
    return (
      <div className="invoice-container">
        <header className="invoice-header">
          <h1>Invoice</h1>
          <div className="logo">
            <h2>Garden Delights</h2>
          </div>
        </header>
  
        <section className="bill-to">
          <h2>Bill to</h2>
          <div className="bill-to-details">
            <div>
              <strong>Client Name</strong>
              <p>Mark Thomas</p>
            </div>
            <div>
              <strong>Company Name</strong>
              <p>FusionD Solutions</p>
            </div>
            <div>
              <strong>Client Address</strong>
              <p>Street X, City X</p>
            </div>
            <div>
              <strong>Phone Number</strong>
              <p>+00 000 000 000</p>
            </div>
          </div>
        </section>
  
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Item #</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2138</td>
              <td>Seeding</td>
              <td>$30</td>
              <td>$30</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
  
        <div className="notes">
          <p><strong>Notes:</strong></p>
        </div>
  
        <div className="summary">
          <div className="summary-item">
            <span>Subtotal</span>
            <span>$30</span>
          </div>
          <div className="summary-item">
            <span>Sales Tax</span>
            <span>$0</span>
          </div>
          <div className="summary-total">
            <span>TOTAL</span>
            <span>$30</span>
          </div>
        </div>
  
        <footer className="invoice-footer">
          <div className="signature-section">
            <div>
              <p>Signature</p>
            </div>
            <div>
              <p>Printed Name</p>
            </div>
            <div>
              <p>Date</p>
            </div>
            <div>
              <p>Payment method</p>
            </div>
          </div>
          <div className="terms">
            <h3>Terms & Conditions</h3>
            <p>
              A constellation consists of visible stars that form a perceived outline or pattern, usually
              representing an animal, a person or mythological creature, or an inanimate object.
            </p>
          </div>
        </footer>
      </div>
    );
  }
  
  export default InvoiceTemplate;
  