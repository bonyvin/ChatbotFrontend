import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import SignInSide from "../Pages/Login/Login";

import {
    Route,
    Routes
} from "react-router-dom";
import Header from "../components/Header";
import InvoiceDetailsSide from "../Pages/Invoice/InvoiceDetailsSide";
import PoDetailsSide from "../Pages/PO/PoDetailsSide";
import PromoDetailsSide from "../Pages/Promotion/PromoDetailsSide";
import ItemDetailsSide from "../Pages/ItemCreation/ItemDetailsSide";


const AppRouter = () => {
    return (
    <>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/invoice" element={<InvoiceDetailsSide/>} />
        {/* <Route path="/chat" element={<InvoiceChatbot />} /> */}
        <Route path="/purchaseOrder" element={<PoDetailsSide/>} />
        {/* <Route path="/poNew" element={<PoDetailsSideNew/>} /> */}
        <Route path="/promotion" element={<PromoDetailsSide/>}/>
        <Route path="/itemCreation" element ={<ItemDetailsSide/>}/>
        {/* <Route path="/llmtest" element={<LLMDetailsSide/>}/>
        <Route path="/wsllm" element={<WebSocketTest/>}/>
        <Route path="/agentic" element={<LLMChatbotTestAgentic/>}/>
        <Route path="/testApp" element={<OracleTest/>}/> */}
        {/* <Route path="/llmtest" element={<LLMChatbotTest/>}/> */}

      </Routes>
    </>
  );
};
export default AppRouter;
