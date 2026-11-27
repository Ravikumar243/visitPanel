import { useState, useEffect } from "react";
import { FaUsers, FaTimesCircle } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa6";

// Constants for dynamic chart mapping
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CHART_COLORS = [
  "#ff6b8a", "#3f97d3", "#f0c24f", "#8b62e8", "#45b7b8", "#f5c88c",
  "#f35d80", "#bdbfc4", "#c28bb5", "#79bc48", "#efcc00", "#8ec77f"
];

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCustomersCount: 0,
    successPaymentCount: 0,
    failedPaymentCount: 0,
    pendingPaymentCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // States for Chart
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(true);

  // States for Dropdowns
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedStatus, setSelectedStatus] = useState("Success");

  // 1. Fetch Overall Dashboard Summary Data (Runs Once)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          "https://cyberprotectionapi.acrossassist.in/api/GlobalCyberProtection/customerPaymentStatusData"
        );
        const result = await response.json();

        if (result.status && result.data) {
          setDashboardData({
            totalCustomersCount: result.data.totalCustomersCount,
            successPaymentCount: result.data.successPaymentCount,
            failedPaymentCount: result.data.failedPaymentCount,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Fetch Yearly Chart Data (Runs on Filter Change)
  useEffect(() => {
    const fetchChartData = async () => {
      setIsChartLoading(true);
      try {
        // Map UI dropdown status to API required values
        const apiPaymentStatus = selectedStatus === "Failed" ? "Failure" : "success";

        const response = await fetch(
          "https://cyberprotectionapi.acrossassist.in/api/GlobalCyberProtection/paymentStatusYearlyData",
          {
            method: "POST", // Assumed POST based on JSON body payload requirements
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              year: parseInt(selectedYear),
              paymentStatus: apiPaymentStatus,
            }),
          }
        );
        const result = await response.json();

        if (result.status && result.data) {
          // Transform API response into standard array format for charting
          const formattedData = MONTH_KEYS.map((monthKey, index) => ({
            month: MONTH_LABELS[index],
            value: result.data[monthKey] || 0,
            color: CHART_COLORS[index],
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear, selectedStatus]);

  // Calculate maximum value for Y-Axis and bar height scaling
  const maxValue = Math.max(...chartData.map((item) => item.value), 1); // fallback to 1 to avoid division by zero
  const yAxisLabels = [
    maxValue,
    Math.round(maxValue * 0.75),
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.25),
    0
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm md:text-base text-slate-500">Customer and payment summary</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="group rounded-2xl bg-white p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Total Customers</h2>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <FaUsers className="text-xl md:text-2xl" />
            </div>
          </div>
          <p className={`text-4xl md:text-5xl font-bold mt-5 text-slate-900 ${isLoading ? "animate-pulse" : ""}`}>
            {isLoading ? "0" : dashboardData.totalCustomersCount}
          </p>
          <p className="text-sm mt-2 text-slate-500">Active database users</p>
        </div>

        <div className="group rounded-2xl bg-white p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Success</h2>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <FaMoneyBillWave className="text-xl md:text-2xl" />
            </div>
          </div>
          <p className={`text-4xl md:text-5xl font-bold mt-5 text-slate-900 ${isLoading ? "animate-pulse" : ""}`}>
            {isLoading ? "0" : dashboardData.successPaymentCount}
          </p>
          <p className="text-sm mt-2 text-slate-500">Completed transactions</p>
        </div>

        <div className="group rounded-2xl bg-white p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Failed</h2>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <FaTimesCircle className="text-xl md:text-2xl" />
            </div>
          </div>
          <p className={`text-4xl md:text-5xl font-bold mt-5 text-slate-900 ${isLoading ? "animate-pulse" : ""}`}>
            {isLoading ? "0" : dashboardData.failedPaymentCount}
          </p>
          <p className="text-sm mt-2 text-slate-500">Declined or errors</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900">Customer Payment Status</h3>
          </div>
          
          {/* Dropdown Controls */}
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className={`transition-opacity duration-300 ${isChartLoading ? "opacity-50" : "opacity-100"}`}>
          <div className="flex w-full">
            {/* Y-Axis Labeling */}
            <div className="flex flex-col justify-between items-end pr-3 pb-8 text-xs text-slate-400 font-medium h-[290px] md:h-[360px]">
              {yAxisLabels.map((val, i) => (
                <span key={i}>{val}</span>
              ))}
            </div>

            {/* Bar Chart Container */}
            <div className="flex-1 overflow-x-auto pb-2">
              <div
                className="h-[290px] md:h-[360px] min-w-[700px] grid grid-cols-12 items-end gap-4 sm:gap-5 lg:gap-6 border-l border-b border-slate-300 px-4 md:px-7 pb-2"
                style={{
                  backgroundImage: "linear-gradient(to top, rgba(148, 163, 184, 0.22) 1px, transparent 1px)",
                  backgroundSize: "100% 25%", // Adjusted to roughly match the 4 quartile divisions
                }}
              >
                {chartData.map((item) => (
                  <div key={item.month} className="flex h-full flex-col items-center justify-end group cursor-pointer">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs md:text-sm font-semibold text-slate-600 mb-2">
                      {item.value}
                    </span>

                    <div
                      className="w-full max-w-[46px] rounded-t-md transition-all duration-300 group-hover:opacity-85"
                      style={{
                        height: `${(item.value / maxValue) * 250}px`,
                        backgroundColor: item.color,
                      }}
                      title={`${item.month}: ${item.value}`}
                    />

                    <span className="mt-3 text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* X-Axis Year Label */}
          <div className="text-center mt-3 text-sm font-semibold text-slate-500">
            Year: {selectedYear}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;