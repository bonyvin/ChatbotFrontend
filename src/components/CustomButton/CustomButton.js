
import React from 'react';
import "../../styles/Overall.css";

const CustomButton = ({ onClick, children }) => {
    return (
        <button className="custom-button"
            
            onClick={onClick}>
            {children}
        </button>
    );
};

export default CustomButton;
