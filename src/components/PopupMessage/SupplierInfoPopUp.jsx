import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DoneIcon from "@mui/icons-material/Done";
import "../styles/popupStyles.css";
import success from "../images/success.gif";
import failure from "../images/failure.gif";
import graph1 from "../images/supplier-graph1.png";
import graph2 from "../images/supplier-graph2.png";
import graph3 from "../images/supplier-graph3.png";
import graph4 from "../images/supplier-graph4.png";
import graph5 from "../images/supplier-graph5.png";
import infographic from "../images/supplier-infographic.png";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { FaWindowClose } from "react-icons/fa";
import ReactMarkdown from "react-markdown";


function SupplierInfoPopUp({ visible, setVisible, data }) {
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
              style={{ padding: "8%", width: "fit-content" }}
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
                    color: "#00338D",
                  }}
                >
                  Supplier Risk Assessment
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
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="tiles">
                  <div className="tile-content">
                    <BsFillInfoCircleFill className="tile-icon" />
                  </div>
                  <div
                    style={{
                      // marginTop: "10%",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Fill Rate
                  </div>
                  <img
                    src={`${data?.insights?.graph_data?.bar_chart}`}
                    className="tileImg"
                  />
                  <div
                    className="graph-sub-heading"
                  >
                    <span>{data?.insights?.fill_rate_dict.fill_rate}</span>
                    <span>{data?.insights?.fill_rate_dict.pending_rate}</span>
                  </div>
                  {/*<div className="tile-legends">
                     <div className="tile-legend">
                      <div
                        className="legend-circle"
                        style={{ backgroundColor: "#165BA9" }}
                      ></div>
                      <span>Total Items Delivered</span>
                    </div>
                    <div className="tile-legend">
                      <div
                        className="legend-circle"
                        style={{ backgroundColor: "#2D9CDB" }}
                      ></div>
                      <span>Items to be delivered</span>
                    </div> 
                  </div>*/}
                </div>
                <div className="tiles">
                  <div className="tile-content">
                    <BsFillInfoCircleFill className="tile-icon" />
                  </div>
                  <div
                    style={{
                      // marginTop: "10%",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Delays
                  </div>
                  <img
                    // src={graph1}
                    src={`${data?.insights?.graph_data?.delay_chart}`}
                    className="tileImg"
                  />
                  <div className="tile-legends">
                    {/* <div className="tile-legend">
                      <div
                        className="legend-circle"
                        style={{ backgroundColor: "#0000CD" }}
                      ></div>
                      <span>Number of Delayed Items</span>
                    </div> */}
                    <div className="tile-legend">
                      <span>{data?.insights?.delays}</span>
                    </div>
                  </div>
                </div>
                <div className="tiles">
                  <div className="tile-content">
                    <BsFillInfoCircleFill className="tile-icon" />
                  </div>
                  <div
                    style={{
                      // marginTop: "10%",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Quality Issues
                  </div>
                  <img
                    src={`${data?.insights?.graph_data?.pie_chart}`}
                    className="tileImg"
                  />
                  <div className="tile-legends">
                    {/* <div className="tile-legend">
                      <div
                        className="legend-circle"
                        style={{ backgroundColor: "#F765A3" }}
                      ></div>
                      <span>Defective Items</span>
                    </div>
                    <div className="tile-legend">
                      <div
                        className="legend-circle"
                        style={{ backgroundColor: "#A155B9" }}
                      ></div>
                      <span>Non-Defective Items</span>
                    </div> */}
                    <div className="graph-sub-heading">
                      <span>{data?.insights?.quality_dict.defective_rate}</span>
                      <span>
                        {data?.insights?.quality_dict.non_defective_rate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="tiles">
                  <div className="tile-content">
                    <BsFillInfoCircleFill className="tile-icon" />
                  </div>
                  <div
                    style={{
                      // marginTop: "10%",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Risk Score
                  </div>
                  <img
                    src={`${data?.insights?.graph_data?.gauge_chart}`}
                    className="tileImg"
                  />
                  <div className="tile-legends">
                    <div className="tile-legend">
                      {/* <div
                        className="legend-circle"
                        style={{ backgroundColor: "#004C78" }}
                      ></div>
                      <span>Supplier Risk Rate</span> */}
                      <div className="tile-legend">
                        <span>{data?.insights?.supplier_risk_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  // justifyContent: "space-evenly",
                  // justifyContent: "space-between",
                }}
              >
                <div className="insights-box" style={{}}>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      textDecoration: "underline",
                      marginBottom: "1rem",
                    }}
                  >
                    Key Insights
                  </div>              <ReactMarkdown>{data?.insights?.key_insights}
                                </ReactMarkdown>
                  {/*<ol>
                     <li>
                      15% likelihood that all items in your order will not be
                      fulfilled.
                    </li>
                    <li>
                      The history suggests that the orders from this supplier
                      are delayed by an average of 15 days
                    </li>
                    <li>
                      Frequent quality issues- 15% of the items do not meet
                      quality standards.
                    </li> 
                  </ol>*/}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    backgroundColor: "pink",
                    borderRadius: "1rem",
                    padding: "0.5rem",
                    flex: 1,
                    // paddingRight: "1rem",
                    margin: "1rem",
                    marginRight: 0,
                  }}
                >
                  <div
                    style={{
                      // backgroundColor: "pink",
                      // borderRadius: "1rem",
                      // padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={failure}
                      className="tileImg"
                      style={{ width: "3rem" }}
                    />
                    <div
                      style={{
                        paddingRight: "1rem",
                        fontWeight: "600",
                        color: "black",
                        textDecoration: "underline",
                      }}
                    >
                      Medium Risk Supplier
                    </div>
                  </div>{" "}
                  <div style={{ color: "black", fontSize: "0.75rem" }}>
                    Alert: Supplier not meeting environmental and safety
                    standards
                  </div>
                  {/* <img
                    src={infographic}
                    className="tileImg"
                    style={{ width: "8.5rem" }}
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierInfoPopUp;
{
  /* <div
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
    style={{ padding: "8%", width: "fit-content" }}
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
          color: "#00338D",
        }}
      >
        Supplier Risk Assessment
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
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div className="tiles">
        <div className="tile-content">
          <BsFillInfoCircleFill className="tile-icon" />
        </div>
        <div
          style={{
            marginTop: "10%",
            fontWeight: "600",
            color: "black",
          }}
        >
          Fill Rate
        </div>
        <img
          src={graph1}
          className="tileImg"
          style={{ width: "8.5rem" }}
        />
        <div className="tile-legends">
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#165BA9" }}
            ></div>
            <span>Total Items Delivered</span>
          </div>
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#2D9CDB" }}
            ></div>
            <span>Items to be delivered</span>
          </div>
        </div>
      </div>
      <div className="tiles">
        <div className="tile-content">
          <BsFillInfoCircleFill className="tile-icon" />
        </div>
        <div
          style={{
            marginTop: "10%",
            fontWeight: "600",
            color: "black",
          }}
        >
          Frequent Delays
        </div>
        <img
          src={graph4}
          className="tileImg"
          style={{ width: "8.5rem" }}
        />
        <div className="tile-legends">
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#0000CD" }}
            ></div>
            <span>Number of Delayed Items</span>
          </div>

        </div>
      </div>
      <div className="tiles">
        <div className="tile-content">
          <BsFillInfoCircleFill className="tile-icon" />
        </div>
        <div
          style={{
            marginTop: "10%",
            fontWeight: "600",
            color: "black",
          }}
        >
          Quality Issues
        </div>
        <img
          src={graph2}
          className="tileImg"
          style={{ width: "8.5rem" }}
        />
        <div className="tile-legends">
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#F765A3" }}
            ></div>
            <span>Defective Items</span>
          </div>
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#A155B9" }}
            ></div>
            <span>Non-Defective Items</span>
          </div>
        </div>
      </div>
      <div className="tiles">
        <div className="tile-content">
          <BsFillInfoCircleFill className="tile-icon" />
        </div>
        <div
          style={{
            marginTop: "10%",
            fontWeight: "600",
            color: "black",
          }}
        >
          High Risk Rate
        </div>
        <img
          src={graph5}
          className="tileImg"
          style={{ width: "8.5rem" }}
        />
        <div className="tile-legends">
          <div className="tile-legend">
            <div
              className="legend-circle"
              style={{ backgroundColor: "#004C78" }}
            ></div>
            <span>Supplier Risk Rate</span>
          </div>
        </div>
      </div>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div className="insights-box" style={{}}>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            textDecoration: "underline",
            marginBottom: "1rem",
          }}
        >
          Key Insights
        </div>
        <ol>
          <li>
            15% likelihood that all items in your order will not be
            fulfilled.
          </li>
          <li>
            The history suggests that the orders from this supplier
            are delayed by an average of 15 days
          </li>
          <li>
            Frequent quality issues- 15% of the items do not meet
            quality standards.
          </li>
        </ol>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "pink",
          borderRadius: "1rem",
          padding: "0.5rem",
          flex: 1,
          // paddingRight: "1rem",
          margin:'1rem',
          marginRight:0
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={failure}
            className="tileImg"
            style={{ width: "3rem" }}
          />
          <div
            style={{
              paddingRight: "1rem",
              fontWeight: "600",
              color: "black",
              textDecoration:'underline'
            }}
          >
            Medium Risk Supplier
          </div>
        </div>
        <div style={{ color: "black",fontSize:'0.75rem' }}>
          Alert: Supplier not meeting environmental and safety
          standards
        </div>

      </div>
    </div>
  </div>
</div>
</div> */
}
