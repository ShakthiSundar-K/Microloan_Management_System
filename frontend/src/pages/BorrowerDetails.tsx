/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Wallet,
  Filter,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Plus,
  CreditCard,
  BadgeAlert,
  BarChart3,
  MoreHorizontal,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  Info,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

// Define TypeScript interfaces
interface Borrower {
  borrowerId: string;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
}

interface GetBorrowersResponse {
  message: string;
  data: {
    borrowers: Borrower[];
    loanStats: LoanStats;
    activeLoans: ActiveLoan[];
    closedLoans: ActiveLoan[];
    defaultedLoans: ActiveLoan[];
  };
}

interface RepaymentStats {
  totalRepayments: number;
  paid: number;
  unpaid: number;
  missed: number;
  paidLate: number;
  paidInAdvance: number;
  paidPartial: number;
  paidPartialLate: number;
  paidPartialAdvance: number;
}

interface ActiveLoan {
  loanId: string;
  principalAmount: string;
  pendingAmount: string;
  dailyRepaymentAmount: string;
  repaymentStats: RepaymentStats;
}

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  defaultedLoans: number;
}

interface BorrowerDetails {
  borrower: Borrower;
  loanStats: LoanStats;
  activeLoans: ActiveLoan[];
  closedLoans: ActiveLoan[];
  defaultedLoans: ActiveLoan[];
}

const BorrowerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { borrowerId } = useParams<{ borrowerId: string }>();
  const [borrowerDetails, setBorrowerDetails] =
    useState<BorrowerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);
  const [showAmountFilter, setShowAmountFilter] = useState<boolean>(false);
  const [selectedLoanStatus, setSelectedLoanStatus] =
    useState<string>("Active");
  const [principalMinFilter, setPrincipalMinFilter] = useState<string>("");
  const [principalMaxFilter, setPrincipalMaxFilter] = useState<string>("");
  const [pendingMinFilter, setPendingMinFilter] = useState<string>("");
  const [pendingMaxFilter, setPendingMaxFilter] = useState<string>("");
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch borrower details on component mount
  useEffect(() => {
    if (borrowerId) {
      fetchBorrowerDetails(borrowerId);
    }
  }, [borrowerId]);

  // Apply filters when status or amount filters change
  useEffect(() => {
    if (borrowerDetails) {
      applyFilters();
    }
  }, [
    selectedLoanStatus,
    principalMinFilter,
    principalMaxFilter,
    pendingMinFilter,
    pendingMaxFilter,
    borrowerDetails,
  ]);

  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowStatusFilter(false);
        setShowAmountFilter(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch borrower details from API
  const fetchBorrowerDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get<GetBorrowersResponse>(
        ApiRoutes.getBorrowerInfo.path.replace(":borrowerId", id),
        {
          authenticate: ApiRoutes.getBorrowerInfo.authenticate,
        } as CustomAxiosRequestConfig
      );
      console.log(response.data);
      setBorrowerDetails(response.data);
      setFilteredLoans(response.data.activeLoans);
      setLoading(false);
      toast.success("Borrower details fetched successfully");
    } catch {
      toast.error("Failed to fetch borrower details");
      setLoading(false);
    }
  };

  // Delete borrower
  const deleteBorrower = async () => {
    if (!borrowerId) return;

    try {
      await api.delete(
        ApiRoutes.deleteBorrower.path.replace(":borrowerId", borrowerId),
        {
          authenticate: ApiRoutes.deleteBorrower.authenticate,
        } as CustomAxiosRequestConfig
      );
      toast.success("Borrower deleted successfully");
      navigate("/borrowers");
    } catch {
      toast.error("Failed to delete borrower");
    }
  };

  // Apply all active filters to loans list
  const applyFilters = () => {
    if (!borrowerDetails) return;

    let loansToFilter: ActiveLoan[] = [];

    // Select correct loan array based on status
    switch (selectedLoanStatus) {
      case "Active":
        loansToFilter = [...borrowerDetails.activeLoans];
        break;
      case "Closed":
        loansToFilter = [...borrowerDetails.closedLoans];
        break;
      case "Defaulted":
        loansToFilter = [...borrowerDetails.defaultedLoans];
        break;
      default:
        loansToFilter = [...borrowerDetails.activeLoans];
    }

    // Apply amount filters if present
    let filtered = loansToFilter;

    // Principal amount filter (min)
    if (principalMinFilter !== "") {
      filtered = filtered.filter(
        (loan) => parseInt(loan.principalAmount) >= parseInt(principalMinFilter)
      );
    }

    // Principal amount filter (max)
    if (principalMaxFilter !== "") {
      filtered = filtered.filter(
        (loan) => parseInt(loan.principalAmount) <= parseInt(principalMaxFilter)
      );
    }

    // Pending amount filter (min)
    if (pendingMinFilter !== "") {
      filtered = filtered.filter(
        (loan) => parseInt(loan.pendingAmount) >= parseInt(pendingMinFilter)
      );
    }

    // Pending amount filter (max)
    if (pendingMaxFilter !== "") {
      filtered = filtered.filter(
        (loan) => parseInt(loan.pendingAmount) <= parseInt(pendingMaxFilter)
      );
    }

    // Update filtered loans state
    setFilteredLoans(filtered);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseInt(amount));
  };

  // Calculate loan progress percentage
  const calculateProgress = (loan: ActiveLoan): number => {
    const { repaymentStats } = loan;
    const totalPaid =
      repaymentStats.paid +
      repaymentStats.paidLate +
      repaymentStats.paidInAdvance +
      repaymentStats.paidPartial +
      repaymentStats.paidPartialLate +
      repaymentStats.paidPartialAdvance;

    return Math.round((totalPaid / repaymentStats.totalRepayments) * 100);
  };

  // Handle status filter selection
  const handleStatusSelect = (status: string) => {
    setSelectedLoanStatus(status);
    setShowStatusFilter(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setPrincipalMinFilter("");
    setPrincipalMaxFilter("");
    setPendingMinFilter("");
    setPendingMaxFilter("");
    setSelectedLoanStatus("Active");
  };

  // Get appropriate status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      case "Defaulted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#670FC5]'></div>
        <p className='mt-4 text-gray-600'>Loading borrower details...</p>
      </div>
    );
  }

  if (!borrowerDetails) {
    return (
      <div className='flex flex-col h-full items-center justify-center pb-20'>
        <AlertCircle size={48} className='text-red-500 mb-4' />
        <p className='text-lg font-medium text-gray-800'>Borrower not found</p>
        <p className='mt-2 text-gray-600'>
          The requested borrower could not be found
        </p>
        <button
          onClick={() => navigate("/borrowers")}
          className='mt-6 bg-[#670FC5] text-white px-6 py-2 rounded-lg font-medium'
        >
          Back to Borrowers
        </button>
      </div>
    );
  }

  const { borrower, loanStats } = borrowerDetails;

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/borrowers")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Borrower Details</h1>
          <p className='text-sm opacity-80'>
            View detailed information and loan history
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <CreditCard size={16} className='mr-2' />
              <span>{loanStats.totalLoans} Total Loans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Borrower Card */}
      <div className='px-4 -mt-6'>
        <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
              <UserRound size={20} className='text-[#670FC5]' />
            </div>
            <div>
              <h2 className='font-semibold text-gray-800'>{borrower.name}</h2>
              <p className='text-sm text-gray-500'>{borrower.phoneNumber}</p>
            </div>
            <div className='ml-auto flex items-center gap-2'>
              <button
                onClick={() =>
                  navigate(`/borrowers/edit/${borrower.borrowerId}`)
                }
                className='bg-blue-50 p-2 rounded-full text-blue-600 hover:bg-blue-100'
                title='Edit Profile'
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className='bg-red-50 p-2 rounded-full text-red-600 hover:bg-red-100'
                title='Delete Borrower'
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3'>
            <div className='flex items-center gap-2'>
              <Phone size={14} className='text-gray-400' />
              <span>{borrower.phoneNumber}</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin size={14} className='text-gray-400' />
              <span>{borrower.address}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar size={14} className='text-gray-400' />
              <span>Joined on {formatDate(borrower.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Statistics Card */}
      <div className='px-4 mb-4'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-4'>Loan Statistics</h3>

          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-purple-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Total Loans</p>
              <p className='font-semibold text-lg text-purple-700'>
                {loanStats.totalLoans}
              </p>
            </div>
            <div className='bg-green-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Active Loans</p>
              <p className='font-semibold text-lg text-green-700'>
                {loanStats.activeLoans}
              </p>
            </div>
            <div className='bg-gray-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Closed Loans</p>
              <p className='font-semibold text-lg text-gray-700'>
                {loanStats.closedLoans}
              </p>
            </div>
            <div className='bg-red-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Defaulted Loans</p>
              <p className='font-semibold text-lg text-red-700'>
                {loanStats.defaultedLoans}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans List Card */}
      <div className='px-4 mb-6' ref={filterRef}>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-medium text-gray-800'>Loans</h3>

            <div className='flex items-center gap-2'>
              {/* Status filter button */}
              <button
                onClick={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowAmountFilter(false);
                }}
                className='flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors'
              >
                <BarChart3 size={14} />
                <span>Status: {selectedLoanStatus}</span>
                <ChevronDown size={14} />
              </button>

              {/* Amount filter button */}
              <button
                onClick={() => {
                  setShowAmountFilter(!showAmountFilter);
                  setShowStatusFilter(false);
                }}
                className='flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors'
              >
                <Filter size={14} />
                <span>Filter</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Status filter dropdown */}
          {showStatusFilter && (
            <div className='absolute z-30 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 left-1/2 transform -translate-x-1/2'>
              <div className='py-1'>
                {["Active", "Closed", "Defaulted"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-[#F3EFFC] transition-colors ${
                      selectedLoanStatus === status ? "bg-[#F3EFFC]" : ""
                    }`}
                  >
                    <span>{status}</span>
                    {selectedLoanStatus === status && (
                      <Check size={16} className='text-[#670FC5]' />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount filter dropdown */}
          {showAmountFilter && (
            <div className='absolute z-30 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-64 p-4 left-1/2 transform -translate-x-1/2'>
              <h4 className='font-medium mb-3 text-gray-800'>Filter Loans</h4>

              <div className='space-y-3'>
                <div>
                  <label className='text-sm text-gray-600 block mb-1'>
                    Principal Amount
                  </label>
                  <div className='flex flex-col gap-2'>
                    <input
                      type='number'
                      placeholder='Min'
                      value={principalMinFilter}
                      onChange={(e) => setPrincipalMinFilter(e.target.value)}
                      className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                    />
                    <input
                      type='number'
                      placeholder='Max'
                      value={principalMaxFilter}
                      onChange={(e) => setPrincipalMaxFilter(e.target.value)}
                      className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='text-sm text-gray-600 block mb-1'>
                    Pending Amount
                  </label>
                  <div className='flex flex-col gap-2'>
                    <input
                      type='number'
                      placeholder='Min'
                      value={pendingMinFilter}
                      onChange={(e) => setPendingMinFilter(e.target.value)}
                      className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                    />
                    <input
                      type='number'
                      placeholder='Max'
                      value={pendingMaxFilter}
                      onChange={(e) => setPendingMaxFilter(e.target.value)}
                      className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                    />
                  </div>
                </div>

                <div className='flex gap-2 pt-2'>
                  <button
                    onClick={() => {
                      resetFilters();
                      setShowAmountFilter(false);
                    }}
                    className='flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm'
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowAmountFilter(false)}
                    className='flex-1 py-2 bg-[#670FC5] hover:bg-[#5A0DB0] text-white rounded-lg transition-colors text-sm'
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {(principalMinFilter !== "" ||
            principalMaxFilter !== "" ||
            pendingMinFilter !== "" ||
            pendingMaxFilter !== "") && (
            <div className='flex flex-wrap gap-2 mb-3 bg-gray-50 p-2 rounded-lg'>
              <div className='text-xs text-gray-500 flex items-center'>
                <Filter size={12} className='mr-1' />
                Active filters:
              </div>

              <div className='flex flex-wrap gap-2 w-full'>
                {principalMinFilter !== "" && (
                  <div className='bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center'>
                    Principal Min: {formatCurrency(principalMinFilter)}
                    <button
                      title='principal-min-filter'
                      onClick={() => setPrincipalMinFilter("")}
                      className='ml-1 hover:text-blue-900'
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {principalMaxFilter !== "" && (
                  <div className='bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center'>
                    Principal Max: {formatCurrency(principalMaxFilter)}
                    <button
                      title='principal-max-filter'
                      onClick={() => setPrincipalMaxFilter("")}
                      className='ml-1 hover:text-blue-900'
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {pendingMinFilter !== "" && (
                  <div className='bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full flex items-center'>
                    Pending Min: {formatCurrency(pendingMinFilter)}
                    <button
                      title='pending-min-filter'
                      onClick={() => setPendingMinFilter("")}
                      className='ml-1 hover:text-green-900'
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {pendingMaxFilter !== "" && (
                  <div className='bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full flex items-center'>
                    Pending Max: {formatCurrency(pendingMaxFilter)}
                    <button
                      title='pending-max-filter'
                      onClick={() => setPendingMaxFilter("")}
                      className='ml-1 hover:text-green-900'
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={resetFilters}
                className='text-xs text-purple-700 hover:text-purple-900 font-medium ml-auto'
              >
                Clear All
              </button>
            </div>
          )}

          {/* Hint text for loan items */}
          <div className='flex items-center justify-center mb-3 text-xs text-gray-500 gap-1 bg-blue-50 py-1.5 rounded-lg'>
            <Info size={12} />
            <span>Tap on a loan to view detailed information</span>
          </div>

          {/* Loans list */}
          <div className='space-y-3 max-h-96 overflow-y-auto pt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan) => {
                const progressPercentage = calculateProgress(loan);
                return (
                  <div
                    key={loan.loanId}
                    className='bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                    onClick={() => navigate(`/loan-details/${loan.loanId}`)}
                  >
                    <div className='p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-[#F3EFFC] p-2 rounded-full'>
                            <Wallet size={16} className='text-[#670FC5]' />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              selectedLoanStatus
                            )}`}
                          >
                            {selectedLoanStatus}
                          </span>
                        </div>
                        <button
                          title='More Options'
                          onClick={(e) => {
                            e.stopPropagation();
                            // Additional actions
                          }}
                          className='p-1 hover:bg-gray-200 rounded-full'
                        >
                          <MoreHorizontal size={16} className='text-gray-500' />
                        </button>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-3'>
                        <div>
                          <p className='text-xs text-gray-500 mb-1'>
                            Principal
                          </p>
                          <p className='font-medium'>
                            {formatCurrency(loan.principalAmount)}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs text-gray-500 mb-1'>Pending</p>
                          <p className='font-medium'>
                            {formatCurrency(loan.pendingAmount)}
                          </p>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-3'>
                        <div>
                          <p className='text-xs text-gray-500 mb-1'>
                            Daily Repayment
                          </p>
                          <p className='font-medium'>
                            {formatCurrency(loan.dailyRepaymentAmount)}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs text-gray-500 mb-1'>Progress</p>
                          <p className='font-medium'>{progressPercentage}%</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-[#670FC5] to-[#8E3BFF] h-2 rounded-full transition-all duration-500 ease-in-out'
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      {/* Repayment stats summary */}
                      <div className='flex justify-between mt-3 text-xs'>
                        <div className='flex items-center'>
                          <div className='w-2 h-2 rounded-full bg-green-500 mr-1'></div>
                          <span className='text-gray-600'>
                            {loan.repaymentStats.paid} paid
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <div className='w-2 h-2 rounded-full bg-yellow-500 mr-1'></div>
                          <span className='text-gray-600'>
                            {loan.repaymentStats.unpaid} unpaid
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <div className='w-2 h-2 rounded-full bg-red-500 mr-1'></div>
                          <span className='text-gray-600'>
                            {loan.repaymentStats.missed} missed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-gray-500'>
                {selectedLoanStatus === "Active" &&
                principalMinFilter === "" &&
                principalMaxFilter === "" &&
                pendingMinFilter === "" &&
                pendingMaxFilter === "" ? (
                  <>
                    <AlertCircle size={24} className='mb-2' />
                    <p>No loans found for this borrower</p>
                    <button
                      onClick={() =>
                        navigate(`/loans/new?borrowerId=${borrower.borrowerId}`)
                      }
                      className='mt-4 bg-[#670FC5] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center'
                    >
                      <Plus size={16} className='mr-1' />
                      Create New Loan
                    </button>
                  </>
                ) : (
                  <>
                    <BadgeAlert size={24} className='mb-2' />
                    <p>No loans match your current filters</p>
                    <button
                      onClick={resetFilters}
                      className='mt-2 text-[#670FC5] underline text-sm'
                    >
                      Clear all filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons at bottom */}
      <div className='px-4 mb-8'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={() => window.open(`tel:${borrower.phoneNumber}`)}
            className='flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          >
            <Phone size={18} />
            Call Borrower
          </button>
          <button
            onClick={() => navigate(`/borrowers/edit/${borrower.borrowerId}`)}
            className='flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm bg-[#F3EFFC] text-[#670FC5] border border-[#E3D9F9] hover:bg-[#EBE3F9]'
          >
            <Edit size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-sm'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Delete Borrower
            </h3>
            <div className='bg-red-50 p-3 rounded-lg mb-4 text-red-800 text-sm'>
              <div className='flex items-start'>
                <AlertCircle className='mr-2 flex-shrink-0 mt-0.5' size={16} />
                <p>
                  This action cannot be undone and will delete all associated
                  loan records. To confirm, please type{" "}
                  <strong>"{borrower.name}"</strong> below.
                </p>
              </div>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='confirmName'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Confirmation
              </label>
              <input
                type='text'
                id='confirmName'
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder={`Type ${borrower.name}`}
              />
            </div>

            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setConfirmationText("");
                }}
                className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBorrower();
                  setShowDeleteConfirmation(false);
                  setConfirmationText("");
                }}
                disabled={confirmationText !== borrower.name}
                className={`px-4 py-2 ${
                  confirmationText === borrower.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                } text-white rounded-lg transition-colors text-sm font-medium`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerDetails;
