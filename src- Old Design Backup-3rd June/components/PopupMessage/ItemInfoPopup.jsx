import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/popupStyles.css";
import { FaWindowClose } from "react-icons/fa";
function ItemInfoPopup({ visible, setVisible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  const handleClose = () => {
    setShow(false);
    setVisible(false);
  };
  return (
    <div className="text-center">
      {show && (
        <div
          id="myModal"
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-confirm"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              className="modal-content"
              style={{   width: "fit-content" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                  }}
                >
                </div>
                <div>
                  <FaWindowClose
                    style={{
                      fontSize: "1.5rem",
                    }}
                    onClick={handleClose}
                  />
                </div>
                </div>
                <div className="item-insights-box" style={{}}>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      textDecoration: "underline",
                    }}
                  >
                    Item Insights
                  </div>
                  <ol>
                    <li>
                    Sufficient stock to meet the inventory demand for next 6 months.
                    </li>
                    <li>
                    Consider lowering the quantity of this item.
                    </li>
                    {/* <li>
                    High product sell through.
                    </li>
                    <li>
                    Item passes quality checks.
                    </li>
                    <li>
                    This item has an upcoming promotional offer so you can increase the quantity.
                    </li> */}
                  </ol>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default ItemInfoPopup;
