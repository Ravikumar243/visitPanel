import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { BASE_URL } from "../../api/API";

const SalesAgentList = () => {
    const [agentList, setAgentList] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);


    const agentId = localStorage.getItem("AgentId");


    const handleDownloadTemplate = () => {
        const templateData = [
            {
                EmployeeName: "",
                EmployeeMobileNo: "",
                EmployeeId: "",
                EmployeeEmail: "",
                EmployeeAddress: ""
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Sales Agents"
        );

        XLSX.writeFile(
            workbook,
            "Sales_Agent_Bulk_Upload_Template.xlsx"
        );
    };


    const fetchSalesAgentList = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/GetReimbursementAgentList`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setAgentList(Array.isArray(data) ? data : data?.data || []);
            } else {
                Swal.fire(
                    "Error",
                    data?.message || "Failed to fetch sales agent list",
                    "error"
                );
            }
        } catch (error) {
            console.error("Get sales agent list error:", error);

            Swal.fire(
                "Error",
                "Something went wrong while fetching sales agents.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // if (agentId) {
        fetchSalesAgentList();
        // }
    }, []);


    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setUploadFile(null);
            return;
        }

        setUploadFile(file);
    };



    const handleBulkUpload = async () => {
        if (!uploadFile) {
            Swal.fire("Warning", "Please select a file first.", "warning");
            return;
        }

        if (!agentId) {
            Swal.fire("Error", "AgentId is not available.", "error");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            // Change "file" if your backend expects another field name
            formData.append("file", uploadFile);

            const response = await fetch(
                `${BASE_URL}/ReimbursementAgentBulkUpload?AgentId=${encodeURIComponent(
                    agentId
                )}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && (data?.status === 1)) {
                Swal.fire(
                    "Success",
                    data?.message || "Sales agents uploaded successfully.",
                    "success"
                );

                setUploadFile(null);

                // Clear file input
                const fileInput = document.getElementById("agentBulkUpload");
                if (fileInput) {
                    fileInput.value = "";
                }

                await fetchSalesAgentList();
            } else {
                Swal.fire(
                    "Error",
                    data?.message || "Failed to upload sales agents.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Bulk upload error:", error);

            Swal.fire(
                "Error",
                "Something went wrong during upload.",
                "error"
            );
        } finally {
            setUploading(false);
        }
    };


    const handleSelectAgent = (agent) => {
        setSelectedAgents((prev) => {
            const alreadySelected = prev.some(
                (item) =>
                    item.employeeId === agent.employeeId &&
                    item.employeeMobileNo === agent.employeeMobileNo
            );

            if (alreadySelected) {
                return prev.filter(
                    (item) =>
                        !(
                            item.employeeId === agent.employeeId &&
                            item.employeeMobileNo === agent.employeeMobileNo
                        )
                );
            }

            return [...prev, agent];
        });
    };



    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedAgents([...agentList]);
        } else {
            setSelectedAgents([]);
        }
    };

    const isAllSelected =
        agentList.length > 0 &&
        selectedAgents.length === agentList.length;


    const handleUpdateStatus = async (status) => {
        if (selectedAgents.length === 0) {
            Swal.fire(
                "Warning",
                "Please select at least one sales agent.",
                "warning"
            );
            return;
        }

        const statusText = status === "1" ? "Active" : "Deactive";

        const confirmResult = await Swal.fire({
            title: `Make ${statusText}?`,
            text: `You have selected ${selectedAgents.length} sales agent(s).`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        try {
            setLoading(true);

            for (const agent of selectedAgents) {
                const payload = {
                    employeeId: String(agent.employeeId || ""),
                    employeeMobileNo: String(agent.employeeMobileNo || ""),
                    status: status,
                    agentId: String(agentId || ""),
                };

                const response = await fetch(
                    `${BASE_URL}/UpdateReimbursementAgentStatus`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const data = await response.json();

                if (!response.ok || !(Array.isArray(data) && data?.[0]?.status === true)) {
                    throw new Error(
                        data?.message || `Failed to update ${agent.employeeId}`
                    );
                }
            }

            Swal.fire(
                "Success",
                `${selectedAgents.length} agent(s) marked ${statusText}.`,
                "success"
            );

            setSelectedAgents([]);

            await fetchSalesAgentList();

        } catch (error) {
            console.error("Update agent status error:", error);

            Swal.fire(
                "Error",
                error.message || "Something went wrong while updating agents.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                />
            ),
            width: "60px",
            center: true,
            cell: (row) => {
                const isSelected = selectedAgents.some(
                    (item) =>
                        item.employeeId === row.employeeId &&
                        item.employeeMobileNo === row.employeeMobileNo
                );

                return (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectAgent(row)}
                    />
                );
            },
        },
        {
            name: "S.No.",
            width: "80px",
            center: true,
            cell: (row, index) => index + 1,
        },
        {
            name: "Employee ID",
            selector: (row) => row.employeeId || "-",
            sortable: true,
        },
        {
            name: "Employee Name",
            selector: (row) => row.employeeName || "-",
            sortable: true,
        },
        {
            name: "Mobile Number",
            selector: (row) => row.employeeMobileNo || "-",
            sortable: true,
        },
        {
            name: "Employee Address",
            selector: (row) => row.baseAddress || "-",
            sortable: true,
        },
        {
            name: "Status",
            center: true,
            cell: (row) =>
                String(row.isActive) === "True" ? (
                    <span className="badge bg-success">Active</span>
                ) : (
                    <span className="badge bg-danger">Deactive</span>
                ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                padding: 0,
                background: "linear-gradient(135deg, #5932ea, #5932ea)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                padding: "0 0 0 10px",
                borderBottom: "1px solid #fff",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                justifyContent: "start",
                borderRight: "1px solid #f2f2f2ff",
                borderBottom: "1px solid #f2f2f2ff",
            },
        },
        rows: {
            style: {
                minHeight: "42px",
            },
        },
    };


    return (
        <div className="w-full px-3 py-2 sm:px-4 sm:py-3">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-0">
                    Sales Agent List
                </h4>
            </div>

            {/* Bulk Upload Card */}
            <div className="bg-white rounded-md shadow-sm mb-4 border border-gray-200">

                {/* Card Header */}
                <div className="px-3 py-2.5 border-b border-gray-200">
                    <strong className="text-sm sm:text-base text-gray-800">
                        Bulk Upload Sales Agents
                    </strong>
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-3">

                        {/* File Input */}
                        <div className="w-full md:w-1/2">
                            <label
                                htmlFor="agentBulkUpload"
                                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Select Excel File
                            </label>

                            <input
                                id="agentBulkUpload"
                                type="file"
                                className="
                block w-full
                rounded-md
                border border-gray-300
                bg-white
                px-2.5 py-1.5
                text-xs sm:text-sm
                text-gray-700
                file:mr-3
                file:rounded
                file:border-0
                file:bg-gray-100
                file:px-2.5
                file:py-1
                file:text-xs sm:file:text-sm
                file:font-medium
                hover:file:bg-gray-200
                focus:border-blue-500
                focus:outline-none
                focus:ring-1
                focus:ring-blue-500
              "
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Upload Button */}
                        <div className="w-full md:w-[120px]">
                            <button
                                type="button"
                                className="
                w-full
                rounded-md
                bg-blue-600
                px-3
                py-1.5
                text-xs sm:text-sm
                font-medium
                text-white
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
                                disabled={!uploadFile || uploading}
                                onClick={handleBulkUpload}
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>

                        {/* Download Template */}
                        <div className="w-full md:w-auto">
                            <Button
                                type="button"
                                onClick={handleDownloadTemplate}
                                variant="outlined"
                                startIcon={<SaveAltIcon />}
                                style={{
                                    color: "#5932ea",
                                    border: "1px solid #5932ea",
                                    backgroundColor: "#faf5ff",
                                    fontSize: "12px",
                                    padding: "6px 12px",
                                    minHeight: "34px",
                                    textTransform: "none",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#5932ea";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#faf5ff";
                                    e.currentTarget.style.color = "#5932ea";
                                }}
                            >
                                Download Template
                            </Button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Sales Agents Card */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200">

                {/* Card Header */}
                <div
                    className="
          flex
          flex-col
          sm:flex-row
          items-start
          sm:items-center
          justify-between
          gap-2
          px-3
          py-2.5
          border-b
          border-gray-200
        "
                >
                    <strong className="text-sm sm:text-base text-gray-800">
                        Sales Agents
                    </strong>

                    <div className="flex items-center gap-1.5">

                        {/* Active */}
                        <button
                            type="button"
                            className="
              rounded-md
              bg-green-600
              px-2.5
              py-1
              text-xs sm:text-sm
              font-medium
              text-white
              hover:bg-green-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                            disabled={selectedAgents.length === 0 || loading}
                            onClick={() => handleUpdateStatus("1")}
                        >
                            Active
                        </button>

                        {/* Deactive */}
                        <button
                            type="button"
                            className="
              rounded-md
              bg-red-600
              px-2.5
              py-1
              text-xs sm:text-sm
              font-medium
              text-white
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                            disabled={selectedAgents.length === 0 || loading}
                            onClick={() => handleUpdateStatus("0")}
                        >
                            Deactive
                        </button>

                    </div>
                </div>

                {/* DataTable */}
                <div className="w-full overflow-x-auto">

                    <DataTable
                        columns={columns}
                        data={agentList}
                        progressPending={loading}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        highlightOnHover
                        responsive
                        striped
                        persistTableHead
                        noDataComponent="No sales agents found."
                        customStyles={customStyles}
                    />

                </div>

            </div>

        </div>
    );
};

export default SalesAgentList;