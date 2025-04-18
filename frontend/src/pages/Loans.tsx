import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  X,
  ArrowLeft,
  Search,
  UserRound,
  Wallet,
  Calendar,
  Clock,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api from "../service/ApiService";
import { toast } from "react-hot-toast";

const Loans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [filterOptions, setFilterOptions] = useState({
    status: "",
    minPrincipalAmt: "",
    maxPrincipalAmt: "",
    minPendingAmt: "",
    maxPendingAmt: "",
    dueDate: "",
    daysToRepay: [],
  });

  // Days of the week for filter
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch loans on component mount
  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch loans based on filters
  const fetchLoans = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get(ApiRoutes.filterLoans.path, {
        params: filters,
        authenticate: ApiRoutes.filterLoans.authenticate,
      });

      setLoans(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch loans");
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle day selection in filter
  const toggleDaySelection = (day) => {
    setFilterOptions((prev) => {
      const currentDays = [...prev.daysToRepay];
      if (currentDays.includes(day)) {
        return {
          ...prev,
          daysToRepay: currentDays.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          daysToRepay: [...currentDays, day],
        };
      }
    });
  };

  // Apply filters
  const applyFilters = () => {
    fetchLoans(filterOptions);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      status: "",
      minPrincipalAmt: "",
      maxPrincipalAmt: "",
      minPendingAmt: "",
      maxPendingAmt: "",
      dueDate: "",
      daysToRepay: [],
    });
  };

  // Handle filter toggle
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter loans based on search query
  const filteredLoans = loans.filter(
    (loan) =>
      loan.borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrower.phoneNumber.includes(searchQuery)
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Navigate to loan details
  const goToLoanDetails = (loan) => {
    navigate(`/loan/${loan.loanId}`, { state: loan });
  };

  return (
    <div className='flex flex-col h-full pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white p-4 relative'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
        </button>

        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Manage Loans</h1>
          <p className='text-sm opacity-80'>
            View and filter all active and past loans
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className='bg-white shadow-md p-4 sticky top-0 z-10'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search
              size={18}
              className='absolute left-3 top-2.5 text-gray-400'
            />
            <input
              type='text'
              placeholder='Search borrower name or phone...'
              value={searchQuery}
              onChange={handleSearch}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
            />
          </div>
          <button
            onClick={handleFilterToggle}
            className='p-2.5 bg-[#670FC5] text-white rounded-lg flex items-center justify-center'
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 bg-gray-50 p-4'>
        {loading ? (
          <div className='flex justify-center items-center h-40'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#670FC5]'></div>
          </div>
        ) : filteredLoans.length > 0 ? (
          <div className='space-y-4'>
            {filteredLoans.map((loan) => (
              <div
                key={loan.loanId}
                onClick={() => goToLoanDetails(loan)}
                className='bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-[#F3EFFC] p-2 rounded-full'>
                      <UserRound size={20} className='text-[#670FC5]' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-800'>
                        {loan.borrower.name}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {loan.borrower.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      loan.status
                    )}`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div className='flex items-center gap-2'>
                    <Wallet size={16} className='text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>Principal</p>
                      <p className='font-medium'>₹{loan.principalAmount}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Wallet size={16} className='text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>Pending</p>
                      <p className='font-medium'>₹{loan.pendingAmount}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar size={16} className='text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>Issue Date</p>
                      <p className='font-medium'>{formatDate(loan.issuedAt)}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock size={16} className='text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>Due Date</p>
                      <p className='font-medium'>{formatDate(loan.dueDate)}</p>
                    </div>
                  </div>
                </div>

                <div className='mt-4 pt-3 border-t border-gray-100'>
                  <p className='text-xs text-gray-500 mb-2'>Repayment Days</p>
                  <div className='flex flex-wrap gap-1'>
                    {loan.daysToRepay.map((day) => (
                      <span
                        key={day}
                        className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded'
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-40 text-gray-500'>
            <AlertCircle size={40} className='mb-2' />
            <p className='text-lg font-medium'>No loans found</p>
            <p className='text-sm'>
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4'>
          <div className='bg-white rounded-t-xl w-full max-w-md transform transition-transform duration-300 ease-out'>
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h3 className='font-bold text-lg'>Filter Loans</h3>
              <button
                title='filter close'
                onClick={handleFilterToggle}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-4 max-h-[70vh] overflow-y-auto'>
              {/* Loan Status */}
              <div className='mb-5'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Loan Status
                </label>
                <select
                  value={filterOptions.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                >
                  <option value=''>All Statuses</option>
                  <option value='Active'>Active</option>
                  <option value='Overdue'>Overdue</option>
                  <option value='Completed'>Completed</option>
                </select>
              </div>

              {/* Principal Amount Range */}
              <div className='mb-5 border-t border-gray-100 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Principal Amount Range
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
                        value={filterOptions.minPrincipalAmt}
                        onChange={(e) =>
                          handleFilterChange("minPrincipalAmt", e.target.value)
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
                        value={filterOptions.maxPrincipalAmt}
                        onChange={(e) =>
                          handleFilterChange("maxPrincipalAmt", e.target.value)
                        }
                        placeholder='Any'
                        className='w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Amount Range */}
              <div className='mb-5 border-t border-gray-100 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pending Amount Range
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
                        value={filterOptions.minPendingAmt}
                        onChange={(e) =>
                          handleFilterChange("minPendingAmt", e.target.value)
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
                        value={filterOptions.maxPendingAmt}
                        onChange={(e) =>
                          handleFilterChange("maxPendingAmt", e.target.value)
                        }
                        placeholder='Any'
                        className='w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className='mb-5 border-t border-gray-100 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Due Before Date
                </label>
                <input
                  type='date'
                  value={filterOptions.dueDate}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value)
                  }
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#670FC5] focus:border-[#670FC5]'
                />
              </div>

              {/* Repayment Days */}
              <div className='mb-5 border-t border-gray-100 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Repayment Days
                </label>
                <div className='grid grid-cols-4 gap-2'>
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      onClick={() => toggleDaySelection(day)}
                      className={`flex items-center justify-center p-2 border rounded-md cursor-pointer text-center ${
                        filterOptions.daysToRepay.includes(day)
                          ? "bg-[#670FC5] text-white border-[#670FC5]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  Select days to filter loans that require repayment on all
                  selected days
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex p-4 border-t border-gray-200'>
              <button
                onClick={resetFilters}
                className='flex-1 py-2.5 mr-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors'
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
      )}
    </div>
  );
};

export default Loans;
