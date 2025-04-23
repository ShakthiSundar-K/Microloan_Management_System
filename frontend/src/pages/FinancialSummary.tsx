import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  X,
  Users,
  CalendarRange,
  RefreshCw,
  Info,
  AlertCircle,
  Clock,
  CircleDollarSign,
  Landmark,
  Briefcase,
  Activity,
  Sparkles,
  ArrowRightCircle,
  BarChart4,
  BarChart2,
  Diamond,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

// TypeScript interfaces
interface FinancialSummary {
  id: string;
  userId: string;
  month: string;
  totalLoansIssued: number;
  totalPrincipalLent: string;
  totalUpfrontDeductions: string;
  newBorrowersThisMonth: number;
  activeLoansCount: number;
  closedLoansCount: number;
  defaultedLoansCount: number;
  pendingLoanAmount: string;
  totalCapital: string;
  idleCapital: string;
  updatedAt: string;
}

interface MonthlyData {
  month: string;
  totalLoansIssued: number;
  totalPrincipalLent: number;
  totalUpfrontDeductions: number;
  newBorrowersThisMonth: number;
}

const FinancialSummary: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("YYYY-MM")
  );
  const [monthsToShow, setMonthsToShow] = useState(3);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<MonthlyData[]>([]);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolledRight, setHasScrolledRight] = useState(false);
  const [hasMoreToScroll, setHasMoreToScroll] = useState(false);

  // Fetch the current month's financial summary on component mount
  useEffect(() => {
    fetchFinancialSummary(selectedMonth);
    fetchHistoricalData(monthsToShow);
  }, [monthsToShow, selectedMonth]);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      return () => tableContainer.removeEventListener("scroll", checkScroll);
    }
  }, [historicalData]);

  const monthOptions = [
    { value: 3, label: "Last 3 months" },
    { value: 6, label: "Last 6 months" },
    { value: 12, label: "Last 12 months" },
    { value: 24, label: "Last 24 months" },
  ];

  // Fetch financial summary for a specific month
  const fetchFinancialSummary = async (month: string) => {
    setLoading(true);
    try {
      console.log("Fetching summary for month:", month);
      const response = await api.post<{
        data: FinancialSummary;
      }>(ApiRoutes.getMonthlyFinancialSummary.path, { month }, {
        authenticate: ApiRoutes.getMonthlyFinancialSummary.authenticate,
      } as CustomAxiosRequestConfig);
      console.log("Fetched summary:", response);
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      setLoading(false);
    }
  };

  // Generate/update financial summary for a specific month
  const generateFinancialSummary = async () => {
    setIsUpdating(true);
    try {
      await api.post(
        ApiRoutes.generateFinancialSummary.path,
        { month: selectedMonth },
        {
          authenticate: ApiRoutes.generateFinancialSummary.authenticate,
        } as CustomAxiosRequestConfig
      );

      toast.success("Financial summary updated successfully");
      fetchFinancialSummary(selectedMonth);
    } catch (error) {
      console.error("Error updating financial summary:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        tableContainerRef.current;
      setHasScrolledRight(scrollLeft > 0);
      setHasMoreToScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async (monthCount: number) => {
    setLoading(true);
    try {
      // Generate array of months to request
      const monthsArray = [];
      for (let i = 0; i < monthCount; i++) {
        const monthDate = dayjs().subtract(i, "month").format("YYYY-MM");
        monthsArray.push(monthDate);
      }

      // Sort chronologically
      monthsArray.sort();

      // Call the API endpoint
      const response = await api.post(
        ApiRoutes.getFinancialSummaryForGraph.path,
        { months: monthsArray },
        {
          authenticate: ApiRoutes.getFinancialSummaryForGraph.authenticate,
        } as CustomAxiosRequestConfig
      );

      const formattedData = (response as { data: MonthlyData[] }).data.map(
        (item) => ({
          month: item.month,
          totalLoansIssued: item.totalLoansIssued,
          totalPrincipalLent: Number(item.totalPrincipalLent),
          totalUpfrontDeductions: Number(item.totalUpfrontDeductions),
          newBorrowersThisMonth: item.newBorrowersThisMonth,
        })
      );

      setHistoricalData(formattedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(typeof amount === "string" ? parseInt(amount) : amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMM YYYY");
  };

  // Handle month change in filter
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    fetchFinancialSummary(month);
    setShowFilterModal(false);
  };

  // Download financial report
  const downloadFinancialReport = () => {
    if (!summary) return;

    setIsDownloading(true);

    try {
      // Create CSV content
      const csvContent = [
        ["Financial Report - " + formatDate(selectedMonth)],
        ["Generated on", new Date().toLocaleString()],
        [""],
        ["Metric", "Value"],
        ["Total Capital", formatCurrency(summary.totalCapital)],
        ["Pending Loans", formatCurrency(summary.pendingLoanAmount)],
        ["Idle Capital", formatCurrency(summary.idleCapital)],
        [
          "Total Loans",
          summary.activeLoansCount +
            summary.closedLoansCount +
            summary.defaultedLoansCount,
        ],
        [""],
        ["Monthly Performance"],
        ["Principal Lent", formatCurrency(summary.totalPrincipalLent)],
        ["Profit", formatCurrency(summary.totalUpfrontDeductions)],
        ["Loans Issued", summary.totalLoansIssued],
        ["New Borrowers", summary.newBorrowersThisMonth],
        [""],
        ["Loan Status"],
        ["Active Loans", summary.activeLoansCount],
        ["Closed Loans", summary.closedLoansCount],
        ["Defaulted Loans", summary.defaultedLoansCount],
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Financial-Report-(${selectedMonth}).csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMonthFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthsToShow(Number(e.target.value));
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (part: number, total: number): number => {
    if (!total) return 0;
    return Math.min(Math.round((part / total) * 100), 100);
  };

  // Calculate loan distribution percentages
  const calculateLoanDistribution = () => {
    if (!summary) return { active: 0, closed: 0, defaulted: 0 };

    const total =
      summary.activeLoansCount +
      summary.closedLoansCount +
      summary.defaultedLoansCount;
    if (!total) return { active: 0, closed: 0, defaulted: 0 };

    return {
      active: Math.round((summary.activeLoansCount / total) * 100),
      closed: Math.round((summary.closedLoansCount / total) * 100),
      defaulted: Math.round((summary.defaultedLoansCount / total) * 100),
    };
  };

  const loanDistribution = calculateLoanDistribution();

  if (loading) {
    return (
      <div className='flex flex-col h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#670FC5]'></div>
        <p className='mt-4 text-gray-600'>Loading financial summary...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner - Keeping this intact as requested */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-6'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Financial Summary</h1>
          <p className='text-sm opacity-80'>
            Track your lending performance and metrics
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Calendar size={16} className='mr-2' />
              <span>{formatDate(selectedMonth)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions */}
      <div className='px-4 mb-6 flex justify-between items-center'>
        <button
          onClick={() => setShowFilterModal(true)}
          className='bg-white shadow-md rounded-lg px-4 py-2.5 flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors'
        >
          <Filter size={16} />
          <span>Filter</span>
          <ChevronDown size={14} />
        </button>

        <div className='flex gap-2'>
          <button
            onClick={generateFinancialSummary}
            disabled={isUpdating}
            className='bg-[#670FC5] shadow-md rounded-lg px-4 py-2.5 flex items-center gap-2 text-white hover:bg-[#5a0eb0] transition-colors'
          >
            {isUpdating ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            ) : (
              <RefreshCw size={16} />
            )}
            <span>Update</span>
          </button>
          <button
            onClick={downloadFinancialReport}
            disabled={isDownloading}
            className='bg-white shadow-md rounded-lg px-3 py-2.5 flex items-center text-gray-700 hover:bg-gray-50 transition-colors'
          >
            {isDownloading ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700'></div>
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Capital Overview - Redesigned Card with Modern UI */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-xl shadow-md overflow-hidden'>
          <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-medium text-gray-800 flex items-center'>
              <Landmark className='mr-2 text-[#670FC5]' size={18} />
              Capital Overview
            </h3>
            <span className='text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full'>
              Overview
            </span>
          </div>

          <div className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='bg-[#F0EBFE] p-3 rounded-lg'>
                  <CircleDollarSign size={22} className='text-[#670FC5]' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Total Capital</p>
                  <h4 className='text-xl font-bold'>
                    {summary ? formatCurrency(summary.totalCapital) : "₹0"}
                  </h4>
                </div>
              </div>
            </div>

            <div className='mt-6 space-y-4'>
              {/* Capital Distribution */}
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm text-gray-500'>Pending Loans</span>
                  <span className='text-sm font-medium'>
                    {summary ? formatCurrency(summary.pendingLoanAmount) : "₹0"}
                  </span>
                </div>
                <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-amber-400 rounded-full'
                    style={{
                      width: `${
                        summary
                          ? calculatePercentage(
                              parseInt(summary.pendingLoanAmount),
                              parseInt(summary.totalCapital)
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm text-gray-500'>Idle Capital</span>
                  <span className='text-sm font-medium'>
                    {summary ? formatCurrency(summary.idleCapital) : "₹0"}
                  </span>
                </div>
                <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-green-400 rounded-full'
                    style={{
                      width: `${
                        summary
                          ? calculatePercentage(
                              parseInt(summary.idleCapital),
                              parseInt(summary.totalCapital)
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Cards - Redesigned with a new elegant approach */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-xl shadow-md'>
          <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-medium text-gray-800 flex items-center'>
              <BarChart4 className='mr-2 text-[#670FC5]' size={18} />
              Monthly Performance
            </h3>
            <button
              title='Info'
              onClick={() => setShowInfoModal(true)}
              className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
            >
              <Info size={16} className='text-gray-500' />
            </button>
          </div>

          <div className='grid grid-cols-2 gap-4 p-4'>
            {/* Principal Lent - Modern card design */}
            <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='bg-blue-100 p-2 rounded-lg'>
                  <Briefcase size={16} className='text-blue-600' />
                </div>
                <p className='text-sm font-medium text-blue-600'>
                  Principal Lent
                </p>
              </div>
              <h4 className='text-xl font-bold'>
                {summary ? formatCurrency(summary.totalPrincipalLent) : "₹0"}
              </h4>
              <div className='flex items-center mt-2'>
                <Activity size={14} className='text-blue-400 mr-1' />
                <span className='text-xs text-blue-600'>This month</span>
              </div>
            </div>

            {/* Profit - Modern card design */}
            <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='bg-green-100 p-2 rounded-lg'>
                  <Diamond size={16} className='text-green-600' />
                </div>
                <p className='text-sm font-medium text-green-600'>Profit</p>
              </div>
              <h4 className='text-xl font-bold'>
                {summary
                  ? formatCurrency(summary.totalUpfrontDeductions)
                  : "₹0"}
              </h4>
              <div className='flex items-center mt-2'>
                <Activity size={14} className='text-green-400 mr-1' />
                <span className='text-xs text-green-600'>This month</span>
              </div>
            </div>

            {/* Loans Issued - Modern card design */}
            <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='bg-purple-100 p-2 rounded-lg'>
                  <ArrowRightCircle size={16} className='text-purple-600' />
                </div>
                <p className='text-sm font-medium text-purple-600'>
                  Loans Issued
                </p>
              </div>
              <h4 className='text-xl font-bold'>
                {summary ? summary.totalLoansIssued : "0"}
              </h4>
              <div className='flex items-center mt-2'>
                <Activity size={14} className='text-purple-400 mr-1' />
                <span className='text-xs text-purple-600'>This month</span>
              </div>
            </div>

            {/* New Borrowers - Modern card design */}
            <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='bg-amber-100 p-2 rounded-lg'>
                  <Users size={16} className='text-amber-600' />
                </div>
                <p className='text-sm font-medium text-amber-600'>
                  New Borrowers
                </p>
              </div>
              <h4 className='text-xl font-bold'>
                {summary ? summary.newBorrowersThisMonth : "0"}
              </h4>
              <div className='flex items-center mt-2'>
                <Activity size={14} className='text-amber-400 mr-1' />
                <span className='text-xs text-amber-600'>This month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Status - Redesigned with modern visualization */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-xl shadow-md'>
          <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-medium text-gray-800 flex items-center'>
              <BarChart2 className='mr-2 text-[#670FC5]' size={18} />
              Loan Status
            </h3>
            <span className='text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full'>
              {summary
                ? summary.activeLoansCount +
                  summary.closedLoansCount +
                  summary.defaultedLoansCount
                : 0}{" "}
              Loans
            </span>
          </div>

          <div className='p-4'>
            {/* Elegant visualization using colored segments */}
            <div className='mb-4 h-3 bg-gray-100 rounded-full overflow-hidden flex'>
              <div
                className='bg-blue-500 h-full'
                style={{ width: `${loanDistribution.active}%` }}
              ></div>
              <div
                className='bg-green-500 h-full'
                style={{ width: `${loanDistribution.closed}%` }}
              ></div>
              <div
                className='bg-red-500 h-full'
                style={{ width: `${loanDistribution.defaulted}%` }}
              ></div>
            </div>

            <div className='grid grid-cols-3 gap-2'>
              {/* Active Loans */}
              <div className='p-2 bg-blue-50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 rounded-full bg-blue-500 mr-2'></div>
                    <p className='text-sm text-gray-700'>Active</p>
                  </div>
                </div>
                <p className='text-lg font-bold text-blue-800'>
                  {summary ? summary.activeLoansCount : "0"}
                </p>
              </div>

              {/* Closed Loans */}
              <div className='p-2 bg-green-50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 rounded-full bg-green-500 mr-2'></div>
                    <p className='text-sm text-gray-700'>Closed</p>
                  </div>
                </div>
                <p className='text-lg font-bold text-green-800'>
                  {summary ? summary.closedLoansCount : "0"}
                </p>
              </div>

              {/* Defaulted Loans */}
              <div className='p-2 bg-red-50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 rounded-full bg-red-500 mr-2'></div>
                    <p className='text-sm text-gray-700'>Defaulted</p>
                  </div>
                </div>
                <p className='text-lg font-bold text-red-800'>
                  {summary ? summary.defaultedLoansCount : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Overview - Replacing charts with a cleaner tabular view */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-xl shadow-md'>
          <div className='px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
            <h3 className='font-medium text-gray-800 flex items-center'>
              <CalendarRange className='mr-2 text-[#670FC5]' size={18} />
              Historical Overview
            </h3>

            <div className='flex items-center bg-gray-50 rounded-lg px-3 py-1.5'>
              <label
                htmlFor='monthFilter'
                className='text-sm text-gray-600 mr-2 whitespace-nowrap'
              >
                Time period:
              </label>
              <select
                id='monthFilter'
                value={monthsToShow}
                onChange={handleMonthFilterChange}
                className='text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium'
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className='p-8 flex justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500'></div>
            </div>
          ) : historicalData.length > 0 ? (
            <div className='relative'>
              {/* This creates the scrollable container with a fixed height */}
              <div className='overflow-x-auto max-h-96'>
                <table className='w-full table-auto border-collapse'>
                  <thead>
                    <tr>
                      {/* First column has special styling to make it stick */}
                      <th className='sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200'>
                        Month
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]'>
                        Loans Issued
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]'>
                        New Borrowers
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]'>
                        Principal Lent
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]'>
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {historicalData.map((item, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        {/* First column has special styling to make it stick */}
                        <td className='sticky left-0 z-10 bg-white border-r border-gray-200 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800'>
                          {formatDate(item.month)}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700'>
                          {item.totalLoansIssued}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700'>
                          {item.newBorrowersThisMonth}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700'>
                          {formatCurrency(item.totalPrincipalLent)}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700'>
                          {formatCurrency(item.totalUpfrontDeductions)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-gray-50 border-t-2 border-gray-200'>
                      {/* First column has special styling to make it stick */}
                      <td className='sticky left-0 z-10 bg-gray-50 border-r border-gray-200 px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800'>
                        Totals
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-800'>
                        {historicalData.reduce(
                          (sum, item) => sum + item.totalLoansIssued,
                          0
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-800'>
                        {historicalData.reduce(
                          (sum, item) => sum + item.newBorrowersThisMonth,
                          0
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-800'>
                        {formatCurrency(
                          historicalData.reduce(
                            (sum, item) => sum + item.totalPrincipalLent,
                            0
                          )
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-800'>
                        {formatCurrency(
                          historicalData.reduce(
                            (sum, item) => sum + item.totalUpfrontDeductions,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Shadow indicators for horizontal scroll */}
              <div
                className='absolute pointer-events-none inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent opacity-0 transition-opacity duration-300'
                style={{ opacity: hasScrolledRight ? "1" : "0" }}
              ></div>
              <div
                className='absolute pointer-events-none inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent opacity-0 transition-opacity duration-300'
                style={{ opacity: hasMoreToScroll ? "1" : "0" }}
              ></div>
            </div>
          ) : (
            <div className='p-8 text-center text-gray-500'>
              No historical data available
            </div>
          )}
        </div>
      </div>

      {/* Redesigned Last Updated Section - More elegant and compact */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-xl shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='bg-gray-100 p-3 rounded-full'>
              <Clock size={18} className='text-gray-600' />
            </div>
            <div>
              <p className='text-xs text-gray-500'>Last updated</p>
              <p className='text-sm font-medium'>
                {summary && summary.updatedAt
                  ? dayjs(summary.updatedAt).format("DD MMM YYYY, hh:mm A")
                  : "Never"}
              </p>
            </div>
          </div>

          <button
            onClick={generateFinancialSummary}
            disabled={isUpdating}
            className='w-full bg-gradient-to-r from-[#670FC5] to-[#5a0eb0] rounded-lg py-2.5 flex items-center justify-center gap-2 text-white text-sm hover:opacity-90 transition-all shadow-sm'
          >
            {isUpdating ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            ) : (
              <RefreshCw size={14} />
            )}
            <span>Update Now</span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center'>
          <div className='bg-white rounded-t-2xl sm:rounded-xl w-full max-w-md overflow-hidden animate-slide-up'>
            <div className='p-4 border-b flex items-center justify-between'>
              <h3 className='font-medium text-lg'>Select Month</h3>
              <button
                title='Close'
                onClick={() => setShowFilterModal(false)}
                className='p-1.5 hover:bg-gray-100 rounded-full'
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom date input section */}
            <div className='p-4 border-b'>
              <label
                htmlFor='custom-month'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Custom Month
              </label>
              <div className='flex items-center gap-2'>
                <input
                  title='Custom Month'
                  type='month'
                  id='custom-month'
                  className='flex-1 border border-gray-300 rounded-lg p-2 text-sm'
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMonthChange(e.target.value);
                      setShowFilterModal(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const customMonthInput = document.getElementById(
                      "custom-month"
                    ) as HTMLInputElement | null;
                    const customMonth = customMonthInput
                      ? customMonthInput.value
                      : null;
                    if (customMonth) {
                      handleMonthChange(customMonth);
                      setShowFilterModal(false);
                    }
                  }}
                  className='bg-[#670FC5] text-white rounded-lg py-2 px-4 text-sm'
                >
                  Apply
                </button>
              </div>
            </div>

            <div className='p-4 max-h-80 overflow-y-auto'>
              {/* Generate months for the past 2 years */}
              {Array.from({ length: 24 }).map((_, i) => {
                const monthDate = dayjs().subtract(i, "month");
                const month = monthDate.format("YYYY-MM");
                const formattedMonth = monthDate.format("MMMM YYYY");
                return (
                  <button
                    key={month}
                    onClick={() => {
                      handleMonthChange(month);
                      setShowFilterModal(false);
                    }}
                    className={`w-full text-left py-3 px-4 rounded-lg mb-1 flex items-center ${
                      selectedMonth === month
                        ? "bg-[#670FC5] text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Calendar size={16} className='mr-3' />
                    {formattedMonth}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center'>
          <div className='bg-white rounded-t-2xl sm:rounded-xl w-full max-w-md overflow-hidden animate-slide-up'>
            <div className='p-4 border-b flex items-center justify-between'>
              <h3 className='font-medium text-lg'>About Monthly Performance</h3>
              <button
                title='Close'
                onClick={() => setShowInfoModal(false)}
                className='p-1.5 hover:bg-gray-100 rounded-full'
              >
                <X size={18} />
              </button>
            </div>
            <div className='p-4'>
              <div className='flex items-center mb-4'>
                <Info className='text-blue-500 mr-3' size={20} />
                <p className='text-sm text-gray-600'>
                  Monthly performance metrics show your lending activities and
                  results for the selected month.
                </p>
              </div>

              <div className='space-y-4'>
                <div className='border-l-2 border-blue-200 pl-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>
                    Principal Lent
                  </h4>
                  <p className='text-sm text-gray-600'>
                    The total amount of money lent to borrowers during this
                    month.
                  </p>
                </div>

                <div className='border-l-2 border-green-200 pl-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>Profit</h4>
                  <p className='text-sm text-gray-600'>
                    Total upfront deductions and fees collected from loans
                    issued this month.
                  </p>
                </div>

                <div className='border-l-2 border-purple-200 pl-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>
                    Loans Issued
                  </h4>
                  <p className='text-sm text-gray-600'>
                    The number of new loans approved and disbursed during this
                    month.
                  </p>
                </div>

                <div className='border-l-2 border-amber-200 pl-3'>
                  <h4 className='font-medium text-gray-800 mb-1'>
                    New Borrowers
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Number of first-time borrowers who received loans this
                    month.
                  </p>
                </div>
              </div>

              <div className='mt-6 bg-gray-50 p-3 rounded-lg'>
                <div className='flex items-center'>
                  <AlertCircle className='text-amber-500 mr-2' size={16} />
                  <p className='text-xs text-gray-600'>
                    Metrics are calculated based on the loans initiated during
                    the selected month only.
                  </p>
                </div>
              </div>

              <div className='mt-4 flex justify-end'>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className='bg-[#670FC5] text-white px-4 py-2 rounded-lg text-sm'
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add a floating action button for quick update */}
      <button
        onClick={generateFinancialSummary}
        disabled={isUpdating}
        className='fixed right-6 bottom-6 bg-[#670FC5] text-white shadow-lg rounded-full p-4 hover:bg-[#5a0eb0] transition-colors'
        title='Update Financial Summary'
      >
        {isUpdating ? (
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
        ) : (
          <Sparkles size={20} />
        )}
      </button>
    </div>
  );
};

export default FinancialSummary;
