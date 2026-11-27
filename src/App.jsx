import { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

import Login from "./Pages/Login";
import Cretatepage from "./components/cretatepage/Cretatepage";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/home/Home";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SalesAgentList from "./Pages/SalesDashbaord/SaelsAgentList";
import SalesVisitCompliance from "./Pages/SalesDashbaord/SalesVisitCompliance";
import SalesAgentLocationData from "./Pages/SalesDashbaord/SalesAgentLocationData";
import SalesAgentLogin from "./Pages/SalesDashbaord/SalesAgentLogin";
import EmployeeLogin from "./Pages/Employee/EmployeeLogin";

const Layout = ({ collapsed, setCollapsed }) => (
  <div className="flex ">
    <Sidebar
      className={!collapsed ? "w-[20%] " : "w-[5%]"}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />

    <main
      className={
        !collapsed ? "flex-grow px-4  w-[70%] " : "flex-grow p-4 w-[70%]"
      }
    >
      <Header onToggle={() => setCollapsed(!collapsed)} />
      <Outlet />
    </main>
  </div>
);

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/"
        element={<Layout collapsed={collapsed} setCollapsed={setCollapsed} />}
      >
        <Route path="home" element={<SalesAgentList />} />
        <Route path="/dashboard" element={<SalesVisitCompliance />} />
      </Route>
        <Route path="/sales-visit-location-data" element={<SalesAgentLocationData/>}/>
        <Route path="/sales-agent-login" element={<SalesAgentLogin/>}/>
        <Route path="/employee-login" element={<EmployeeLogin/>}/>
    </Routes>
  );
}

export default App;
