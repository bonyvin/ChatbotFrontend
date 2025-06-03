import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";
import Header from "./components/Header";
import AuthProvider from "./context/ContextsMasterFile";
import AppRouter from "./Router/AppRouter";

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
      <AppRouter />
    </>
  );
};
export default App;
