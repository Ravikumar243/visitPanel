import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import user from "../assets/user.jpg";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";

const Header = ({ onToggle }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userEmail");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    const userType = localStorage.getItem("userType");

    setMenuOpen(false);
    setShowLogout(false);

    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");

    if (userType === "employee") {
      localStorage.removeItem("employeeId");
      localStorage.removeItem("userType");

      navigate("/employee-login", { replace: true });
    } else {
      localStorage.removeItem("AgentId");
      localStorage.removeItem("userType");

      navigate("/", { replace: true });
    }
  };

  return (
    <header className="relative bg-gray-50 shadow-md pb-3 mb-4 rounded-lg">
      <div className="flex justify-between items-center px-4 py-3">
        <p className="text-2xl"></p>

        {/* User Menu */}
        <div className="block">
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setShowLogout(false);
            }}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={user}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-300"
            />
            {/* <span className="text-gray-700 font-medium block">Admin</span> */}
          </button>

          {/* Dropdown */}
        </div>
      </div>
      {menuOpen && (
        <div className="z-50 absolute right-4 mt-1 w-66 bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="bg-gray-400 text-white rounded-t-md flex gap-2 items-center">
            <div className="my-4 mx-2">
              <img src={user} width={50} className=" rounded-full" />
            </div>
            <div className="my-4 mx-2">
              <h2 className="font-bold ">Admin</h2>
              <p className="flex items-center gap-0.5"> <MdEmail />{userName}</p>
            </div>
          </div>
          {/* <p>{userName}</p> */}
          <button
            onClick={() => setShowLogout((prev) => !prev)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaUser className="mr-2 size-8 bg-gray-300 rounded-full p-1 text-white  " /><p className="font-bold "> Profile</p>
          </button>
          {showLogout && (
            <button
              onClick={handleLogout}
              className="ml-14 mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <FiLogOut className="size-4" />
              Logout
            </button>
          )}
        </div>

      )}
    </header>
  );
};

export default Header;
