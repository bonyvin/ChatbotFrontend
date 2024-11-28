import React from "react";
import { Form } from "react-bootstrap";
import "../styles/DynamicCutoutInput.css"; // Custom CSS file for dynamic cutout effect

export const DynamicCutoutInput = ({ label, required,inputValue,fun,editable,type,...rest }) => {
  return (
    <Form.Group className="  position-relative" id="formGroup">
      <Form.Label
        id="custom"
        className="position-absolute top-0   translate-middle custom" 
        
      ><span style={{backgroundColor:"#FBFCFE"}}>{label}</span>
        <div style={{color:'red'}}>{required ? "*" : ""}</div>
      </Form.Label>
      <Form.Control type={type} {...rest} defaultValue={inputValue} // Use defaultValue instead of value
        onChange={(e) => fun(e.target.value)} disabled={editable}/>
    </Form.Group>
  );
};
