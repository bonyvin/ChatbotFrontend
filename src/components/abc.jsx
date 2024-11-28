import React, {useState} from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import landingStyles from "..//Styles/LandingPage.css";
import { Button } from "react-bootstrap";

function LandingPage() {
  const [showSideMenu,setShowSideMenu]=useState(false)
  const handleSideMenu=()=>{
    setShowSideMenu(!showSideMenu)
  }
  return (
    <div style={{ backgroundColor: "#f3f4f8",height:'100vh' }}>
      <Navbar
        collapseOnSelect
        expand="lg"
        style={{
          backgroundColor: "#bdd646",
          height: "4.5rem ",
          marginBottom: 0,
        }}
      >
        {/* <Container> */}
        <Nav>
          {/* <Nav.Link href="#deets">More deets</Nav.Link> */}
          <img
            class="mx-image mx-name-staticImage2 spacing-outer-bottom img-responsive imgStyle"
            src=""
            role="presentation"
            style={{ padding: 10, height: 70 }}
          />
        </Nav>
        <Navbar.Brand
          href="#home"
          style={{ fontWeight: "bold", alignItems: "center", display: "flex" }}
        >
          KIRLOSKAR BROTHERS LIMITED
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#pricing">Pricing</Nav.Link>
              <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown> */}
          </Nav>
          <Nav>
            <Nav.Link
              style={{
                display: "flex",
                alignItems: "center",
                color: "black",
                paddingRight: "1.5rem",
              }}
            >
              {/* <NotificationsIcon /> */}
              <span
                class="glyphicon glyphicon-bell"
                style={{ fontSize: "1.9rem" }}
              ></span>
            </Nav.Link>
            <Nav.Link
              style={{
                display: "flex",
                alignItems: "center",
                color: "black",
                paddingRight: "1.5rem",
              }}
            >
              <LogoutIcon style={{ fontSize: "1.9rem" }} />
            </Nav.Link>
            <Nav.Link href="#deets" style={{ textAlign: "right" }}>
              <div
                style={{ fontWeight: "700", fontSize: "1rem", color: "black" }}
              >
                CDM ADMIN
              </div>
              <div style={{ fontSize: "0.7rem", color: "black" }}>
                CDM ADMIN
              </div>
            </Nav.Link>
            <Nav.Link
              eventKey={2}
              href="#memes"
              style={{
                display: "flex",
                alignItems: "center",
                color: "black",
                paddingRight: "2.5rem",
              }}
            >
              <AccountCircleIcon style={{ fontSize: "3rem" }} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {/* </Container> */}
      </Navbar>

      <Nav
        defaultActiveKey="/home"
        className="flex-column sideMenu"
       >
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-1">
            <a
              class="mx-name-navigationTree3-0"
              href=""
              role="menuitem"
              title="Dashboard"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Dashboard":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
       
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-2">
            <a
              class="mx-name-navigationTree3-3"
              href=""
              role="menuitem"
              title="Captains"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Captains":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-3">
            <a
              class="mx-name-navigationTree3-4"
              href=""
              role="menuitem"
              title="News &amp; Announcements"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"News &amp; Announcements":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-4">
            <a
              class="mx-name-navigationTree3-5"
              href="https://captainappdev.kbl.co.in/portal/#"
              role="menuitem"
              title="Scheme Announcements"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Scheme Announcements":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-5">
            <a
              class="mx-name-navigationTree3-7"
              href=""
              role="menuitem"
              title="User Account"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"User Account":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-6">
            <a
              class="mx-name-navigationTree3-11"
              href=""
              role="menuitem"
              title="Notifications"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Notifications":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-7">
            <a
              class="mx-name-navigationTree3-16"
              href=""
              role="menuitem"
              title="Schemes"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Schemes":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link href="/home" eventKey="link-8">
            {" "}
            <a
              class="mx-name-navigationTree3-18"
              href=""
              role="menuitem"
              title="Booster"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Booster":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-9">
            <a
              class="mx-name-navigationTree3-19"
              href=""
              role="menuitem"
              title="Welcome Points"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Welcome Points":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-11">

            <a
              class="mx-name-navigationTree3-24"
              href=""
              role="menuitem"
              title="Payment Logs"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Payment Logs":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-12">
            <a
              class="mx-name-navigationTree3-28"
              href=""
              role="menuitem"
              title="FAQs"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"FAQs":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-13">
            <a
              class="mx-name-navigationTree3-29"
              href=""
              role="menuitem"
              title="Contact Us"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Contact Us":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item class="navItem" role="none">
          <Nav.Link eventKey="link-13">
            <a
              class="mx-name-navigationTree3-31"
              href=""
              role="menuitem"
              title="Digi KYC"
            >
              <img
                class="imgStyle"
                src=""
                alt=""
              />{showSideMenu?"Digi KYC":""}
             
            </a>
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Button onClick={handleSideMenu}></Button>
    </div>
  );
}

export default LandingPage;
