import Card from "@mui/joy/Card";
import Typography from "@mui/material/Typography";
// import "../../styles/general.css";
import "../styles/general.css";
import symbolBlue from "../images/symbol-blue.png";
const IntroductionCard = () => {
  return (
    <Card
      className="generalView"
      sx={{
        width: "100%",
        backgroundColor: "var(--white)",
        borderRadius: "var(--radius-lg)",
        borderColor: "var(--muted-blue)",
        marginLeft: { xs: 0, md: "1rem" },
        boxShadow: "var(--shadow-medium)",
        marginTop: "3rem",
        padding: "3rem",
      }}
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
          Welcome to ExperienceX !
        </Typography>
        <Typography
          style={{
            fontSize: "1rem",
            fontWeight: "500",
            color: "#00338D",
            textAlign: "left",
          }}
        >
          Need help with purchase orders, promotions, invoices, payments, ASNs
          or more? I've got you covered - happy to assist!
        </Typography>
      </div>
    </Card>
  );
};
export default IntroductionCard;
