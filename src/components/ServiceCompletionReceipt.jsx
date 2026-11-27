import React, { useEffect, useRef, useState } from "react";
import "./pdf.css";
import "../index.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./pdf.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";

const ServiceCompletionReceipt = () => {
  const { userid } = useParams();

  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(true);

  const pdfRef = useRef(null);

  const dateFormat = (date) => {
    return dayjs(date).format("DD MMM YYYY hh:mm A");
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `https://baggageuatapi.acrossassist.in/api/BaggageService/GetServiceReceipt?authCode=${userid}`,
        );

        const data = res.data;

        if (data.status === true) {
          setTableData(data.data);
        }
      } catch (error) {
        console.log(error);

        Swal.fire({
          title: "Error",
          text: "Failed to fetch receipt data",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userid]);

  // ================= AUTO PDF DOWNLOAD =================
  const downloadPDF = async () => {
    try {
      const input = pdfRef.current;

      if (!input) {
        console.log("PDF Ref Missing");
        return;
      }

      // remove unsupported color parsing
      document.documentElement.style.colorScheme = "light";

      await document.fonts.ready;

      // small wait for render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      if (!imgData) {
        console.log("Image generation failed");
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`Service_Receipt_${tableData?.customerName || "Receipt"}.pdf`);

      console.log("PDF Download Success");
    } catch (error) {
      console.log("PDF ERROR:", error);
    }
  };

  // ================= AUTO DOWNLOAD PDF =================
  useEffect(() => {
    if (!loading && Object.keys(tableData).length > 0) {
      const generatePdf = async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));

        setTimeout(() => {
          downloadPDF();
        }, 1500);
      };

      generatePdf();
    }
  }, [loading, tableData]);

  const rowStyle = {
    borderBottom: "1px solid #e5e7eb",
  };

  const labelStyle = {
    padding: "14px",
    fontWeight: "600",
    background: "#f8fafc",
    width: "40%",
    color: "#374151",
  };

  const valueStyle = {
    padding: "14px",
    color: "#111827",
    fontWeight: "500",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-blue-600">
        Loading Receipt...
      </div>
    );
  }

  const pdfStyles = {
    backgroundColor: "#ffffff",
    color: "#000000",
  };
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div
        ref={pdfRef}
        className="max-w-3xl mx-auto  shadow-2xl rounded-3xl overflow-hidden pdf-container "
        style={pdfStyles}
      >
        {/* HEADER */}
        <div className=" px-8 py-6">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">SERVICE COMPLETION RECEIPT</h2>

              <p className="text-sm mt-1 opacity-90">
                Issued By: Across Assist Pvt. Ltd.
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8">
          <div className=" border  rounded-2xl overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr style={rowStyle}>
                  <td style={labelStyle}>Receipt No.</td>
                  <td style={valueStyle}>{tableData?.receiptNo || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Date & Time</td>
                  <td style={valueStyle}>
                    {dateFormat(tableData?.createdAt) || "-"}
                  </td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Airport</td>
                  <td style={valueStyle}>{tableData?.airport || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Vendor Name</td>
                  <td style={valueStyle}>{tableData?.vendorName || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Customer Name</td>
                  <td style={valueStyle}>{tableData?.customerName || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Service</td>
                  <td style={valueStyle}>{tableData?.service || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Bags Wrapped</td>
                  <td style={valueStyle}>{tableData?.bagsWrapped || "-"}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Amount</td>
                  <td style={valueStyle}>{tableData?.amount || "0"}{" "}{tableData?.currency || ""}</td>
                </tr>

                <tr style={rowStyle}>
                  <td style={labelStyle}>Verification Code</td>
                  <td style={valueStyle}>
                    {tableData?.verificationCode || "-"}
                  </td>
                </tr>

                <tr>
                  <td style={labelStyle}>Status</td>

                  <td style={valueStyle}>
                    <span className=" px-4 py-1 rounded-full text-sm font-semibold">
                      {tableData?.status || "Completed"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8  border rounded-2xl p-5">
            <p className="text-sm text-gray-700 leading-7">
              This receipt is automatically generated by Across Assist after
              successful completion of baggage wrapping service.
            </p>
          </div>

          <div className="mt-10 border-t pt-6 flex justify-center items-center">
            <div>
              <h4 className="font-bold text-gray-800 text-center">
                Across Assist Operations Team
              </h4>

              <p className="text-sm text-gray-500 mt-1 text-center">
                support@acrossassist.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCompletionReceipt;
