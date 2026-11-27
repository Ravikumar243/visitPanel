import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { FiSearch } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import DataTable from "react-data-table-component";
import {GrValidate } from "react-icons/gr"

const Createpage = () => {
  const [tableData, setTableData] = useState([]);
  const [search, setSearch] = useState("");

  const dateFormat = (date) => {
    return dayjs(date).format("DD MMM YYYY hh:mm A");
  };

  const getuserData = async () => {
    try {
      const res = await axios.get(
        "https://baggageuatapi.acrossassist.in/api/BaggageService/GetVendors",
      );

      const data = res.data;

      if (data.status === true) {
        setTableData(data.data);
      }
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text: "Failed to fetch vendors",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    getuserData();
  }, []);

  const filteredData = tableData.filter((item) => {
    return (
      item.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorContact?.includes(search)
    );
  });

  const cards = [
    {
      title: "Total Vendors",
      value: tableData.length,
      bg: "from-blue-500 to-blue-600",
    },

    {
      title: "Active Vendors",
      value: 85,
      bg: "from-green-500 to-green-600",
    },

    {
      title: "Pending Approval",
      value: 14,
      bg: "from-orange-500 to-yellow-500",
    },

    {
      title: "Locations",
      value: 25,
      bg: "from-pink-500 to-rose-500",
    },
  ];

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (
        <div className="font-semibold text-gray-600">{index + 1}</div>
      ),
      width: "90px",
      center: true,
    },

    {
      name: "Vendor Name",
      cell: (row) => (
        <div className="py-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <FaUserTie />
            </div>

            <div>
              <p className="font-semibold text-gray-800">{row.vendorName}</p>

              {/* <p className="text-xs text-gray-500">ID : {row.vendorId}</p> */}
            </div>
          </div>
        </div>
      ),
      width: "260px",
    },
      {
      name: "Vendor Email",
      cell: (row) => (
        <div className="py-3">
        

              <p className="text-md text-gray-500"> {row.vendorEmail}</p>
        </div>
      ),
      width: "260px",
    },

    {
      name: "Contact",
      cell: (row) => (
        <div className="py-3">
          <p className="font-medium text-gray-700">{row.vendorContact}</p>

          {/* <p className="text-xs text-gray-500 break-all">{row.vendorEmail}</p> */}
        </div>
      ),
      width: "280px",
      wrap: true,
    },

    {
      name: "Location",
      cell: (row) => (
        <div className="flex items-center gap-2 text-gray-700">
          <MdLocationOn className="text-red-500 text-lg" />

          <span>{row.vendorsLocation || "-"}</span>
        </div>
      ),
      width: "250px",
      wrap: true,
    },

    {
      name: "Status",
      cell: () => (
        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold flex justify-center items-center gap-1 ">
          <GrValidate /> Active
        </span>
      ),
      width: "150px",
      center: true,
    },

    {
      name: "Created",
      cell: () => (
        <div className="text-sm text-gray-600">{dateFormat(new Date())}</div>
      ),
      width: "180px",
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
      },
    },

    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#111827",
        fontWeight: "700",
        fontSize: "14px",
        paddingTop: "16px",
        paddingBottom: "16px",
      },
    },

    rows: {
      style: {
        minHeight: "80px",
        borderBottom: "1px solid #f1f5f9",
        fontSize: "14px",
      },

      highlightOnHoverStyle: {
        backgroundColor: "#f9fafb",
        transitionDuration: "0.2s",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendor Details</h1>

        <p className="text-gray-500 mt-1">
          Welcome to Baggage Service Vendor Panel
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 ">
          <div></div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="px-4">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            highlightOnHover
            striped
            responsive
            persistTableHead
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default Createpage;
