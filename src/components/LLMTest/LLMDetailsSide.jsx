

// React and hooks
import React, { useContext, useEffect, useRef, useState } from "react";

// Images

// Pages

// Material UI components
import {
  Cancel,
  ExpandLess,
  ExpandMore,
  ViewHeadline,
  Visibility,
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
  Typography,
} from "@mui/material";
import "../../styles/Overall.css";
import { Box } from "@mui/material";
// Joy UI components
import {
  Card,
  CardActions,
  CardOverflow,
  FormControl,
  IconButton,
  Option,
  Select,
  Stack,
} from "@mui/joy";

// Bootstrap components
import { Form } from "react-bootstrap";

// React PDF

// Context

// Custom Components
import { DynamicCutoutInput } from "../DynamicCutoutInput.jsx";
import InputFieldComponent from "../InputFieldComponent.jsx";
import ItemInfoPopup from "../PopupMessage/ItemInfoPopup.jsx";
import PopUp from "../PopupMessage/FormSubmissionStatusPopUp.jsx";
import SupplierInfoPopUp from "../PopupMessage/SupplierInfoPopUp.jsx";

// React Icons
import { FiUpload } from "react-icons/fi";
import PreviewIcon from "@mui/icons-material/Preview";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";

// PDF Viewer
import { PDFViewer } from "@react-pdf/renderer";
import PreviewDocs from "../PDF Generation/PreviewDocs.jsx";
import { AuthContext } from "../../context/ContextsMasterFile.jsx";
import CustomButton from "../CustomButton/CustomButton.js";
import { ITEMS, STORE_LIST } from "../../const/ApiConst.js";
import axios from "axios";
import LLMChatbotTest from "./LLMChatbotTest.jsx";
import LLMChatbotTestAgentic from "./LLMChatbotTestAgentic.jsx";

export default function LLMDetailsSide() {
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
    value.promotionData.hierarchyType&&value.promotionData.hierarchyType.includes(type)
  );
  console.log("Initial Hierarchy Types:", initialHierarchyTypes);
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

  const handleChangeHierarchy = (event, newValue) => {
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

  const handleChangeDiscount = (event, newValue) => {
    value.setPromotionData({
      ...value.promotionData,
      discountType: newValue,
    });
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    if (modalType === "items") {
      // USER JUST CLICKED a checkbox in the “Items” modal.
      //  → set selectedItems[name] = checked
      //  → ALSO force excludedSelectedItems[name] = false if checked === true
      setSelectedItems((prev) => ({ ...prev, [name]: checked }));

      // Update the “itemList” in promotionData
      const newItemList = checked
        ? [...value.promotionData.itemList, name]
        : value.promotionData.itemList.filter((i) => i !== name);

      // If the user is checking name, we must remove it from excludedSelectedItems
      let newExcluded = { ...excludedSelectedItems };
      let newExcludedList = [...value.promotionData.excludedItemList];
      if (checked) {
        // Force‐uncheck in excludedSelectedItems
        newExcluded[name] = false;
        // Remove from promotionData.excludedItemList if it was there
        newExcludedList = newExcludedList.filter((i) => i !== name);
      }
      setExcludedSelectedItems(newExcluded);

      // Finally, write these two arrays back into promotionData
      value.setPromotionData({
        ...value.promotionData,
        itemList: newItemList,
        excludedItemList: newExcludedList,
      });
    } else if (modalType === "excluded") {
      // USER JUST CLICKED a checkbox in the “Excluded Items” modal.
      //  → set excludedSelectedItems[name] = checked
      //  → ALSO force selectedItems[name] = false if checked === true
      setExcludedSelectedItems((prev) => ({ ...prev, [name]: checked }));

      // Update the “excludedItemList” in promotionData
      const newExcludedList = checked
        ? [...value.promotionData.excludedItemList, name]
        : value.promotionData.excludedItemList.filter((i) => i !== name);

      // If the user is checking name, we must remove it from selectedItems
      let newSelected = { ...selectedItems };
      let newItemList = [...value.promotionData.itemList];
      if (checked) {
        // Force‐uncheck in selectedItems
        newSelected[name] = false;
        // Remove from promotionData.itemList if it was there
        newItemList = newItemList.filter((i) => i !== name);
      }
      setSelectedItems(newSelected);

      // Finally, write these two arrays back into promotionData
      value.setPromotionData({
        ...value.promotionData,
        excludedItemList: newExcludedList,
        itemList: newItemList,
      });
    } else if (modalType === "stores") {
      // USER JUST CLICKED a checkbox in the “Stores” modal.
      setSelectedStores((prev) => ({ ...prev, [name]: checked }));

      // Update the “locationList” in promotionData
      const newLocationList = checked
        ? [...value.promotionData.locationList, name]
        : value.promotionData.locationList.filter((i) => i !== name);

      // If the user checked name in “stores,” force it out of “storesExcluded”
      let newExcludedStoreState = { ...excludedSelectedStores };
      let newExcludedStoreList = [...value.promotionData.excludedLocationList];
      if (checked) {
        newExcludedStoreState[name] = false;
        newExcludedStoreList = newExcludedStoreList.filter((i) => i !== name);
      }
      setExcludedSelectedStores(newExcludedStoreState);

      // Write them back into promotionData
      value.setPromotionData({
        ...value.promotionData,
        locationList: newLocationList,
        excludedLocationList: newExcludedStoreList,
      });
    } else if (modalType === "storesExcluded") {
      // USER JUST CLICKED a checkbox in the “Stores Excluded” modal.
      setExcludedSelectedStores((prev) => ({ ...prev, [name]: checked }));

      // Update the “excludedLocationList” in promotionData
      const newExcludedStoreList = checked
        ? [...value.promotionData.excludedLocationList, name]
        : value.promotionData.excludedLocationList.filter((i) => i !== name);

      // If the user checked name in “storesExcluded,” force it out of “stores”
      let newSelectedStoreState = { ...selectedStores };
      let newLocationList = [...value.promotionData.locationList];
      if (checked) {
        newSelectedStoreState[name] = false;
        newLocationList = newLocationList.filter((i) => i !== name);
      }
      setSelectedStores(newSelectedStoreState);

      // Write them back into promotionData
      value.setPromotionData({
        ...value.promotionData,
        excludedLocationList: newExcludedStoreList,
        locationList: newLocationList,
      });
    }
  };
  // Function to open modal and set the type
  const handleItemModal = async (type) => {
    setModalType(type); // type should be "items" or "excluded"
    setItemModalVisible(true);
    await getItemDetails();
  };
  const handleStoreModal = async (type) => {
    setModalType(type); // type should be "items" or "excluded"
    setStoreModalVisible(true);
    await getStoreDetails();
  };
  const getItemDetails = async () => {
    try {
      const response = await axios({
        method: "get",
        url: ITEMS,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      let allItems = response.data.map((item) => item.itemId);
      value.setPromoTotalItemsArray(allItems);
      console.log("ITem details REsponse: ", response);
    } catch (error) {
      console.log("ITem details Error: ", error);
    }
  };
  const getStoreDetails = async () => {
    try {
      const response = await axios({
        method: "get",
        url: STORE_LIST,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      let storeList = response.data.map((item) => item.storeId);
      value.setPromoStoreListArray(storeList);
      console.log("Store details REsponse: ", response);
    } catch (error) {
      console.log("Store details Error: ", error);
    }
  };
  return (
    <Grid
      container
      component="main"
      style={{
        // height: "100vh",
        // backgroundColor: "#384B70",
        // height: "auto",
        // overflow: "visible",
        minHeight: "100vh",
        backgroundColor: "#384B70",
        // height: "auto",
        overflow: "auto",
      }}
    >
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
            <div className="dialog-container">
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

        <Card
          className="generalView"
          style={{
            
            width: "100%",
            backgroundColor: "#73809A",
            borderRadius: "1.6vw",
            borderColor: "#73809A",
            marginLeft: "3.5%",
            boxShadow: "2px 2px 8px rgba(66, 57, 57, 0.75)",
            marginTop: "3rem",
          }}
          ref={messagesEndRef}
        >
          {/* <Card ref={messagesEndRef}> */}
          <div
            style={{
              marginLeft: "2%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                fontFamily: "Montserrat,sans-sherif",
              }}
            >
              Promotions
            </Typography>
            <Typography
              style={{
                fontSize: "0.6rem",
                color: "white",
                fontFamily: "Montserrat,sans-sherif",
              }}
            >
              Fields marked as * are mandatory
            </Typography>
          </div>

          <Form className="generalRadio">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                // marginLeft: "0.9rem",
                // paddingLeft: "1.5rem",
              }}
            >
              <Typography
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "white",
                  fontFamily: "Montserrat,sans-sherif",
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
                  // marginLeft: "0.9rem",
                }}
              >
                <Form.Check
                  inline
                  label="Simple"
                  name="group1"
                  type={"radio"}
                  id={`inline- -1`}
                  className="radioText"
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
                  className="radioText"
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
                  className="radioText"
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
                  className="radioText"
                  // checked={value.promotionData.invoiceType === "Credit Note"}
                  checked={value.typeOfPromotion.giftWithPurchase}
                  onChange={() => handleRadioChange("giftWithPurchase")}
                />
              </div>
            </div>
          </Form>
          {/* </Card> */}
          {/* <Card ref={messagesEndRef}> */}
          <Box
            sx={{
              paddingLeft: "1.5rem",
            }}
          >
            <Stack
              direction="row"
              // spacing={3}
              // sx={{ display: { xs: "none", md: "flex" }, my: 1 }}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      fontFamily: "Montserrat,sans-sherif",
                      color: "white",
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

                  <div
                    className="promotion-detail-text"
                  >Hierarchy<span style={{ color: "red" }}>*</span></div>


                  <FormControl sx={{ flex: 1,alignSelf:'flex-end'  }}>
                    <span className="form-label-styled" style={{ color: 'white' }}>Type<span className="required">*</span>
                    </span>
                    <Select
                      multiple
                      value={initialHierarchyTypes}
                      placeholder="Select Hierarchy Type"
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" },
                      }}
                      renderValue={(selected) => {
                        console.log("All selected:", selected);
                        return selected.map((option) => {
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
                  <FormControl sx={{ flex: 1, position: "relative" }}>
                    {/* <InputFieldComponent  */}
                   <InputFieldComponent
                      label="Value"
                      required={true}
                      placeholder="Add Value here"
                      value={value.promotionData.hierarchyValue}
                      hierarchyType
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
                  sx={{
                    alignItems: "center",
                    width: "90%",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="promotion-detail-text"
                  >Item<span style={{ color: "red" }}>*</span></div>
                  <FormControl sx={{ flex: 1 }}>
                    <InputFieldComponent
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            marginTop: "1.5rem",
                          }}
                        >
                          <Visibility
                            style={{
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleItemModal("items")}
                            id="item"
                          ></Visibility>
                        </div>
                      }
                    />
                  </FormControl>
                  <FormControl
                    // sx={{ flex: 1, display: "flex", flexDirection: "row", alignItems:"center" }}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-end",
                      alignSelf: "flex-end"
                    }}
                  >
                    {!value.itemUpload.items && (
                      <Button
                        variant="outlined"
                        endIcon={
                          <FiUpload
                            style={{ fontSize: "1rem", color: "white" }}
                          />
                        }
                        style={{
                          fontFamily: "Monsterrat,sans-serif",
                          width: "50%",
                          color: "white",
                          borderColor: "white",
                          // fontSize: "0.8rem",
                          position: "relative", // Make the button the container for the file input
                          overflow: "hidden",
                          cursor: "pointer",
                          // margin: "0.1rem",
                          borderColor: "white"
                        }}
                      >
                        Upload
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          className="upload-input"
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
                      className="upload-btn-info"
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
                  <div
                    className="promotion-detail-text"
                  >
                    Exclusions
                  </div>

                  <FormControl sx={{ flex: 1 }} >
                    <InputFieldComponent
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            marginTop: "1.5rem",
                          }}
                        >
                          <Visibility
                            style={{
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleItemModal("items")}
                            id="item"
                          ></Visibility>
                        </div>
                      }
                    />
                  </FormControl>
                  <FormControl
                    sx={{ flex: 1, display: "flex", flexDirection: "row",alignSelf: "flex-end" }}
                  >
                    {!value.itemUpload.excludedItems && (
                      <Button
                        variant="outlined"
                        endIcon={
                          <FiUpload
                            style={{ fontSize: "1rem", color: "white" }}
                          />
                        }
                        style={{
                          fontFamily: "Monsterrat,sans-serif",
                          width: "50%",
                          color: "white",
                          borderColor: "white",
                          // fontSize: "0.8rem",
                          position: "relative", // Make the button the container for the file input
                          overflow: "hidden",
                          cursor: "pointer",
                          // margin: "0.1rem",
                          borderColor: "white"
                        }}
                      >
                        Upload
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          className="upload-input"
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
                            value.itemUpload.eventExcludedItems.target
                              .files[0]
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
                    <div
                      className="upload-btn-info"
                    >
                      Only Excel files allowed
                    </div>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
            {/* </Card> */}
          </Box>
          {/* <Card ref={messagesEndRef}> */}
          <div ref={messagesEndRef} style={{ marginLeft: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography
                                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      fontFamily: "Montserrat,sans-sherif",
                      color: "white",
                    }}
              >
                Discount Details
              </Typography>
              <IconButton aria-label="exp" onClick={handleTableExpand} style={{color: "white",backgroundColor:'#ffffff14'}}>
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
                    <div
                    className="promotion-detail-text"
                  > Discount<span style={{ color: "red" }}>*</span></div>
                    <FormControl sx={{ flex: 1,alignSelf:'flex-end'   }}>
                      {/* <Form.Label
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
                      </Form.Label> */}
                      <span className="form-label-styled" style={{ color: 'white' }}>Discount Type<span className="required">*</span>
                      </span>
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
                      <InputFieldComponent
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
                    <div
                    className="promotion-detail-text"
                  >Date<span style={{ color: "red" }}>*</span></div>
                    <FormControl sx={{ flex: 1 }}>
                      <InputFieldComponent
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
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <InputFieldComponent
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
                    <div
                    className="promotion-detail-text"
                  >Location<span style={{ color: "red" }}>*</span></div>
                    <FormControl sx={{ flex: 1}}>
                      <InputFieldComponent
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                              marginTop: "1.5rem",
                            }}
                          >
                            <Visibility
                              style={{
                                backgroundColor: "white",
                                cursor: "pointer",
                              }}
                              onClick={() => handleStoreModal("stores")}
                              id="stores"
                            ></Visibility></div>
                        }
                      />
                    </FormControl>
                    <FormControl
                      sx={{ flex: 1, display: "flex", flexDirection: "row",alignSelf: "flex-end" }}
                    >
                      {!value.storeUpload.stores && (
                        // <CustomButton className="upload-btn"                        >

                        <Button
                          variant="outlined"
                          endIcon={<FiUpload style={{ fontSize: "1rem" }} />}
                        style={{
                          fontFamily: "Monsterrat,sans-serif",
                          width: "50%",
                          color: "white",
                          borderColor: "white",
                          // fontSize: "0.8rem",
                          position: "relative", // Make the button the container for the file input
                          overflow: "hidden",
                          cursor: "pointer",
                          // margin: "0.1rem",
                          borderColor: "white"
                        }}
                        >
                          Upload
                          <input
                            type="file"
                            className="upload-input"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={(e) =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                stores: true,
                                eventStores: e,
                              })
                            }
                            onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                          />
                        </Button>
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
                      <div className="upload-btn-info"
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
                    <div
                    className="promotion-detail-text"
                  >Exclusions<span style={{ color: "red" }}>*</span></div>
                    <FormControl sx={{ flex: 1 }}>
                      <InputFieldComponent
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                              marginTop: "1.5rem",
                            }}
                          >
                            <Visibility
                              style={{
                                backgroundColor: "white",
                                cursor: "pointer",
                              }}
                              onClick={() => handleStoreModal("storesExcluded")}
                              id="storesExcluded"
                            ></Visibility></div>
                        }
                        style={{}}
                      />
                    </FormControl>
                    <FormControl
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        alignSelf: "flex-end"
                      }}
                    >
                      {!value.storeUpload.excludedStores && (
                        // <CustomButton className="upload-btn"
                        // >
                        <Button
                          variant="outlined"
                          endIcon={<FiUpload style={{ fontSize: "1rem", color: "white" }}
                          />}
                          style={{
                            fontFamily: "Monsterrat,sans-serif",
                            width: "50%",
                            color: "white",
                            borderColor: "white",
                            // fontSize: "0.8rem",
                            position: "relative", // Make the button the container for the file input
                            overflow: "hidden",
                            cursor: "pointer",
                            // margin: "0.1rem",
                            borderColor: "white"
                          }}
                        >
                          Upload
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            className="upload-input"
                            onChange={(e) =>
                              value.setStoreUpload({
                                ...value.storeUpload,
                                excludedStores: true,
                                eventExcludedStores: e,
                              })
                            }
                            onClick={(event) => (event.target.value = "")} // To allow uploading the same file again
                          />
                        </Button>
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
                      <div
                        className="upload-btn-info"
                      >
                        Only Excel files allowed
                      </div>
                    </FormControl>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </div>
          {/* </Card> */}
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "#e5e5e5" }}
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "0.75rem",
            }}
          >
            <CardActions
              sx={{
                justifyContent: "center",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              <CustomButton
                onClick={() => value.setFormSave((prevState) => !prevState)}
              >
                <SaveIcon style={{ color: "2E333E" }}></SaveIcon>
                SAVE
              </CustomButton>

              <CustomButton onClick={() => setPromoPreview(true)}>
                <PreviewIcon style={{ color: "2E333E" }}></PreviewIcon>
                PREVIEW
              </CustomButton>

              <CustomButton
                onClick={() => value.setFormSubmit((prevState) => !prevState)}
              >
                <PublishIcon style={{ color: "2E333E" }}></PublishIcon>
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
        // className="grid1"
        style={{
          marginTop: "7.25vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <Card
      className="generalView"
      style={{ width: "100%" }}
      ref={messagesEndRef}
    > */}
        {/* <LLMChatbotTest /> */}
        <LLMChatbotTestAgentic />
      </Grid>
    </Grid>
  );
}

