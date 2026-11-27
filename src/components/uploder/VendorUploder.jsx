import axios from "axios";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { FiUploadCloud } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import url from "../../api/API"

const VendorUploder = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        title: "File Missing",
        text: "Please select a file first",
        icon: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await axios.post(
        "https://baggageuatapi.acrossassist.in/api/BaggageService/UploadVendors",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("response", res.data);

      Swal.fire({
        title: "Success",
        text: "File uploaded successfully",
        icon: "success",
      });

      setFile(null);
    } catch (error) {
      console.log("upload error", error);

      Swal.fire({
        title: "Upload Failed",
        text: "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl p-8">
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-5 rounded-full mb-4">
            <FiUploadCloud className="text-blue-600 text-5xl" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Vendor File Upload
          </h1>

          <p className="text-gray-500 mt-2 text-center">
            Upload a single vendor file using Excel, CSV, or PDF format
          </p>
        </div>

        <div className="mt-8">
          <label className="border-2 border-dashed border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <FiUploadCloud className="text-4xl text-blue-500 mb-3" />

            <p className="text-gray-700 font-medium">
              Click to choose file
            </p>

            <span className="text-sm text-gray-400 mt-1">Only single file allowed</span>
          </label>

          {file && (
            <div className="mt-4 bg-gray-50 border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Selected File</p>
                <p className="text-sm text-gray-500 break-all">{file.name}</p>
              </div>
              <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-2xl font-semibold shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><AiOutlineLoading3Quarters className="animate-spin" />Uploading...</>
            ) : (
              <><FiUploadCloud /> Upload File</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorUploder;