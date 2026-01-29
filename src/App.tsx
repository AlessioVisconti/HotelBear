import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DynamicNavbar from "./components/DynamicNavbar";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <DynamicNavbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        {/* <Route path="/crm" element={<CrmHome />} />
      <Route path="*" element={<Navigate to="/login" replace />} />  */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
