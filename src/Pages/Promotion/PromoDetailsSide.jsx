// React and hooks
import React, { useContext, useEffect, useRef, useState } from "react";

// Images

// Pages

// Material UI components
import {
  Cancel,
  ExpandLess,
  ExpandMore,
  Visibility
} from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  Typography
} from "@mui/material";
import "../../styles/Overall.css"; 
// Joy UI components
import {
  Card,
  CardActions,
  CardOverflow,
  FormControl,
  IconButton,
  Option,
  Select,
  Stack
} from "@mui/joy";

// Bootstrap components
import { Form } from "react-bootstrap";

// React PDF

// Context


// Custom Components
import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
import PopUp from "../../components/PopupMessage/FormSubmissionStatusPopUp";
import PromoChatbotPane from "./PromoChatbotPane";
import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";

// React Icons
import { FiUpload } from "react-icons/fi";

// PDF Viewer
import { PDFViewer } from "@react-pdf/renderer";
import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
import { AuthContext } from "../../context/ContextsMasterFile";
import CustomButton from "../../components/CustomButton/CustomButton.js";

function PromoDetailsSide() {
  const messagesEndRef = useRef(null);

  const value = useContext(AuthContext);

  const [supplierPopupStatus, setSupplierPopupStatus] = useState(false);
  const [itemPopupStatus, setItemPopupStatus] = useState(false);
  const [tableToggle, setTableToggle] = useState(false);
  const [promoPreview, setPromoPreview] = useState(false);
  const initialItemsState =
    value.promoTotalItemsArray?.reduce((acc, item) => {
      acc[item] = false;
      return acc;
    }, {}) || {};
  const initialStoresState =
    value.promoStoreListArray?.reduce((acc, item) => {
      acc[item] = false;
      return acc;
    }, {}) || {};

  // Separate states for items and excluded items
  const [selectedItems, setSelectedItems] = useState(initialItemsState);
  const [excludedSelectedItems, setExcludedSelectedItems] =
    useState(initialItemsState);
  const [selectedStores, setSelectedStores] = useState(initialStoresState);
  const [excludedSelectedStores, setExcludedSelectedStores] =
    useState(initialStoresState);


  // State to control modal visibility and type ("items" or "excluded")
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const hierarchyTypeOptions = ["Department", "Class", "Sub Class"];
  const discountTypeOptions = ["Fixed Price", "% Off", "Buy One Get One Free"];
  const showForm = value.isActive;
  const initialHierarchyTypes = hierarchyTypeOptions.filter((type) =>
    value.promotionData.hierarchyType.includes(type)
  ); 
console.log("Initial Hierarchy Types:",initialHierarchyTypes);
  const handleTableExpand = () => {
    setTableToggle(!tableToggle);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);
  useEffect(() => {
    if (value.promotionData.itemList.length > 0) {
      setSelectedItems((prevSelectedItems) => {
        const updatedState = { ...prevSelectedItems };
        value.promotionData.itemList.forEach((item) => {
          updatedState[item] = true;
        });
        return updatedState;
      });
    }
    if (value.promotionData.excludedItemList.length > 0) {
      setExcludedSelectedItems((prevSelectedItems) => {
        const updatedState = { ...prevSelectedItems };
        value.promotionData.excludedItemList.forEach((item) => {
          updatedState[item] = true;
        });

        return updatedState;
      });
    }
    if (value.promotionData.locationList.length > 0) {
      setSelectedStores((prevSelectedItems) => {
        const updatedState = { ...prevSelectedItems };
        value.promotionData.locationList.forEach((item) => {
          updatedState[item] = true;
        });
        return updatedState;
      });
    }
    if (value.promotionData.excludedLocationList.length > 0) {
      setExcludedSelectedStores((prevSelectedItems) => {
        const updatedState = { ...prevSelectedItems };
        value.promotionData.excludedLocationList.forEach((item) => {
          updatedState[item] = true;
        });
        return updatedState;
      });
    }
  }, [
    value.promotionData.itemList,
    value.promotionData.excludedItemList,
    value.promoTotalItemsArray,
    value.promotionData.hierarchyType,
  ]);
  const handleRadioChange = (type) => {
    value.setTypeOfPromotion({
      simple: type === "simple",
      buyXGetY: type === "buyXGetY",
      threshold: type === "threshold",
      giftWithPurchase: type === "giftWithPurchase",
    });
    value.setPromotionData({ ...value.promotionData, promotionType: type });
  };
  // const handleChangeHierarchy = (event) => {
  //   console.log("handleChangeHierarchy  ", event
  //   );
  //   console.log("Current target: ",event.currentTarget)
  //   value.setPromotionData({
  //     ...value.promotionData,
  //     hierarchyType: event.target.checked
  //       ? [...value.promotionData.hierarchyType, event.target.value]
  //       : value.promotionData.hierarchyType.filter(
  //           (item) => item !== event.target.value
  //         ),
  //   });
  // };
  const handleChangeHierarchy = (event, newValue) => {
    // alert(`You chose "${newValue}"`);
    console.log("handleChangeHierarchy  ", newValue);
    let hierarchyValue = [...newValue];
    let hierarchyArray = [...value.promotionData.hierarchyType];
    let updatedValue = newValue.filter(
      (item) => item != [...value.promotionData.hierarchyType]
    );
    console.log(
      "hierarchy value:",
      ...newValue,
      "Hierarch array: ",
      hierarchyArray,
      "Hierarchy Filter: ",
      value.promotionData.hierarchyType.filter(
        (item) => !hierarchyValue.includes(item)
      ),
      "Updated",
      updatedValue
    );
    value.setPromotionData({
      ...value.promotionData,
      hierarchyType: [...value.promotionData.hierarchyType, ...updatedValue],
    });
  };
  // const handleChangeHierarchy = (event) => {
  //   const { value: clickedValue, checked } = event.target;
  //   value.setPromotionData({
  //     ...value.promotionData,
  //     hierarchyType: checked
  //       ? [...value.promotionData.hierarchyType, clickedValue]
  //       : value.promotionData.hierarchyType.filter(
  //           (item) => item !== clickedValue
  //         ),
  //   });
  // };
  const handleChangeDiscount = (event, newValue) => {
    value.setPromotionData({
      ...value.promotionData,
      discountType: newValue,
    });
  };
  // Generic change handler that updates the proper state based on modalType
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (modalType === "items") {
      setSelectedItems((prev) => ({ ...prev, [name]: checked }));
      console.log("name,checked,event", name, checked);
      value.setPromotionData({
        ...value.promotionData,
        itemList: checked
          ? [...value.promotionData.itemList, name] // Add the item if checked
          : value.promotionData.itemList.filter((item) => item !== name), // Remove the item if unchecked
      });
    } else if (modalType === "excluded") {
      setExcludedSelectedItems((prev) => ({ ...prev, [name]: checked }));
      value.setPromotionData({
        ...value.promotionData,
        itemList: checked
          ? [...value.promotionData.excludedItemList, name] // Add the item if checked
          : value.promotionData.excludedItemList.filter(
              (item) => item !== name
            ), // Remove the item if unchecked
      });
    } else if (modalType === "stores") {
      setSelectedStores((prev) => ({ ...prev, [name]: checked }));
      value.setPromotionData({
        ...value.promotionData,
        locationList: checked
          ? [...value.promotionData.locationList, name] // Add the item if checked
          : value.promotionData.locationList.filter((item) => item !== name),
      });
    } else if (modalType === "storesExcluded") {
      setExcludedSelectedStores((prev) => ({ ...prev, [name]: checked }));
      value.setPromotionData({
        ...value.promotionData,
        excludedLocationList: checked
          ? [...value.promotionData.excludedLocationList, name] // Add the item if checked
          : value.promotionData.excludedLocationList.filter(
              (item) => item !== name
            ),
      });
    }
  };
  // Function to open modal and set the type
  const handleItemModal = (type) => {
    setModalType(type); // type should be "items" or "excluded"
    setItemModalVisible(true);
  };
  const handleStoreModal = (type) => {
    setModalType(type); // type should be "items" or "excluded"
    setStoreModalVisible(true);
  };

  return (
    <Grid container component="main" style={{ backgroundColor: "#e9ecef" }}>
      <Grid
        item
        xs={8}
        sm={8}
        md={8}
        container
        component="main"
        style={{ padding: "1rem", paddingLeft: "0.25rem" }}
        ref={messagesEndRef}
      >
        <div style={{ position: "absolute" }}>
          <PopUp {...value.modalDetails} />
          <ItemInfoPopup
            visible={itemPopupStatus}
            setVisible={setItemPopupStatus}
          />
          <SupplierInfoPopUp
            visible={supplierPopupStatus}
            setVisible={setSupplierPopupStatus}
          />
          <Dialog
            open={itemModalVisible}
            onClose={() => setItemModalVisible(false)}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogTitle id="responsive-dialog-title">
              {"Select from list of items"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                style={{ display: "flex", flexDirection: "column" }}
              >
                {value.promoTotalItemsArray &&
                  value.promoTotalItemsArray.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange}
                          name={item}
                          checked={
                            modalType === "items"
                              ? value.promotionData.itemList.includes(item)
                              : modalType === "excluded"
                              ? value.promotionData.excludedItemList.includes(
                                  item
                                )
                              : null
                          }
                          // checked={
                          //   modalType === "items"
                          //     ? selectedItems[item]
                          //     : modalType === "excluded"
                          //     ? excludedSelectedItems[item]
                          //     : null
                          // }
                        />
                      }
                      label={item}
                    />
                  ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions style={{ justifyContent: "space-between" }}>
              <Button
                variant="contained"
                onClick={() => setItemModalVisible(false)}
              >
                OK
              </Button>
              <Button
                variant="contained"
                onClick={() => setItemModalVisible(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={storeModalVisible}
            onClose={() => setStoreModalVisible(false)}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogTitle id="responsive-dialog-title">
              {"Select from list of stores"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                style={{ display: "flex", flexDirection: "column" }}
              >
                {value.promoStoreListArray &&
                  value.promoStoreListArray.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange}
                          name={item}
                          checked={
                            modalType === "stores"
                              ? value.promotionData.locationList.includes(item)
                              : modalType === "storesExcluded"
                              ? value.promotionData.excludedLocationList.includes(
                                  item
                                )
                              : null
                          }
                          // checked={
                          //   modalType === "stores"
                          //     ? selectedStores[item]
                          //     : modalType === "storesExcluded"
                          //     ? excludedSelectedStores[item]
                          //     : null
                          // }
                        />
                      }
                      label={item}
                    />
                  ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions style={{ justifyContent: "space-between" }}>
              <Button
                variant="contained"
                onClick={() => setStoreModalVisible(false)}
              >
                OK
              </Button>
              <Button
                variant="contained"
                onClick={() => setStoreModalVisible(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          {/* <PopUp visible={value.modalVisible} text={value.modalText} /> */}
          <Dialog
            open={promoPreview}
            onClose={() => setPromoPreview(false)}
            aria-labelledby="responsive-dialog-title"
            style={{
              width: "90%",
              height: "90%",
              margin: "auto",
            }}
            PaperProps={{
              style: {
                width: "100%",
                height: "100%",
                maxWidth: "unset",
                maxHeight: "unset",
                margin: 0,
              },
            }}
          >
            <div
              className="dialog-container"
              // style={{
              //   width: "100%",
              //   height: "100%",
              //   display: "flex",
              //   overflow: "hidden",
              // }}
            >
              {/* Use PDFViewer to allow for real-time updates */}
              <PDFViewer
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  overflow: "hidden",
                }}
              >
                <PreviewDocs
                  promoPreview={true}
                  invoicePreview={false}
                  poPreview={false}
                  value={value}
                />
              </PDFViewer>
            </div>
          </Dialog>
        </div>

        {/* {!showForm ? (
          <Card
            className="generalView"
            style={{ width: "100%", padding: "2rem" }}
            
          >
            <img src={symbolBlue} style={{ width: "4.2rem" }}></img>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "60%",
              }}
            >
              <Typography
                className="OpenSans"
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#00338D",
                  marginBottom: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                Welcome Charles !
              </Typography>
              <Typography
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#00338D",
                  textAlign: "left",
                }}
              >
                Need help with purchase orders, invoices, payments, ASNs,
                promotions or more? I've got you covered - happy to assist!
              </Typography>
            </div>
          </Card>
        ) : ( */}

        <Card
          className="generalView"
          style={{ width: "100%" }}
          ref={messagesEndRef}
        >
          <Card ref={messagesEndRef}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  fontFamily: "Poppins,sans-sherif",
                }}
              >
                Promotions
              </Typography>
              <Typography style={{ fontSize: "0.6rem" }}>
                Fields marked as * are mandatory
              </Typography>
            </div>

            <Form className="generalRadio">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    fontFamily: "Poppins,sans-sherif",
                  }}
                >
                  Type
                </Typography>
              </div>
              <div
                style={{
                  //   display: "flex",
                  //   justifyContent: "space-between",
                  width: "90%",
                }}
              >
                <div
                  className="mb-3"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Form.Check
                    inline
                    label="Simple"
                    name="group1"
                    type={"radio"}
                    id={`inline- -1`}
                    className="labelText"
                    checked={value.typeOfPromotion.simple}
                    onChange={() => handleRadioChange("simple")}
                    // checked={value.promotionData.invoiceType.match(/merchandise/i) }
                  />
                  <Form.Check
                    inline
                    label="Buy X, Get Y"
                    disabled
                    name="group1"
                    type={"radio"}
                    id={`inline- -2`}
                    className="labelText"
                    checked={value.typeOfPromotion.buyXGetY}
                    onChange={() => handleRadioChange("buyXGetY")}
                    // checked={value.promotionData.invoiceType === "Non - Merchandise"}
                  />
                  <Form.Check
                    inline
                    label="Threshold"
                    disabled
                    name="group1"
                    type={"radio"}
                    id={`inline- -3`}
                    className="labelText"
                    checked={value.typeOfPromotion.threshold}
                    onChange={() => handleRadioChange("threshold")}
                    // checked={value.promotionData.invoiceType.match(/debit\s*-\s*\s*note\s*: ?(.*?)(?:,|$)/i) }
                  />
                  <Form.Check
                    inline
                    label="GWP (Gift with Purchase)"
                    disabled
                    name="group1"
                    type={"radio"}
                    id={`inline- -4`}
                    className="labelText"
                    // checked={value.promotionData.invoiceType === "Credit Note"}
                    checked={value.typeOfPromotion.giftWithPurchase}
                    onChange={() => handleRadioChange("giftWithPurchase")}
                  />
                </div>
              </div>
            </Form>
          </Card>
          <Card ref={messagesEndRef}>
            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      fontFamily: "Poppins,sans-sherif",
                    }}
                  >
                    Level
                  </Typography>
                </div>
                <Stack
                  direction="row"
                  spacing={12}
                  sx={{ alignItems: "center", width: "90%" }}
                >
                  <Typography
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      fontFamily: "Poppins,sans-sherif",
                      flexDirection: "row",
                      display: "flex",
                      width: "6rem",
                    }}
                  >
                    Hierarchy<div style={{ color: "red" }}>*</div>
                  </Typography>

                  <FormControl sx={{ flex: 1, position: "relative" }}>
                    <Form.Label
                      id="custom"
                      className="position-absolute top-0 translate-middle custom"
                      style={{ zIndex: 2, padding: "0 4px" }}
                    >
                      <span style={{ backgroundColor: "#FBFCFE", zIndex: 2 }}>
                        Hierarchy Type
                      </span>
                      <div style={{ color: "red", zIndex: 2 }}>*</div>
                    </Form.Label>
                    <Select
                      multiple
                      value={initialHierarchyTypes}
                      placeholder="Select Hierarchy Type"
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" },
                      }}
                      // onChange={(e, newValue) =>
                      //   value.setPromotionData((prev) => ({
                      //     ...prev,
                      //     hierarchyType: newValue,
                      //   }))
                      // }
                      renderValue={(selected ) => {
                        console.log("All selected:", selected);
                        return selected.map(option => {
                          // this will print each individual option string
                          console.log("Option:", option);
                          return <div key={option.value}>{option.value}</div>;
                        });
                      }}
                    >
                      {hierarchyTypeOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Value"
                      required={true}
                      placeholder="Add Value here"
                      value={value.promotionData.hierarchyValue}
                      fun={(text) =>
                        value.setPromotionData({
                          ...value.promotionData,
                          hierarchyValue: text,
                        })
                      }
                    />
                  </FormControl>
                </Stack>
                <Stack
                  direction="row"
                  spacing={12}
                  sx={{ alignItems: "center", width: "90%" }}
                >
                  <Typography
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      fontFamily: "Poppins,sans-sherif",
                      flexDirection: "row",
                      display: "flex",
                      width: "6rem",
                    }}
                  >
                    Item<div style={{ color: "red" }}>*</div>
                  </Typography>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Item Type"
                      required={true}
                      placeholder="Add Item IDs"
                      // value={Object.keys(selectedItems).filter(
                      //   (key) => selectedItems[key] === true
                      // )}
                      value={value.promotionData.itemList}
                      fun={(text) =>
                        value.setPromotionData({
                          ...value.promotionData,
                          itemList: text,
                        })
                      }
                      style={{}}
                      EndComponent={
                        <Visibility
                          style={{
                            backgroundColor: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => handleItemModal("items")}
                          id="item"
                        ></Visibility>
                      }
                    />
                  </FormControl>
                  <FormControl
                    sx={{ flex: 1, display: "flex", flexDirection: "row" }}
                  >
                    {!value.itemUpload.items && (
                      <Button
                        variant="outlined"
                        endIcon={<FiUpload style={{ fontSize: "1rem" }} />}
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          width: "50%",
                          fontSize: "0.8rem",
                          position: "relative", // Make the button the container for the file input
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        Upload
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer", // Ensures the input behaves like a button
                          }}
                          onChange={(e) =>
                            value.setItemUpload({
                              ...value.itemUpload,
                              items: true,
                              eventItems: e,
                            })
                          }
                          onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                        />
                      </Button>
                    )}
                    {value.itemUpload.items && (
                      <div style={{ display: "flex" }}>
                        <a
                          href={URL.createObjectURL(
                            value.itemUpload.eventItems.target.files[0]
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {value.itemUpload.eventItems.target.files[0].name
                            .length < 12
                            ? value.itemUpload.eventItems.target.files[0].name
                            : value.itemUpload.eventItems.target.files[0].name.substring(
                                0,
                                10
                              ) + "..."}
                        </a>
                        <Cancel
                          onClick={() =>
                            value.setItemUpload({
                              ...value.itemUpload,
                              items: false,
                              eventItems: null,
                            })
                          }
                        />
                      </div>
                    )}

                    <div
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        width: "50%",
                        fontSize: "0.5rem",
                        display: "flex",
                        // justifyContent:'center',
                        alignItems: "flex-end",
                        padding: "0.25rem",
                        paddingLeft: "0.5rem",
                      }}
                    >
                      Only Excel files allowed
                    </div>
                  </FormControl>
                </Stack>
                <Stack
                  direction="row"
                  spacing={12}
                  sx={{ alignItems: "center", width: "90%" }}
                >
                  <Typography
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      fontFamily: "Poppins,sans-sherif",
                      flexDirection: "row",
                      display: "flex",
                      width: "6rem",
                    }}
                  >
                    Exclusions
                  </Typography>
                  <FormControl sx={{ flex: 1 }}>
                    <DynamicCutoutInput
                      label="Exclusions"
                      required={false}
                      placeholder="Add Item IDs to exclude"
                      // value={Object.keys(excludedSelectedItems).filter(
                      //   (key) => excludedSelectedItems[key] === true
                      // )}
                      value={value.promotionData.excludedItemList}
                      fun={(text) =>
                        value.setPromotionData({
                          ...value.promotionData,
                          excludedItemList: text,
                        })
                      }
                      style={{}}
                      EndComponent={
                        <Visibility
                          style={{
                            backgroundColor: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => handleItemModal("excluded")}
                          id="exclusionItem"
                        ></Visibility>
                      }
                    />
                  </FormControl>
                  <FormControl
                    sx={{ flex: 1, display: "flex", flexDirection: "row" }}
                  >
                    {!value.itemUpload.excludedItems && (
                      <Button
                        variant="outlined"
                        endIcon={<FiUpload style={{ fontSize: "1rem" }} />}
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          width: "50%",
                          fontSize: "0.8rem",
                          position: "relative", // Make the button the container for the file input
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        Upload
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer", // Ensures the input behaves like a button
                          }}
                          onChange={(e) =>
                            value.setItemUpload({
                              ...value.itemUpload,
                              excludedItems: true,
                              eventExcludedItems: e,
                            })
                          }
                          onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                        />
                      </Button>
                    )}
                    {value.itemUpload.excludedItems && (
                      <div style={{ display: "flex" }}>
                        <a
                          href={URL.createObjectURL(
                            value.itemUpload.eventExcludedItems.target.files[0]
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {value.itemUpload.eventExcludedItems.target.files[0]
                            .name.length < 12
                            ? value.itemUpload.eventExcludedItems.target
                                .files[0].name
                            : value.itemUpload.eventExcludedItems.target.files[0].name.substring(
                                0,
                                10
                              ) + "..."}
                        </a>
                        <Cancel
                          onClick={() =>
                            value.setItemUpload({
                              ...value.itemUpload,
                              excludedItems: false,
                              event: null,
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="upload-div"
                      // style={{
                      //   fontFamily: "Poppins,sans-serif",
                      //   width: "50%",
                      //   fontSize: "0.5rem",
                      //   display: "flex",
                      //   // justifyContent:'center',
                      //   alignItems: "flex-end",
                      //   padding: "0.25rem",
                      //   paddingLeft: "0.5rem",
                      // }}
                    >
                      Only Excel files allowed
                    </div>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          </Card>
          <Card ref={messagesEndRef}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  fontFamily: "Poppins,sans-sherif",
                }}
              >
                Discount Details
              </Typography>
              <IconButton aria-label="exp" onClick={handleTableExpand}>
                {tableToggle ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            {tableToggle && (
              <Stack
                ref={messagesEndRef}
                direction="row"
                spacing={3}
                sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
              >
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={12}
                    sx={{ alignItems: "center", width: "90%" }}
                  >
                    <Typography
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        fontFamily: "Poppins,sans-sherif",
                        flexDirection: "row",
                        display: "flex",
                        width: "6rem",
                      }}
                    >
                      Discount<div style={{ color: "red" }}>*</div>
                    </Typography>
                    <FormControl sx={{ flex: 1, position: "relative" }}>
                      <Form.Label
                        id="custom"
                        className="position-absolute top-0 translate-middle custom"
                        style={{
                          zIndex: 2,
                          padding: "0 4px", // Optional: Add some padding to the label to prevent overlap
                        }}
                      >
                        <span style={{ backgroundColor: "#FBFCFE", zIndex: 2 }}>
                          Discount Type
                        </span>
                        <div style={{ color: "red", zIndex: 2 }}>{"*"}</div>
                      </Form.Label>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value.promotionData.discountType}
                        placeholder="Select Discount Type"
                        onChange={handleChangeDiscount}
                        sx={{
                          zIndex: 1,
                          "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                        }}
                      >
                        {discountTypeOptions.map((item) => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Discount Amount"
                        required={true}
                        placeholder="Add Amount here"
                        value={value.promotionData.discountValue}
                        fun={(text) =>
                          value.setPromotionData({
                            ...value.promotionData,
                            discountValue: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={12}
                    sx={{ alignItems: "center", width: "90%" }}
                  >
                    <Typography
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        fontFamily: "Poppins,sans-sherif",
                        flexDirection: "row",
                        display: "flex",
                        width: "6rem",
                      }}
                    >
                      Date<div style={{ color: "red" }}>*</div>
                    </Typography>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Start Date"
                        required={true}
                        placeholder="Choose start date"
                        value={value.promotionData.startDate}
                        type="date"
                        fun={(text) =>
                          value.setPromotionData({
                            ...value.promotionData,
                            startDate: text,
                          })
                        }
                        style={{}}
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        type="date"
                        label="End Date"
                        required={true}
                        placeholder="Choose End Date"
                        value={value.promotionData.endDate}
                        fun={(text) =>
                          value.setPromotionData({
                            ...value.promotionData,
                            endDate: text,
                          })
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={12}
                    sx={{ alignItems: "center", width: "90%" }}
                  >
                    <Typography
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        fontFamily: "Poppins,sans-sherif",
                        flexDirection: "row",
                        display: "flex",
                        width: "6rem",
                      }}
                    >
                      Location<div style={{ color: "red" }}>*</div>
                    </Typography>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Location"
                        required={true}
                        placeholder="Add Store IDs"
                        // value={Object.keys(selectedStores).filter(
                        //   (key) => selectedStores[key] === true
                        // )}
                        value={value.promotionData.locationList}
                        fun={(text) =>
                          value.setPromotionData({
                            ...value.promotionData,
                            locationList: text,
                          })
                        }
                        EndComponent={
                          <Visibility
                            style={{
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleStoreModal("stores")}
                            id="stores"
                          ></Visibility>
                        }
                      />
                    </FormControl>
                    <FormControl
                      sx={{ flex: 1, display: "flex", flexDirection: "row" }}
                    >
                      {!value.storeUpload.stores && (
                        <CustomButton className="upload-btn"
                          // variant="outlined"
                          // endIcon={<FiUpload style={{ fontSize: "1rem" }} />}
                          // style={{
                          //   fontFamily: "Poppins,sans-serif",
                          //   width: "50%",
                          //   fontSize: "0.8rem",
                          //   position: "relative", // Make the button the container for the file input
                          //   overflow: "hidden",
                          //   cursor: "pointer",
                          // }}
                        >
                          Upload
                          <input className="file-upload-input"
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            // style={{
                            //   position: "absolute",
                            //   top: 0,
                            //   left: 0,
                            //   width: "100%",
                            //   height: "100%",
                            //   opacity: 0,
                            //   cursor: "pointer", // Ensures the input behaves like a button
                            // }}
                            onChange={(e) =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                stores: true,
                                eventStores: e,
                              })
                            }
                            onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                          />
                        </CustomButton>
                      )}
                      {value.storeUpload.stores && (
                        <div style={{ display: "flex" }}>
                          <a
                            href={URL.createObjectURL(
                              value.storeUpload.eventStores.target.files[0]
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {value.storeUpload.eventStores.target.files[0].name
                              .length < 12
                              ? value.storeUpload.eventStores.target.files[0]
                                  .name
                              : value.storeUpload.eventStores.target.files[0].name.substring(
                                  0,
                                  10
                                ) + "..."}
                          </a>
                          <Cancel
                            onClick={() =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                stores: false,
                                eventStores: null,
                              })
                            }
                          />
                        </div>
                      )}
                      <div className="upload-div"
                        // style={{
                        //   fontFamily: "Poppins,sans-serif",
                        //   width: "50%",
                        //   fontSize: "0.5rem",
                        //   display: "flex",
                        //   // justifyContent:'center',
                        //   alignItems: "flex-end",
                        //   padding: "0.25rem",
                        //   paddingLeft: "0.5rem",
                        // }}
                      >
                        Only Excel files allowed
                      </div>
                    </FormControl>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={12}
                    sx={{ alignItems: "center", width: "90%" }}
                  >
                    <Typography
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        fontFamily: "Poppins,sans-sherif",
                        flexDirection: "row",
                        display: "flex",
                        width: "6rem",
                      }}
                    >
                      Exclusions
                    </Typography>
                    <FormControl sx={{ flex: 1 }}>
                      <DynamicCutoutInput
                        label="Exclusions"
                        required={false}
                        placeholder="Add Exclusions"
                        // value={Object.keys(excludedSelectedStores).filter(
                        //   (key) => excludedSelectedStores[key] === true
                        // )}
                        value={value.promotionData.excludedLocationList}
                        fun={(text) =>
                          value.setPromotionData({
                            ...value.promotionData,
                            excludedLocationList: text,
                          })
                        }
                        EndComponent={
                          <Visibility
                            style={{
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleStoreModal("storesExcluded")}
                            id="storesExcluded"
                          ></Visibility>
                        }
                        style={{}}
                      />
                    </FormControl>
                    <FormControl
                      sx={{ flex: 1, display: "flex", flexDirection: "row" }}
                    >
                      {!value.storeUpload.excludedStores && (
                        <CustomButton className="upload-btn"
                          // variant="outlined"
                          // endIcon={<FiUpload style={{ fontSize: "1rem" }} />}
                          // style={{
                          //   fontFamily: "Poppins,sans-serif",
                          //   width: "50%",
                          //   fontSize: "0.8rem",
                          //   position: "relative", // Make the button the container for the file input
                          //   overflow: "hidden",
                          //   cursor: "pointer",
                          // }}
                        >
                          Upload
                          <input className="file-upload-input"
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            // style={{
                            //   position: "absolute",
                            //   top: 0,
                            //   left: 0,
                            //   width: "100%",
                            //   height: "100%",
                            //   opacity: 0,
                            //   cursor: "pointer", // Ensures the input behaves like a button
                            // }}
                            onChange={(e) =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                excludedStores: true,
                                eventExcludedStores: e,
                              })
                            }
                            onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                          />
                        </CustomButton>
                      )}
                      {value.storeUpload.excludedStores && (
                        <div style={{ display: "flex" }}>
                          <a
                            href={URL.createObjectURL(
                              value.storeUpload.eventExcludedStores.target
                                .files[0]
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {value.storeUpload.eventExcludedStores.target
                              .files[0].name.length < 12
                              ? value.storeUpload.eventExcludedStores.target
                                  .files[0].name
                              : value.storeUpload.eventExcludedStores.target.files[0].name.substring(
                                  0,
                                  10
                                ) + "..."}
                          </a>
                          <Cancel
                            onClick={() =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                excludedStores: false,
                                eventExcludedStores: null,
                              })
                            }
                          />
                        </div>
                      )}
                      <div className="upload-div"
                        // style={{
                        //   fontFamily: "Poppins,sans-serif",
                        //   width: "50%",
                        //   fontSize: "0.5rem",
                        //   display: "flex",
                        //   // justifyContent:'center',
                        //   alignItems: "flex-end",
                        //   padding: "0.25rem",
                        //   paddingLeft: "0.5rem",
                        // }}
                      >
                        Only Excel files allowed
                      </div>
                    </FormControl>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Card>
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "0.75rem",
            }}
          >
            <CardActions
              style={{
                justifyContent: "space-between",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              <CustomButton
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                SAVE
              </CustomButton>

              <CustomButton
                onClick={() => setPromoPreview(true)}
              >
                PREVIEW
              </CustomButton>

              <CustomButton
                onClick={() => value.setFormSubmit((prevState) => !prevState)}
              >
                SUBMIT
              </CustomButton>
            </CardActions>
          </CardOverflow>
        </Card>
        {/* )}  */}
      </Grid>
      <Grid
        item
        xs={4}
        sm={4}
        md={4}
        // className="imageBackground"
        className="grid1"
        // style={{
        //   marginTop: "7.25vh",
        //   width: "100%",
        //   display: "flex",
        //   flexDirection: "column",
        // }}
      >
        {/* <Card
      className="generalView"
      style={{ width: "100%" }}
      ref={messagesEndRef}
    > */}
        <PromoChatbotPane />
      </Grid>
    </Grid>
  );
}

export default PromoDetailsSide;
