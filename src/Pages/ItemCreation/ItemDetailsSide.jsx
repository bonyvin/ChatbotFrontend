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
  ToggleButtonGroup,
} from "@mui/joy";

// Bootstrap components
import { Form } from "react-bootstrap";

// React PDF

// Context

// Custom Components
import { DynamicCutoutInput } from "../../components/DynamicCutoutInput";
import InputFieldComponent from "../../components/InputFieldComponent";
import ItemInfoPopup from "../../components/PopupMessage/ItemInfoPopup";
import PopUp from "../../components/PopupMessage/FormSubmissionStatusPopUp";
import PromoChatbotPane from "../Promotion/PromoChatbotPane.jsx";
import SupplierInfoPopUp from "../../components/PopupMessage/SupplierInfoPopUp";

// React Icons
import { FiUpload } from "react-icons/fi";
import PreviewIcon from "@mui/icons-material/Preview";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";

// PDF Viewer
import { PDFViewer } from "@react-pdf/renderer";
import PreviewDocs from "../../components/PDF Generation/PreviewDocs";
import { AuthContext } from "../../context/ContextsMasterFile";
import CustomButton from "../../components/CustomButton/CustomButton.js";
import { ITEMS, STORE_LIST } from "../../const/ApiConst.js";
import axios from "axios";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InfoIcon from "@mui/icons-material/Info";
import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import JoyButton from "@mui/joy/Button";
// import IconButton from '@mui/joy/IconButton';

function ItemDetailsSide() {
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

  //ITEM Dropdowns intitiations-convert it to enum file later
  const itemTypeOptions = ["Type1", "Type2", "Type3"];
  const itemDepartmentOptions = ["Department1", "Department2", "Department3"];
  const itemClassOptions = ["Class1", "Class2", "Class3"];
  const itemSubClassOptions = ["SubClass1", "SubClass2", "SubClass3"];
  const itemLevelOptions = ["Level1", "Level2", "Level3"];
  const unitOfMeasurementOptions = ["gram", "kilogram", "lbs"];
  const itemTiles = [
    "Item Information",
    "Item Attributes",
    "Media",
    "Availability",
    "Pricing",
    "Packaging",
    "Additional Suppliers",
    "Generate Bar Code",
    "Order Attribute",
    "Others",
  ];
  const showForm = value.isActive;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [tableToggle]);

  const handleRadioChange = (type) => {
    value.setTypeOfPromotion({
      simple: type === "simple",
      buyXGetY: type === "buyXGetY",
      threshold: type === "threshold",
      giftWithPurchase: type === "giftWithPurchase",
    });
    value.setPromotionData({ ...value.promotionData, promotionType: type });
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

  const handleChangeItemType = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      itemType: newValue,
    });
  };
  const handleChangeItemDepartment = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      itemDepartment: newValue,
    });
  };

  const handleChangeItemClass = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      itemClass: newValue,
    });
  };
  const handleChangeItemSubClass = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      itemSubClass: newValue,
    });
  };
  const handleChangeItemLevel = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      itemLevel: newValue,
    });
  };
  const handleChangeUnitOfMeasurement = (event, newValue) => {
    value.setItemCreationData({
      ...value.itemCreationData,
      unitOfMeasurement: newValue,
    });
  };
  const [tabValue, setTabValue] = useState(0);
  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
  };
  const [alignment, setAlignment] = useState("default");

  const handleChangeItemTile = (event, newAlignment) => {
    setAlignment(newAlignment);
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
{/* 
          <Tabs
            value={value}
            onChange={handleChangeTabs}
            aria-label="icon position tabs example"
            className="tab-bar"
          >
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
            <Tab
              icon={<InfoIcon />}
              iconPosition="start"
              label="start"
              className="tab-start"
            />
          </Tabs> */}
          {/* <div style={{ marginRight: "1rem", display: "flex" }}>
            {itemTiles.map((type, idx) => (
              <button
                key={type}
                onClick={(e) => handleChangeItemTile(e, type)}
                className={
                  alignment === type
                    ? `toggle-button-selected${
                        idx === 0 ? "-start" : idx === 2 ? "-end" : ""
                      }`
                    : `toggle-button${
                        idx === 0 ? "-start" : idx === 2 ? "-end" : ""
                      }`
                }
              >
                {idx + 1}
              </button>
            ))}
          </div> */}
          <div
            style={{ marginRight: "1rem", display: "flex", flexWrap: "wrap" }}
          >
            {itemTiles.map((type, idx) => (
              <button
                key={type}
                onClick={(e) => handleChangeItemTile(e, type)}
                className={
                  alignment === type
                    ? `toggle-button-selected${
                        idx === 0
                          ? "-start"
                          : idx === itemTiles.length - 1
                          ? "-end"
                          : ""
                      }`
                    : `toggle-button${
                        idx === 0
                          ? "-start"
                          : idx === itemTiles.length - 1
                          ? "-end"
                          : ""
                      }`
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                }}
              >
                <InfoIcon style={{ marginRight: "0.5rem" }} />
                {type}
              </button>
            ))}
          </div>
          {/* <Card ref={messagesEndRef}> */}
          <Box
            sx={{
              paddingLeft: "1.5rem",
            }}
          >
            <Stack direction="row" sx={{ display: { xs: "none", md: "flex" } }}>
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
                  <div className="promotion-detail-text">
                    {"Item"}
                    <span style={{ color: "red" }}>*</span>
                  </div>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Item Type<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value?.itemCreationData?.itemType}
                      placeholder="Select Item Type"
                      onChange={handleChangeItemType}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {itemTypeOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Item Department<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value.itemCreationData.itemDepartment}
                      placeholder="Select Item Department"
                      onChange={handleChangeItemDepartment}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {itemDepartmentOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack
                  direction="row"
                  spacing={12}
                  sx={{ alignItems: "center", width: "90%" }}
                >
                  <div className="promotion-detail-text">
                    {"Item"}
                    <span style={{ color: "red" }}>*</span>
                  </div>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Item Class<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value?.itemCreationData?.itemClass}
                      placeholder="Select Item Class"
                      onChange={handleChangeItemClass}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {itemClassOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Item SubClass<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value.itemCreationData.itemSubClass}
                      placeholder="Select Item SubClass"
                      onChange={handleChangeItemSubClass}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {itemSubClassOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack
                  direction="row"
                  spacing={12}
                  sx={{ alignItems: "center", width: "90%" }}
                >
                  <div className="promotion-detail-text">
                    {"Item"}
                    <span style={{ color: "red" }}>*</span>
                  </div>{" "}
                  <FormControl sx={{ flex: 1 }}>
                    <InputFieldComponent
                      label="Supplier Id"
                      required={true}
                      placeholder="Add Supplier Id here"
                      value={value.itemCreationData.supplierId}
                      fun={(text) =>
                        value.setItemCreationData({
                          ...value.itemCreationData,
                          supplierId: text,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <InputFieldComponent
                      label="Unit Cost"
                      required={true}
                      placeholder="Add Amount here"
                      value={value.itemCreationData.unitCost}
                      fun={(text) =>
                        value.setItemCreationData({
                          ...value.itemCreationData,
                          unitCost: text,
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
                  <div className="promotion-detail-text">
                    {"Item"}
                    <span style={{ color: "red" }}>*</span>
                  </div>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Item Level<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value?.itemCreationData?.itemLevel}
                      placeholder="Select Item Level"
                      onChange={handleChangeItemLevel}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {itemLevelOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1, alignSelf: "flex-end" }}>
                    <span
                      className="form-label-styled"
                      style={{ color: "white" }}
                    >
                      Unit of Measurement<span className="required">*</span>
                    </span>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value.itemCreationData.unitOfMeasurement}
                      placeholder="Select Unit of Measurement"
                      onChange={handleChangeUnitOfMeasurement}
                      sx={{
                        zIndex: 1,
                        "& .MuiSelect-button": { color: "#212529" }, // Ensures black color for placeholder
                      }}
                    >
                      {unitOfMeasurementOptions.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
            {/* </Card> */}
          </Box>
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
        <PromoChatbotPane />
      </Grid>
    </Grid>
  );
}

export default ItemDetailsSide;
