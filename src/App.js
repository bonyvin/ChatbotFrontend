import logo from "./logo.svg";
import "./App.css";
import Test from "./components/Test";
import SignInSide from "./Pages/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import Chatbot from "./components/Chatbot";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
 import MyProfile from "./components/FormTest";
import MessageIn from "./components/MessageIn";
import DetailsSide from "./components/DetailsSide";
import DetailsTest from "./components/DetailTest";
import Chatb from "./components/Chatb";
import CollapsibleTable from "./components/Table";
import ChatbotPane from "./components/ChatbotPane";
import AuthProvider from "./context/ContextsMasterFile";
import PopUp from "./components/PopupMessage/FormSubmissionStatusPopUp";
import BasicDocument from "./components/BasicDocument";
import InvoiceTemplate from "./components/InvoiceTemplate";
import PoDetailsSide from "./components/PoDetailsSide";
import PurchaseOrder from "./components/PDF Generation/PurchaseOrder";
import PromoDetailsSide from "./components/PromoDetailsSide";
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
        <Route path="/chatbot" element={<DetailsSide />} />
        <Route path="/c" element={<ChatbotPane />} />
        <Route path="/poChatbot" element={<PoDetailsSide/>} />
        <Route path="/promoChatbot" element={<PromoDetailsSide/>}/>
        <Route path="/llmtest" element={<LLMChatbotTest/>}/>

      </Routes>
    </>
  );
};
export default App;
