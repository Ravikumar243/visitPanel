import React, { useEffect, useState } from "react";

import {
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    Typography,
} from "@mui/material";
import * as XLSX from "xlsx";

import {
    Search,
    Refresh,
    FileDownloadOutlined,
} from "@mui/icons-material";

import DataTable from "react-data-table-component";

import "./SalesVisitCompliance.css";
import { BASE_URL } from "../../api/API";
import ImageViewer from "./ImageViewer";

const SalesVisitCompliance = () => {
    const [tableData, setTableData] = useState([]);
    const [todayData, setTodayData] = useState("");
    const [thisMonth, setThisMonth] = useState("");
    const [thisYear, setThisYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const employeeId = localStorage.getItem("employeeId");
    const userType = localStorage.getItem("userType");

    const isEmployee = userType === "employee";

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        month: "",
        fiscalYear: "",
        employeeId: "",
    });

    const [employeeOptions, setEmployeeOptions] = useState([]);


    const monthOptions = [
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
    ];

    const fiscalYearOptions = [
        "2025",
        "2026",
        "2027",
    ];


    const fetchVisitDetails = async () => {
        try {
            setLoading(true);

            // Clear old data while fetching
            setTableData([]);

            const params = new URLSearchParams();

            if (filters.fromDate) {
                params.append("FromDate", filters.fromDate);
            }

            if (filters.toDate) {
                params.append("ToDate", filters.toDate);
            }

            if (filters.month) {
                params.append("Month", filters.month);
            }

            if (filters.fiscalYear) {
                params.append("FinancialYear", filters.fiscalYear);
            }

            if (isEmployee) {
                if (employeeId) {
                    params.append("EmployeeId", employeeId);
                }
            } else {
                if (filters.employeeId) {
                    params.append("EmployeeId", filters.employeeId);
                }
            }

            const url =
                `${BASE_URL}/GetReimbursementAgentVisitDetails?${params.toString()}`;

            console.log("API URL:", url);
            console.log("Filters:", filters);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            console.log("API RESPONSE:", result);
            console.log("API DATA:", result?.data);

            // Accept both success and status
            const isSuccess =
                result?.success === true ||
                result?.status === true;

            if (isSuccess) {

                const newData = Array.isArray(result?.data)
                    ? result.data
                    : [];

                console.log("SETTING TABLE DATA:", newData);

                setTableData(newData);

                setTodayData(
                    result?.todayCount?.TodayCount ?? 0
                );

                setThisMonth(
                    result?.currentMonthCount?.CurrentMonthCount ?? 0
                );

                setThisYear(
                    result?.currentFinancialYearCount?.CurrentFinancialYearCount ?? 0
                );

            } else {

                console.log("API returned unsuccessful response");

                setTableData([]);
                setTodayData(0);
                setThisMonth(0);
                setThisYear(0);
            }

        } catch (error) {

            console.error(
                "Error fetching visit details:",
                error
            );

            setTableData([]);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitDetails();
    }, []);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };



    const handleReset = () => {

        setFilters({
            fromDate: "",
            toDate: "",
            month: "",
            fiscalYear: "",
            employeeId: "",
        });

        fetchVisitDetails()
    };

    const handleExport = () => {
        if (!tableData || tableData.length === 0) {
            alert("No data available to export");
            return;
        }

        const exportData = tableData.map((row) => ({
            "Emp. Id.": row.employeeId || "",
            "Emp. Name": row.employeeName || "",
            "Emp. Mob.": row.employeeMobileNo || "",
            "Dealer Name": row.dealerName || "",
            "Dealer Mob.": row.dealerMobileNo || "",
            "Agent Home Location": row.baseAddress || "",
            "Agent Base Location": row.loginAddress || "",
            "Dealer Location": row.locationAddress || "",
            Latitude: row.latitude || "",
            Longitude: row.longitude || "",
            Date: row.visitDate || "",
            Time: row.visitTime || "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Sales Visit Compliance"
        );

        // Auto column width
        const columnWidths = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(
                key.length,
                ...exportData.map((row) =>
                    String(row[key] ?? "").length
                )
            ) + 2,
        }));

        worksheet["!cols"] = columnWidths;

        const fileName = `Sales_Visit_Compliance_${new Date()
            .toISOString()
            .split("T")[0]}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };







    const columns = [

        {
            name: "EMPLOYEE",
            selector: (row) => row.image,
            sortable: true,
            minWidth: "120px",
            cell: (row) => (
                <div className="sales-employee-cell">

                    <div
                        className="employee-avatar"
                        onClick={() => setSelectedImage(row.image)}
                        style={{
                            cursor: "pointer",
                            overflow: "hidden",
                        }}
                    >
                        {row.image ? (
                            <img
                                src={row.image}
                                alt={row.image || "Employee"}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    // borderRadius: "50%",
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <span>
                                {row.image
                                    ?.split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </span>
                        )}
                    </div>

                    <span>{row.employee}</span>

                </div>
            ),
        },



        {
            name: "EMP. Id.",
            selector: (row) => row.employeeId,
            minWidth: "145px",
        },
        {
            name: "EMP. Name",
            selector: (row) => row.employeeName,
            minWidth: "145px",
        },
        {
            name: "EMP. MOB.",
            selector: (row) => row.employeeMobileNo,
            minWidth: "145px",
        },

        {
            name: "DEALER Name",
            selector: (row) => row.dealerName,
            sortable: true,
            minWidth: "120px",
        },

        {
            name: "DEALER MOB.",
            selector: (row) => row.dealerMobileNo,
            minWidth: "145px",
        },

        {
            name: "Agent Home LOCATION",
            selector: (row) => row.baseAddress,
            sortable: true,
            minWidth: "170px",
        },
        {
            name: "Agent Base LOCATION",
            selector: (row) => row.loginAddress,
            sortable: true,
            minWidth: "170px",
        },
        {
            name: "DEALER LOCATION",
            selector: (row) => row.locationAddress,
            sortable: true,
            minWidth: "170px",
        },

        {
            name: "LATITUDE",
            selector: (row) => row.latitude,
            minWidth: "105px",
        },

        {
            name: "LONGITUDE",
            selector: (row) => row.longitude,
            minWidth: "110px",
        },

        {
            name: "DATE",
            selector: (row) => row.visitDate,
            sortable: true,
            minWidth: "105px",
        },

        {
            name: "TIME",
            selector: (row) => row.visitTime,
            sortable: true,
            minWidth: "95px",
        },
    ];



    const customStyles = {

        table: {
            style: {
                width: "100%",
            },
        },

        headRow: {
            style: {
                minHeight: "44px",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
            },
        },

        headCells: {
            style: {
                fontSize: "10px",
                fontWeight: "700",
                color: "#64748b",
                paddingLeft: "10px",
                paddingRight: "10px",
                whiteSpace: "nowrap",
            },
        },

        cells: {
            style: {
                fontSize: "11px",
                color: "#334155",
                paddingLeft: "10px",
                paddingRight: "10px",
                whiteSpace: "nowrap",
                borderBottom: "1px solid #f1f5f9",
            },
        },

        rows: {
            style: {
                minHeight: "60px",
            },

            highlightOnHoverStyle: {
                backgroundColor: "#f8fafc",
                transitionDuration: "0.15s",
                borderBottomColor: "#e5e7eb",
            },
        },

        pagination: {
            style: {
                borderTop: "1px solid #e5e7eb",
                minHeight: "58px",
            },

            pageButtonsStyle: {
                borderRadius: "6px",
                height: "34px",
                width: "34px",
                padding: "5px",
                margin: "0 3px",
                cursor: "pointer",
                transition: "0.2s",
            },
        },
    };

    const filterInputSx = {
        "& .MuiOutlinedInput-root": {
            height: "35px",
            fontSize: "13px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
        },

        "& .MuiOutlinedInput-input": {
            padding: "8px 12px",
            fontSize: "13px",
            lineHeight: "20px",
            boxSizing: "border-box",
        },

        "& .MuiInputLabel-root": {
            fontSize: "13px",
            top: "0px",
        },

        "& .MuiInputLabel-shrink": {
            fontSize: "12px",
        },

        "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            minHeight: "unset !important",
            padding: "8px 32px 8px 12px !important",
            fontSize: "13px",
            boxSizing: "border-box",
        },

        "& .MuiSelect-icon": {
            fontSize: "20px",
            right: "8px",
        },
    };

    return (
        <div className="w-full px-4 py-4">

            <div className="flex items-center justify-between mb-5">
                <Typography className="!text-xl !font-semibold !text-gray-800">
                    Sales Visit Compliance
                </Typography>

                <Button
                    variant="outlined"
                    className="!border !border-indigo-600 !text-indigo-600 !rounded-md !px-4 !py-2 !text-sm"
                    onClick={handleExport}
                    startIcon={
                        <FileDownloadOutlined
                            sx={{ fontSize: 18 }}
                        />
                    }
                >
                    Export
                </Button>
            </div>

            {!isEmployee && (
                < div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                    {/* TODAY */}
                    <div className="w-full">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-2 text-sm font-medium text-gray-500">
                                VISITS TODAY
                            </div>

                            <div className="text-2xl font-bold text-gray-800">
                                {todayData}
                            </div>
                        </div>
                    </div>

                    {/* MONTH */}
                    <div className="w-full">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-2 text-sm font-medium text-gray-500">
                                VISITS FOR THE MONTH
                            </div>

                            <div className="text-2xl font-bold text-gray-800">
                                {thisMonth}
                            </div>
                        </div>
                    </div>

                    {/* FINANCIAL YEAR */}
                    <div className="w-full">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-2 text-sm font-medium text-gray-500">
                                VISITS FOR THE FINANCIAL YEAR
                            </div>

                            <div className="text-2xl font-bold text-gray-800">
                                {thisYear}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================
        FILTER CARD
    ================================= */}

            <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Filter Header */}
                <div className="border-b border-gray-200 px-4 py-3">
                    <div className="text-sm font-semibold tracking-wide text-gray-700">
                        FILTERS
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        {/* FROM DATE */}
                        <div className="w-full">
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                // label="From date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "34px",
                                        fontSize: "12px",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        padding: "7px 10px",
                                        fontSize: "12px",
                                    },
                                }}

                            />
                        </div>


                        <div className="w-full">
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                // label="To date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "34px",
                                        fontSize: "12px",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        padding: "7px 10px",
                                        fontSize: "12px",
                                    },
                                }}
                            />
                        </div>

                        {/* MONTH */}
                        <div className="w-full">
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Month"
                                name="month"
                                value={filters.month}
                                onChange={handleChange}
                                sx={filterInputSx}
                            >
                                {monthOptions.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {/* FINANCIAL YEAR */}
                        <div className="w-full">
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Financial Year"
                                name="fiscalYear"
                                value={filters.fiscalYear}
                                onChange={handleChange}
                                sx={filterInputSx}
                            >
                                {fiscalYearOptions.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {!isEmployee && (
                            <div className="w-full">
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Employee ID"
                                    name="employeeId"
                                    value={filters.employeeId}
                                    onChange={handleChange}
                                    placeholder="Search by Id"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Search
                                                    sx={{
                                                        fontSize: 18,
                                                        color: "#64748b",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={filterInputSx}
                                />
                            </div>
                        )}

                        <div className="w-full flex items-center gap-2">
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={fetchVisitDetails}
                                disabled={loading}
                                sx={{
                                    height: "35px",
                                    minHeight: "35px",
                                    padding: "8px 16px",
                                    fontSize: "13px",
                                    lineHeight: "20px",
                                    fontWeight: 600,
                                    borderRadius: "5px",
                                    backgroundColor: "#5932ea",
                                    textTransform: "none",
                                    boxSizing: "border-box",

                                    "&:hover": {
                                        backgroundColor: "#4824c7",
                                    },
                                }}
                            >
                                {loading ? "Loading..." : "Submit"}
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleReset}
                                startIcon={<Refresh sx={{ fontSize: "18px !important" }} />}
                                sx={{
                                    height: "35px",
                                    minHeight: "35px",
                                    // padding: "8px 16px",
                                    fontSize: "13px",
                                    lineHeight: "20px",
                                    fontWeight: 500,
                                    borderRadius: "5px",
                                    textTransform: "none",
                                    boxSizing: "border-box",
                                    borderColor: "#60a5fa",
                                    color: "#2563eb",

                                    "&:hover": {
                                        borderColor: "#2563eb",
                                        backgroundColor: "#f8fafc",
                                    },
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>



            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        pagination
                        highlightOnHover
                        responsive
                        persistTableHead
                        customStyles={customStyles}
                    />
                </div>
            </div>

            {
                selectedImage && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                        }}
                    >
                        <ImageViewer imageUrl={selectedImage} />

                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: "fixed",
                                top: "15px",
                                right: "20px",
                                zIndex: 10000,
                                width: "40px",
                                height: "40px",
                                border: "none",
                                borderRadius: "50%",
                                background: "#fff",
                                color: "#000",
                                fontSize: "24px",
                                cursor: "pointer",
                            }}
                        >
                            ×
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default SalesVisitCompliance;