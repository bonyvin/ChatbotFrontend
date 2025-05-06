import logo from "./logo.svg";
import "./App.css";
// import Test from "./components/Test";
import SignInSide from "./Pages/Login/Login";
import "bootstrap/dist/css/bootstrap.min.css";
// import Chatbot from "./components/Chatbot";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
//  import MyProfile from "./components/FormTest";
// import MessageIn from "./components/MessageIn";
// import DetailsSide from "./components/DetailsSide";
// import Chatb from "./components/Chatb";
// import CollapsibleTable from "./components/Table";
import InvoiceChatbot from "./Pages/Invoice/InvoiceChatbot";
import AuthProvider from "./context/ContextsMasterFile";
// import PopUp from "./components/PopupMessage/FormSubmissionStatusPopUp";
// import BasicDocument from "./components/BasicDocument";
// import InvoiceTemplate from "./components/InvoiceTemplate";
import PurchaseOrder from "./components/PDF Generation/PurchaseOrder";
import InvoiceDetailsSide from "./Pages/Invoice/InvoiceDetailsSide"
import PromoDetailsSide from "./Pages/Promotion/PromoDetailsSide";
import PoDetailsSide from "./Pages/PO/PoDetailsSide";
import Promotion from "./components/PDF Generation/Promotion";
import LLMChatbotTest from "./components/LLMTest/LLMChatbotTest";

// export default App;
const App = () => {
  return (
    <AuthProvider>
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
    </AuthProvider>
  );
};
const AppContent = () => {
  const { pathname } = useLocation();
  const showHeader = pathname !== "/" && pathname !== "/basic" && pathname !== "/invform";
    return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/invoiceChatbot" element={<InvoiceDetailsSide />} />
        <Route path="/chat" element={<InvoiceChatbot />} />
        <Route path="/poChatbot" element={<PoDetailsSide/>} />
        <Route path="/promoChatbot" element={<PromoDetailsSide/>}/>
        <Route path="/llmtest" element={<LLMChatbotTest/>}/>

      </Routes>
    </>
  );
};
export default App;
