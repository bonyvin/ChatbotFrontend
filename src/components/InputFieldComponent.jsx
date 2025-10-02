
import React, { useRef, useState } from "react";
import Add from "@mui/icons-material/AddCircle";
import Smiley from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import "../styles/ChatbotInputForm.css";
import { Form, FormSelect } from "react-bootstrap";

const InputFieldComponent = ({
  label,
  required,
  inputValue,
  fun,
  type,
  defaultValue,
  options=[],
  editable,
  labelColor,
  StartComponent, // New prop for start component
  EndComponent, // New prop for end component
  ...rest
}) => {
  return (
    <Form.Group   id="formGroup">
    {/* <Form.Group className="form-group-styled" id="formGroup"> */}
  <Form.Label className="form-label-styled" style={{color: labelColor || 'white'}}>
    {label} {required && <span className="required">*</span>}
  </Form.Label>

  <div className="input-container">
    {type === "select" ? (
      <FormSelect
        {...rest}
        defaultValue={defaultValue}
        onChange={(e) => fun(e.target.value)}
        disabled={editable}
        className="input-with-icons"
      >
        <option value="" disabled>Select Item Type</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>
    ) : (
      <Form.Control
        {...rest}
        type={type}
        defaultValue={inputValue}
        onChange={(e) => fun(e.target.value)}
        disabled={editable}
        className="input-with-icons"
        // placeholder="Enter the ASN number here"
      />
    )}

    {StartComponent && <div className="input-icon start">{StartComponent}</div>}
    {EndComponent && <div className="input-icon end">{EndComponent}</div>}
  </div>
</Form.Group>


  );
};

export default InputFieldComponent;
