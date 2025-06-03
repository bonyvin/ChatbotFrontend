
import React from 'react';
import "../../styles/Overall.css";

const CustomButton = ({ onClick, children,className}) => {
    return (
        <button className={`custom-button ${className}`}
            
            onClick={onClick}>
            {children}
        </button>
    );
};

export default CustomButton;
