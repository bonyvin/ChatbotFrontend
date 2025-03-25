import React from "react";
import { Form } from "react-bootstrap";
import "../styles/DynamicCutoutInput.css"; // Custom CSS file for dynamic cutout effect

export const DynamicCutoutInput = ({
  label,
  required,
  inputValue,
  fun,
  editable,
  type,
  StartComponent, // New prop for start component
  EndComponent, // New prop for end component
  ...rest
}) => {
  return (
    <Form.Group className="  position-relative" id="formGroup">
      <Form.Label
        id="custom"
        className="position-absolute top-0   translate-middle custom"
      >
        <span style={{ backgroundColor: "#FBFCFE" }}>{label}</span>
        <div style={{ color: "red" }}>{required ? "*" : ""}</div>
      </Form.Label>
      {/* <Form.Control
        type={type}
        {...rest}
        defaultValue={inputValue} // Use defaultValue instead of value
        onChange={(e) => fun(e.target.value)}
        disabled={editable}
      /> */}
      <div className="input-container">
        <Form.Control
          type={type}
          {...rest}
          defaultValue={inputValue}
          onChange={(e) => fun(e.target.value)}
          disabled={editable}
          className="input-with-icons"
        />
        {StartComponent && (
          <div className="input-icon start">{StartComponent}</div> // Start icon inside the input
        )}
        {EndComponent && (
          <div className="input-icon end">{EndComponent}</div> // End icon inside the input
        )}
      </div>
    </Form.Group>
  );
};
