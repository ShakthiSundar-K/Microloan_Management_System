/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";
import toast from "react-hot-toast";

// interface Borrower {
//   borrowerId: string;
//   borrowerName: string;
// }

interface RepaymentItem {
  borrowerId: string;
  borrowerName?: string; // Make optional since it might be missing
  amountPaid: number;
}

interface LoanItem {
  loanId: string;
  principalAmount: number;
  issuedAt?: string;
  borrower?: {
    borrowerId: string;
    name: string;
  };
  // Backup fields in case the structure is different
  borrowerId?: string;
  borrowerName?: string;
}

interface GroupedHistory {
  [date: string]: (RepaymentItem | LoanItem)[];
}

interface getRepaymentHistoryResponse {
  message: string;
  data: GroupedHistory;
}

type FilterType = "24h" | "week" | "month" | "custom";

interface FilterOptions {
  filterType: FilterType;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"repayment" | "loan">("repayment");
  const [history, setHistory] = useState<GroupedHistory>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    filterType: "week",
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    minAmount: "",
    maxAmount: "",
  });

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Build query params based on selected filters
      const params = new URLSearchParams();

      params.append("filterType", filterOptions.filterType);

      if (filterOptions.filterType === "custom") {
        params.append("startDate", filterOptions.startDate);
        params.append("endDate", filterOptions.endDate);
      }

      if (filterOptions.minAmount) {
        params.append("minAmount", filterOptions.minAmount);
      }

      if (filterOptions.maxAmount) {
        params.append("maxAmount", filterOptions.maxAmount);
      }

      const endpoint =
        activeTab === "repayment"
          ? ApiRoutes.repaymentHistory.path
          : ApiRoutes.getLoanHistory.path;

      const auth =
        activeTab === "repayment"
          ? ApiRoutes.repaymentHistory.authenticate
          : ApiRoutes.getLoanHistory.authenticate;

      console.log(`Fetching from: ${endpoint}?${params.toString()}`);

      const response = await api.get<getRepaymentHistoryResponse>(
        `${endpoint}?${params.toString()}`,
        {
          authenticate: auth,
        } as CustomAxiosRequestConfig
      );

      console.log(`${activeTab} History Response:`, response.data);

      if (response.data) {
        // Handle different response structures
        if (activeTab === "repayment") {
          setHistory(response.data);
        } else {
          // For loan history, process the data
          const loanData = response.data.data || response.data;
          setHistory(
            processLoanHistory(
              loanData.filter(
                (item): item is LoanItem =>
                  "loanId" in item && "principalAmount" in item
              )
            )
          );
        }

        // Calculate total amount and total items
        let total = 0;
        let count = 0;

        if (activeTab === "repayment") {
          Object.values(response.data).forEach((items: any) => {
            items.forEach((item: RepaymentItem) => {
              total += Number(item.amountPaid);
              count += 1;
            });
          });
        } else {
          // For loan history
          const loanData = response.data.data || response.data;
          loanData
            .filter(
              (item): item is LoanItem =>
                "loanId" in item && "principalAmount" in item
            )
            .forEach((item: LoanItem) => {
              total += Number(item.principalAmount);
              count += 1;
            });
        }

        setTotalAmount(total);
        setTotalItems(count);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab} history!`);
      console.error("Fetch error:", error);
      setHistory({});
      setTotalAmount(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Process loan history data to group by date
  const processLoanHistory = (loanData: LoanItem[]) => {
    const groupedData: GroupedHistory = {};

    if (!loanData || !Array.isArray(loanData)) {
      console.error("Invalid loan data:", loanData);
      return {};
    }

    loanData.forEach((loan) => {
      // Extract the date from issuedAt field or current date as fallback
      // Adjust the field name based on your actual API response
      const loanDate = loan.issuedAt || new Date().toISOString();
      const date = new Date(loanDate).toISOString().split("T")[0];

      if (!groupedData[date]) {
        groupedData[date] = [];
      }

      groupedData[date].push(loan);
    });

    return groupedData;
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilterOptions((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchHistory();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilterOptions({
      filterType: "week",
      startDate: new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      minAmount: "",
      maxAmount: "",
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  const isYesterday = (dateString: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === yesterday.toISOString().split("T")[0];
  };

  const getDisplayDate = (dateString: string) => {
    if (isToday(dateString)) return "Today";
    if (isYesterday(dateString)) return "Yesterday";
    return formatDate(dateString);
  };

  const getFilterLabel = () => {
    switch (filterOptions.filterType) {
      case "24h":
        return "Last 24 Hours";
      case "week":
        return "Last Week";
      case "month":
        return "Last Month";
      case "custom":
        return "Custom Range";
      default:
        return "Last Week";
    }
  };

  // Helper function to safely get borrower name from different possible structures
  const getBorrowerName = (item: LoanItem | RepaymentItem) => {
    if (activeTab === "repayment") {
      // For repayment items
      return (item as RepaymentItem).borrowerName || "Unknown";
    } else {
      // For loan items
      const loanItem = item as LoanItem;
      if (loanItem.borrower && loanItem.borrower.name) {
        return loanItem.borrower.name;
      } else if (loanItem.borrowerName) {
        return loanItem.borrowerName;
      } else {
        return "Unknown";
      }
    }
  };

  // Helper function to get first letter for avatar
  const getBorrowerInitial = (item: LoanItem | RepaymentItem) => {
    const name = getBorrowerName(item);
    return name.charAt(0) || "?";
  };

  // Helper function to get amount based on type
  const getAmount = (item: any) => {
    if (activeTab === "repayment") {
      return item.amountPaid;
    } else {
      return item.principalAmount;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-6 pt-4 relative'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </button>

        <div className='text-center pt-6 pb-2'>
          <h1 className='text-xl font-bold mb-2'>
            {activeTab === "repayment" ? "Repayment History" : "Loan History"}
          </h1>
          <p className='text-sm opacity-80'>
            {activeTab === "repayment"
              ? "View all your payment records"
              : "View all your loan records"}
          </p>
        </div>

        <div className='mt-4 flex justify-between items-center'>
          <div className='bg-white/10 px-4 py-2 rounded-lg text-sm flex-1 mr-2'>
            <div className='text-sm opacity-80'>Total</div>
            <div className='text-lg font-bold'>
              ₹{totalAmount.toLocaleString()}
            </div>
          </div>
          <div className='bg-white/10 px-4 py-2 rounded-lg text-sm flex-1'>
            <div className='text-sm opacity-80'>
              {activeTab === "repayment" ? "Repayments" : "Loans"}
            </div>
            <div className='text-lg font-bold'>{totalItems}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-white border-b border-gray-200'>
        <div className='flex'>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "repayment"
                ? "text-[#670FC5] border-b-2 border-[#670FC5]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("repayment")}
          >
            Repayments
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "loan"
                ? "text-[#670FC5] border-b-2 border-[#670FC5]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("loan")}
          >
            Loans
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className='bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex justify-between items-center'>
        <div className='text-sm font-medium text-gray-600'>
          <span className='flex items-center'>
            <Clock size={16} className='mr-1.5 text-gray-400' />
            {getFilterLabel()}
          </span>
        </div>
        <button
          onClick={handleFilterToggle}
          className='flex items-center px-3 py-1.5 rounded-full text-[#670FC5] bg-purple-50 hover:bg-purple-100 text-sm font-medium transition-colors'
        >
          <Filter size={16} className='mr-1.5' />
          Filter
          <ChevronDown size={16} className='ml-1' />
        </button>
      </div>

      {/* Content Area - Ensure paddingBottom to prevent overlap with navbar */}
      <div className='flex-1 overflow-auto bg-gray-50 pb-20'>
        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <div className='animate-pulse flex flex-col items-center'>
              <div className='rounded-full bg-gray-200 h-12 w-12 mb-2.5'></div>
              <div className='w-24 h-4 bg-gray-200 rounded'></div>
            </div>
          </div>
        ) : Object.keys(history).length === 0 ? (
          <div className='flex flex-col items-center justify-center p-10 text-center'>
            <div className='bg-gray-100 rounded-full p-4 mb-4'>
              <Calendar size={32} className='text-gray-400' />
            </div>
            <h3 className='text-gray-700 font-medium mb-1'>
              No {activeTab === "repayment" ? "repayments" : "loans"} found
            </h3>
            <p className='text-gray-500 text-sm'>
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div>
            {Object.keys(history)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => (
                <div key={date} className='mb-4'>
                  <div className='sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 z-10'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-medium text-gray-700'>
                        {getDisplayDate(date)}
                      </h3>
                      <span className='text-sm text-gray-500'>
                        {history[date].length}{" "}
                        {activeTab === "repayment" ? "payments" : "loans"}
                      </span>
                    </div>
                  </div>

                  <div className='px-4'>
                    {history[date].map((item: any, index) => {
                      const isRepayment = activeTab === "repayment";
                      return (
                        <div
                          key={`${date}-${index}`}
                          className='py-3 border-b border-gray-100 flex justify-between items-center'
                        >
                          <div className='flex items-center'>
                            <div
                              className={`${
                                isRepayment
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              } rounded-full w-10 h-10 flex items-center justify-center mr-3 font-medium`}
                            >
                              {/* Use the safe getBorrowerInitial for both tabs */}
                              {getBorrowerInitial(item)}
                            </div>
                            <div>
                              <div className='font-medium text-gray-800'>
                                {getBorrowerName(item)}
                              </div>
                              {/* <div className='text-xs text-gray-500'>
                                {new Date(date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div> */}
                            </div>
                          </div>
                          <div
                            className={`font-medium ${
                              isRepayment ? "text-green-600" : "text-blue-600"
                            }`}
                          >
                            {isRepayment ? "+" : "-"}₹{getAmount(item)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl transform transition-transform duration-300 ease-out'>
            <div className='sticky top-0 bg-white flex justify-between items-center p-4 border-b border-gray-200 z-10'>
              <h3 className='font-bold text-lg'>
                Filter {activeTab === "repayment" ? "Repayments" : "Loans"}
              </h3>
              <button
                title='filter close'
                onClick={handleFilterToggle}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={20} />
              </button>
            </div>

            <div className='overflow-y-auto flex-1 p-4'>
              {/* Time Period */}
              <div className='mb-5'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Time Period
                </label>
                <div className='space-y-2'>
                  {[
                    { id: "24h", label: "Last 24 Hours" },
                    { id: "week", label: "Last Week" },
                    { id: "month", label: "Last Month" },
                    { id: "custom", label: "Custom Range" },
                  ].map((option) => (
                    <div key={option.id} className='flex items-center'>
                      <input
                        type='radio'
                        id={option.id}
                        name='filterType'
                        checked={filterOptions.filterType === option.id}
                        onChange={() =>
                          handleFilterChange(
                            "filterType",
                            option.id as FilterType
                          )
                        }
                        className='h-4 w-4 text-[#670FC5] focus:ring-[#670FC5]'
                      />
                      <label
                        htmlFor={option.id}
                        className='ml-2 block text-sm text-gray-700'
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {filterOptions.filterType === "custom" && (
                <div className='mb-5 border-t border-gray-100 pt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Custom Date Range
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Start Date
                      </label>
                      <input
                        title='start date'
                        type='date'
                        value={filterOptions.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        End Date
                      </label>
                      <input
                        title='end date'
                        type='date'
                        value={filterOptions.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Range */}
              <div className='mb-5 border-t border-gray-100 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Amount Range
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      Min Amount
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-2.5 text-gray-500'>
                        ₹
                      </span>
                      <input
                        type='number'
                        value={filterOptions.minAmount}
                        onChange={(e) =>
                          handleFilterChange("minAmount", e.target.value)
                        }
                        placeholder='0'
                        className='w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      Max Amount
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-2.5 text-gray-500'>
                        ₹
                      </span>
                      <input
                        type='number'
                        value={filterOptions.maxAmount}
                        onChange={(e) =>
                          handleFilterChange("maxAmount", e.target.value)
                        }
                        placeholder='Any'
                        className='w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='border-t border-gray-200 p-4 bg-white'>
              <div className='flex gap-3'>
                <button
                  onClick={resetFilters}
                  className='flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className='flex-1 py-2.5 bg-[#670FC5] hover:bg-[#5a0cb0] text-white font-medium rounded-lg transition-colors'
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
