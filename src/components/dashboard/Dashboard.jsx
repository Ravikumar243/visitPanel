import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { FaDownload } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import ServiceCompletionReceipt from "../ServiceCompletionReceipt";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tableData, setTableData] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // MIS STATES
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const pdfRef = useRef();

  const dateFormat = (date) => {
    return dayjs(date).format("DD MMM YYYY hh:mm A");
  };

  const handleDownloadPdf = async (row) => {
    try {
      // STORE DATA
      setPdfCode(row);

      // WAIT FOR COMPONENT RENDER
      setTimeout(async () => {
        const input = pdfRef.current;

        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save(`Service_Receipt_${row.customerName}.pdf`);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= GET DATA =================
  const getuserData = async () => {
    try {
      const res = await axios.get(
        "https://cyberprotectionapi.acrossassist.in/api/GlobalCyberProtection/GetCustomers",
      );

      const data = res.data;

      if (data.status === true) {
        setTableData(data.data);
      }
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text: "Failed to fetch data",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    getuserData();
  }, []);

  // ================= DOWNLOAD MIS =================
  const handleDownloadMIS = async () => {
    try {
      if (!startDate || !endDate) {
        Swal.fire({
          title: "Required",
          text: "Please select start date and end date",
          icon: "warning",
        });

        return;
      }

      setDownloadLoading(true);

      const response = await axios.get(
        `https://baggageuatapi.acrossassist.in/api/BaggageService/DownloadMIS?startDate=${startDate}&endDate=${endDate}`,
        {
          responseType: "blob",
        },
      );

      console.log("response", response);

      // Blob data from axios
      const blob = new Blob([response.data], {
        type: response.data.type,
      });

      // Get filename from headers
      const contentDisposition = response.headers["content-disposition"];

      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `MIS_${dayjs().format("YYYY-MM-DD")}.xlsx`;

      saveAs(blob, filename);

      Swal.fire({
        title: "Success",
        text: "MIS Downloaded Successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text: "Failed to download MIS",
        icon: "error",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  
  const filteredData = tableData.filter((item) => {
    return (
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.emailId?.toLowerCase().includes(search.toLowerCase()) ||
      item.mobileNumber?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const genratePDF = async (vall) => {
    setPdfcode(vall);
  };

  const sendEmail = async (val) => {
    console.log("sendEmail", val);
    
    try {
      const response = await axios.post(
        `https://baggageuatapi.acrossassist.in/api/BaggageService/ResendBaggageWrappingMail?authCode=${val}`,
        {
          responseType: "blob",
        },
      );
      const data = response.data;
      console.log("response",data.status)
      if(data.status === true){
        Swal.fire({
          title:data.message,
          icon:"success"
        })
      }else{
         Swal.fire({
          title:data.message,
          icon:"error"
        })
      }
    } catch (error) {
      console.log("error",error)
       Swal.fire({
          title:error.message,
          text:error.status,
          icon:"error"
        })
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      name: "S.No",
      cell: (row, index) => index + 1,
      width: "80px",
      center: true,
    },

    {
      name: "Id",
      selector: (row) => row.customerId || "-",
      width: "70px",
      center: true,
    },

    {
      name: "Customer Name",
      cell: (row) => (
        <div className="py-3">
          <p className="font-semibold text-gray-800">{row.name}</p>
        </div>
      ),
      width: "200px",
    },

    {
      name: "Customer Email",
      cell: (row) => (
        <div className="py-3 break-all">
          <p className="text-gray-700">{row.emailId}</p>
        </div>
      ),
      width: "280px",
    },

    {
      name: "DOB",
      cell: (row) => (
        <div className="py-3 break-all">
          <p className="text-gray-700">{dateFormat(row.dateOfBirth)}</p>
        </div>
      ),
      width: "180px",
    },
    {
      name: "Gender",
      cell: (row) => (
        <div className="py-3 break-all">
          <p className="text-gray-700">{row.gender}</p>
        </div>
      ),
      width: "100px",
    },
    {
      name: "Contact",
      cell: (row) => (
        <div className="py-3">
          <p className="font-medium text-gray-700">{row.mobileNumber}</p>
        </div>
      ),
      width: "140px",
    },
     {
      name: "Plan Name",
      cell: (row) => (row.planName),
      width: "150px",
      center: true,
    },
     {
      name: "Passport No",
      cell: (row) => (row.passportNo),
      width: "150px",
      center: true,
    },

    {
      name: "City",
      selector: (row) => row.city || "-",
      width: "140px",
      center: true,
    },
  {
      name: "State",
      selector: (row) => row.state || "-",
      width: "140px",
      center: true,
    },

      {
      name: "Pin Code",
      selector: (row) => row.pinCode || "-",
      width: "140px",
      center: true,
    },
      {
      name: "Country",
      selector: (row) => row.country || "-",
      width: "140px",
      center: true,
    },

    {
      name: "Created Date",
      cell: (row) => (
        
         dateFormat(row.createdDate)
      ),
      width: "220px",
    },
    {
  name: "Payment Status",
  selector: (row) => row.paymentStatus || "-",
  width: "140px",
  center: true,
  cell: (row) => {
    const status = row.paymentStatus?.toLowerCase();
    
    // Default styles (for unknown statuses or "-")
    let bgColor = "#f3f4f6"; // Light Gray
    let textColor = "#4b5563"; // Dark Gray

    if (status === "success") {
      bgColor = "#d1fae5"; // Light Green
      textColor = "#065f46"; // Dark Green
    } else if (status === "failure" || status === "failed") {
      bgColor = "#fee2e2"; // Light Red
      textColor = "#991b1b"; // Dark Red
    } else if (status === "pending") {
      bgColor = "#fef3c7"; // Light Yellow
      textColor = "#92400e"; // Dark Yellow
    }

    return (
      <div
        style={{
          backgroundColor: bgColor,
          color: textColor,
          padding: "6px 12px",
          borderRadius: "12px",      // Makes the box rounded (pill shape)
          fontSize: "12px",
          fontWeight: "600",
          display: "inline-block",   // Ensures the box wraps tightly around the text
          textTransform: "capitalize" // Ensures "success" looks like "Success"
        }}
      >
        {row.paymentStatus || "-"}
      </div>
    );
  },
}
    // {
    //   name: "Payment Response",
    //   selector: (row) => row.paymentResponse || "-",
    //   width: "230px",
    //   center: true,
    // },

   
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#111827",
        fontWeight: "700",
        fontSize: "14px",
        paddingTop: "14px",
        paddingBottom: "14px",
      },
    },

    rows: {
      style: {
        minHeight: "80px",
        fontSize: "14px",
        borderBottom: "1px solid #f1f5f9",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customer list</h1>

        <p className="text-gray-500 mt-1">
          Welcome to Global Cyber Protection Service Admin Panel
        </p>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl shadow-lg p-5">
        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute top-3 left-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MIS DOWNLOAD */}
          <div className="flex flex-col md:flex-row gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleDownloadMIS}
              disabled={downloadLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition h-fit mt-auto disabled:opacity-70"
            >
              <FaDownload />

              {downloadLoading ? "Downloading..." : "Download MIS"}
            </button>
          </div>
        </div>

        {/* TABLE */}
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

        {/* <div ref={pdfRef}>
          <ServiceCompletionReceipt pdfcode={pdfcode} />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
