import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DoneIcon from "@mui/icons-material/Done";
import "../styles/popupStyles.css";
import success from "../images/success.gif";

function PopUp({ visible, text }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(visible);
  }, [visible]);
  // console.log("Visible", visible);
  const handleClose = () => setShow(false);

  return (
    <div className="text-center">
      {show && (
        <div
          id="myModal"
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-confirm">
            <div className="modal-content">
              <div className="modal-header">
                <div className="icon-box">
                  {/* <DoneIcon
                    className="material-icons"
                    style={{ height: "3em", width: "3em" }}
                  /> */}
                  <img src={success} style={{ width: "7rem" }}/>
                </div>
                <h4 className="modal-title w-100">Success!</h4>
              </div>
              <div className="modal-body">
                <p className="text-center">{text}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success btn-block"
                  onClick={handleClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PopUp;
