import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

import { RiMenuFold3Line, RiMenuFold4Line } from "react-icons/ri";
import { MdPeople } from "react-icons/md";
import { PiUserListFill } from "react-icons/pi";
import { HiOutlineUpload } from "react-icons/hi";
import { MdHome } from "react-icons/md";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userType = localStorage.getItem("userType");

  const menuItems = [
    {
      title: "Sales Agent List",
      icon: <MdHome />,
      path: "/home",
      userType: ["static"],
    },
    {
      title: "Sales Agent Dashboard",
      icon: <PiUserListFill />,
      path: "/dashboard",
      userType: ["static", "employee"],
    },
  ];



  const visibleMenuItems = menuItems.filter((item) =>
    item.userType.includes(userType)
  );

  return (
    <div
      className={`min-h-screen bg-white shadow-lg overflow-hidden transition-all duration-300 shrink-0
      ${collapsed ? "w-[80px]" : "w-[260px]"}`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <img src={logo} alt="logo" className="w-36 object-contain" />
        )}

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-gray-700 hover:text-blue-600 transition "
        >
          {collapsed ? (
            <RiMenuFold4Line className="size-6" />
          ) : (
            <RiMenuFold3Line className="size-6 " />
          )}
        </button>
      </div>

      {/* MENU */}
      <ul className="space-y-2 p-3">
        {visibleMenuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300
              
              ${location.pathname === item.path
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
              }

              ${collapsed ? "justify-center" : ""}
            `}
          >
            <span className="text-xl">{item.icon}</span>

            {!collapsed && (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
