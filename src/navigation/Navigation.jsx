import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Test from "../components/Test";
import Header from "../components/Header";

function Navigation() {
  return (
    <div className="App">

      <Router>
        {/* <Header></Header> */}
        {/* <div className="container"> */}
        
        <Routes>
            <Route path="/Testing" element={<Test/>} />
        </Routes>

      </Router>
    </div>
  )
}

export default Navigation