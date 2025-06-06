import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import SignInSide from "../Pages/Login/Login";

import {
    Route,
    Routes
} from "react-router-dom";
import Header from "../components/Header";
import LLMChatbotTest from "../components/LLMTest/LLMChatbotTest";
import InvoiceChatbot from "../Pages/Invoice/InvoiceChatbot";
import InvoiceDetailsSide from "../Pages/Invoice/InvoiceDetailsSide";
import PoDetailsSide from "../Pages/PO/PoDetailsSide";
import PromoDetailsSide from "../Pages/Promotion/PromoDetailsSide";
import ItemCreationDetailsSide from "../Pages/ItemCreation/ItemCreationDetailsSide";


const AppRouter = () => {
    return (
    <>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/invoiceChatbot" element={<InvoiceDetailsSide />} />
        <Route path="/chat" element={<InvoiceChatbot />} />
        <Route path="/poChatbot" element={<PoDetailsSide/>} />
        <Route path="/promoChatbot" element={<PromoDetailsSide/>}/>
        <Route path="/itemChatbot" element ={<ItemCreationDetailsSide/>}/>
        <Route path="/llmtest" element={<LLMChatbotTest/>}/>

      </Routes>
    </>
  );
};
export default AppRouter;
