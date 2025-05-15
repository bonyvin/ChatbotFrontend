import React from "react";
import { Form, FormSelect } from "react-bootstrap";
import "../styles/DynamicCutoutInput.css"; // Custom CSS file for dynamic cutout effect

export const DynamicCutoutInput = ({
  label,
  required,
  inputValue,
  fun,
  type,
  defaultValue,
  options=[],
  editable,
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
      <div className="input-container">
        {type==="select"?(
          <FormSelect
          {...rest}
          defaultValue={defaultValue}
          onChange={(e)=>fun(e.target.value)}
          disabled={editable}
          className="input-with-icons"
          >
           <option value=" disabled">Select Item Type</option>
          {options.map((option)=>(
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          </FormSelect>
        ):
        (<Form.Control
          {...rest}
          type={type}
          defaultValue={inputValue}
          onChange={(e) => fun(e.target.value)}
          disabled={editable}
          className="input-with-icons"
        />
      )}
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
