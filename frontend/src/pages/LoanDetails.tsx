import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Wallet,
  Calendar,
  Clock,
  Filter,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  ChevronDown,
  Trash2,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon } from "lucide-react";

// Define TypeScript interfaces
interface Borrower {
  borrowerId: string;
  name: string;
  phoneNumber: string;
  address: string;
}

interface Loan {
  loanId: string;
  principalAmount: string;
  pendingAmount: string;
  issuedAt: string;
  status: string;
  dueDate: string;
  daysToRepay: string[];
  borrower: Borrower;
}

interface RepaymentDate {
  dueDate: string;
  paidDate: string | null;
  amountPaid: number;
}

interface RepaymentDates {
  Paid: RepaymentDate[];
  Unpaid: RepaymentDate[];
  Missed: RepaymentDate[];
  Paid_Late: RepaymentDate[];
  Paid_in_Advance: RepaymentDate[];
  Paid_Partial: RepaymentDate[];
  Paid_Partial_Late: RepaymentDate[];
  Paid_Partial_Advance: RepaymentDate[];
}

interface RepaymentStats {
  totalRepayments: number;
  Paid: number;
  Unpaid: number;
  Missed: number;
  Paid_Late: number;
  Paid_in_Advance: number;
  Paid_Partial: number;
  Paid_Partial_Late: number;
  Paid_Partial_Advance: number;
}

interface LoanDetails {
  loan: Loan;
  repaymentStats: RepaymentStats;
  repaymentDates: RepaymentDates;
}

interface getLoanDetailsResponse {
  message: string;
  data: LoanDetails;
}

const LoanDetails: React.FC = () => {
  const navigate = useNavigate();
  const { loanId } = useParams<{ loanId: string }>();
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("Paid");
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateDetails, setShowDateDetails] = useState<boolean>(false);
  const [dateRepaymentInfo, setDateRepaymentInfo] =
    useState<RepaymentDate | null>(null);
  const [dateStatus, setDateStatus] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // All possible repayment statuses
  const repaymentStatuses = [
    "Paid",
    "Unpaid",
    "Missed",
    "Paid_Late",
    "Paid_in_Advance",
    "Paid_Partial",
    "Paid_Partial_Late",
    "Paid_Partial_Advance",
  ];

  // Status display names and colors
  const statusConfig = {
    Paid: {
      label: "Paid",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle size={16} className='text-green-600' />,
    },
    Unpaid: {
      label: "Unpaid",
      color: "bg-gray-100 text-gray-800",
      icon: <Clock3 size={16} className='text-gray-600' />,
    },
    Missed: {
      label: "Missed",
      color: "bg-red-100 text-red-800",
      icon: <XCircle size={16} className='text-red-600' />,
    },
    Paid_Late: {
      label: "Paid Late",
      color: "bg-orange-100 text-orange-800",
      icon: <Clock3 size={16} className='text-orange-600' />,
    },
    Paid_in_Advance: {
      label: "Paid in Advance",
      color: "bg-blue-100 text-blue-800",
      icon: <Check size={16} className='text-blue-600' />,
    },
    Paid_Partial: {
      label: "Paid Partial",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Check size={16} className='text-yellow-600' />,
    },
    Paid_Partial_Late: {
      label: "Paid Partial Late",
      color: "bg-amber-100 text-amber-800",
      icon: <Clock3 size={16} className='text-amber-600' />,
    },
    Paid_Partial_Advance: {
      label: "Paid Partial Advance",
      color: "bg-teal-100 text-teal-800",
      icon: <Check size={16} className='text-teal-600' />,
    },
  };

  // Fetch loan details on component mount
  useEffect(() => {
    if (loanId) {
      fetchLoanDetails(loanId);
    }
  }, [loanId]);

  // Fetch loan details from API
  const fetchLoanDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get<getLoanDetailsResponse>(
        ApiRoutes.getLoanDetails.path.replace(":loanId", id),
        {
          authenticate: ApiRoutes.getLoanDetails.authenticate,
        } as CustomAxiosRequestConfig
      );

      setLoanDetails(response.data);
      setLoading(false);
      toast.success("Loan details fetched successfully");
    } catch {
      toast.error("Failed to fetch loan details");
      setLoading(false);
    }
  };

  // Function to find repayment by date and get status
  const findRepaymentByDate = (date: string) => {
    let status = null;
    let repayment = null;

    // Check all statuses to find the repayment for this date
    for (const statusKey of repaymentStatuses) {
      const foundRepayment = repaymentDates[
        statusKey as keyof RepaymentDates
      ]?.find(
        (r) =>
          new Date(r.dueDate).toDateString() === new Date(date).toDateString()
      );

      if (foundRepayment) {
        status = statusKey;
        repayment = foundRepayment;
        break;
      }
    }

    return { status, repayment };
  };

  // Close date details popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowDateDetails(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    if (!loanDetails) return 0;

    const { repaymentStats } = loanDetails;
    const totalPaid =
      repaymentStats.Paid +
      repaymentStats.Paid_Late +
      repaymentStats.Paid_in_Advance +
      repaymentStats.Paid_Partial +
      repaymentStats.Paid_Partial_Late +
      repaymentStats.Paid_Partial_Advance;

    return Math.round((totalPaid / repaymentStats.totalRepayments) * 100);
  };

  // Generate status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle status filter selection
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowStatusFilter(false);
  };

  // Close loan action
  const handleCloseLoan = async () => {
    if (confirmText !== loanDetails?.loan.borrower.name) return;

    setProcessingAction(true);
    try {
      await api.patch(
        ApiRoutes.closeLoan.path.replace(":loanId", loanId || ""),
        {},
        {
          authenticate: ApiRoutes.closeLoan.authenticate,
        } as CustomAxiosRequestConfig
      );

      toast.success("Loan closed successfully");
      setShowCloseModal(false);
      // Refresh loan details
      if (loanId) {
        fetchLoanDetails(loanId);
      }
    } catch {
      toast.error("Failed to close loan");
    } finally {
      setProcessingAction(false);
      setConfirmText("");
    }
  };

  // Delete loan action
  const handleDeleteLoan = async () => {
    if (confirmText !== loanDetails?.loan.borrower.name) return;

    setProcessingAction(true);
    try {
      await api.delete(
        ApiRoutes.deleteLoan.path.replace(":loanId", loanId || ""),
        {
          authenticate: ApiRoutes.deleteLoan.authenticate,
        } as CustomAxiosRequestConfig
      );

      toast.success("Loan deleted successfully");
      navigate("/loans");
    } catch {
      toast.error("Failed to delete loan");
      setProcessingAction(false);
      setConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#670FC5]'></div>
        <p className='mt-4 text-gray-600'>Loading loan details...</p>
      </div>
    );
  }

  if (!loanDetails) {
    return (
      <div className='flex flex-col h-full items-center justify-center pb-20'>
        <AlertCircle size={48} className='text-red-500 mb-4' />
        <p className='text-lg font-medium text-gray-800'>Loan not found</p>
        <p className='mt-2 text-gray-600'>
          The requested loan could not be found
        </p>
        <button
          onClick={() => navigate("/loans")}
          className='mt-6 bg-[#670FC5] text-white px-6 py-2 rounded-lg font-medium'
        >
          Back to Loans
        </button>
      </div>
    );
  }

  const { loan, repaymentStats, repaymentDates } = loanDetails;
  const completionPercentage = calculateCompletion();

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/loans")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Loan Details</h1>
          <p className='text-sm opacity-80'>
            View detailed information and repayment schedule
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Wallet size={16} className='mr-2' />
              <span>{completionPercentage}% Complete</span>
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
              <h2 className='font-semibold text-gray-800'>
                {loan.borrower.name}
              </h2>
              <p className='text-sm text-gray-500'>
                {loan.borrower.phoneNumber}
              </p>
            </div>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                loan.status
              )}`}
            >
              {loan.status}
            </span>
          </div>

          <div className='text-sm text-gray-600 border-t border-gray-100 pt-3'>
            <p>Address: {loan.borrower.address}</p>
          </div>
        </div>
      </div>

      {/* Loan Details Card */}
      <div className='px-4 mb-4'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-4'>Loan Information</h3>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-green-50 p-1.5 rounded-full flex items-center justify-center w-6 h-6'>
                <Wallet size={14} className='text-green-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Principal</p>
                <p className='font-medium text-gray-800'>
                  {formatCurrency(loan.principalAmount)}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 justify-end'>
              <div className='bg-orange-50 p-1.5 rounded-full flex items-center justify-center w-6 h-6'>
                <Wallet size={14} className='text-orange-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Pending</p>
                <p className='font-medium text-gray-800'>
                  {formatCurrency(loan.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-blue-50 p-1.5 rounded-full flex items-center justify-center w-6 h-6'>
                <Calendar size={14} className='text-blue-500' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Issued Date</p>
                <p className='text-sm'>{formatDate(loan.issuedAt)}</p>
              </div>
            </div>

            <div className='flex items-center gap-2 justify-end'>
              <div className='bg-purple-50 p-1.5 rounded-full flex items-center justify-center w-6 h-6'>
                <Clock size={14} className='text-purple-500' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Due Date</p>
                <p className='text-sm'>{formatDate(loan.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Repayment days */}
          <div className='border-t border-gray-100 pt-3'>
            <p className='text-xs text-gray-500 mb-2'>Repayment Days</p>
            <div className='flex flex-wrap gap-1'>
              {loan.daysToRepay.map((day) => (
                <span
                  key={day}
                  className='text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'
                >
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Statistics Card */}
      <div className='px-4 mb-4'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-4'>
            Repayment Statistics
          </h3>

          {/* Progress bar */}
          <div className='mb-6'>
            <div className='flex justify-between mb-1 text-xs'>
              <span className='text-gray-600'>Repayment Progress</span>
              <span className='font-medium'>{completionPercentage}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2.5'>
              <div
                className='bg-gradient-to-r from-[#670FC5] to-[#8E3BFF] h-2.5 rounded-full transition-all duration-500 ease-in-out'
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Total Repayments</p>
              <p className='font-semibold text-lg'>
                {repaymentStats.totalRepayments}
              </p>
            </div>
            <div className='bg-green-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Paid On Time</p>
              <p className='font-semibold text-lg text-green-700'>
                {repaymentStats.Paid}
              </p>
            </div>
            <div className='bg-blue-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Paid in Advance</p>
              <p className='font-semibold text-lg text-blue-700'>
                {repaymentStats.Paid_in_Advance}
              </p>
            </div>
            <div className='bg-orange-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Paid Late</p>
              <p className='font-semibold text-lg text-orange-700'>
                {repaymentStats.Paid_Late}
              </p>
            </div>
            <div className='bg-yellow-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Partial Payments</p>
              <p className='font-semibold text-lg text-yellow-700'>
                {repaymentStats.Paid_Partial}
              </p>
            </div>
            <div className='bg-amber-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Partial Late</p>
              <p className='font-semibold text-lg text-amber-700'>
                {repaymentStats.Paid_Partial_Late}
              </p>
            </div>
            <div className='bg-teal-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Partial Advance</p>
              <p className='font-semibold text-lg text-teal-700'>
                {repaymentStats.Paid_Partial_Advance}
              </p>
            </div>
            <div className='bg-red-50 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Missed</p>
              <p className='font-semibold text-lg text-red-700'>
                {repaymentStats.Missed}
              </p>
            </div>
            <div className='bg-gray-50 col-span-2 p-3 rounded-lg'>
              <p className='text-xs text-gray-500'>Unpaid</p>
              <p className='font-semibold text-lg'>{repaymentStats.Unpaid}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Schedule Card */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-medium text-gray-800'>Repayment Schedule</h3>

            <div className='flex items-center gap-2'>
              {/* Calendar button */}
              <button
                onClick={() => setShowDateDetails(!showDateDetails)}
                title='View repayment by date'
                className='flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors'
              >
                <CalendarIcon size={14} />
                <span className='hidden sm:inline'>Check Date</span>
              </button>

              {/* Status filter button */}
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className='flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors'
              >
                <Filter size={14} />
                <span>
                  {
                    statusConfig[selectedStatus as keyof typeof statusConfig]
                      .label
                  }
                </span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Repayment list */}
          <div className='space-y-3 max-h-60 overflow-y-auto pt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {repaymentDates[selectedStatus as keyof RepaymentDates]?.length >
            0 ? (
              repaymentDates[selectedStatus as keyof RepaymentDates].map(
                (repayment, index) => (
                  <div
                    key={index}
                    className='bg-gray-50 p-3 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          statusConfig[
                            selectedStatus as keyof typeof statusConfig
                          ].color
                        }`}
                      >
                        {
                          statusConfig[
                            selectedStatus as keyof typeof statusConfig
                          ].icon
                        }
                      </div>
                      <div>
                        <p className='text-sm font-medium'>
                          Due: {formatDate(repayment.dueDate)}
                        </p>
                        {repayment.paidDate && (
                          <p className='text-xs text-gray-500'>
                            Paid: {formatDate(repayment.paidDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        {formatCurrency(
                          String(
                            repayment.amountPaid > 0
                              ? repayment.amountPaid
                              : 450
                          )
                        )}
                      </p>
                      {selectedStatus.includes("Partial") && (
                        <p className='text-xs text-orange-600'>Partial</p>
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
                <AlertCircle size={24} className='mb-2' />
                <p>
                  No{" "}
                  {
                    statusConfig[selectedStatus as keyof typeof statusConfig]
                      .label
                  }{" "}
                  repayments found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='px-4 mb-4'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={() => setShowCloseModal(true)}
            disabled={loan.status === "Closed" || loan.status === "Completed"}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm border ${
              loan.status === "Closed" || loan.status === "Completed"
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            }`}
          >
            <LockKeyhole size={18} />
            Close Loan
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className='flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          >
            <Trash2 size={18} />
            Delete Loan
          </button>
        </div>
      </div>

      {/* Status Filter Modal */}
      {showStatusFilter && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 pb-8'>
          <div className='bg-white rounded-xl w-full max-w-xs overflow-hidden shadow-xl animate-fade-in'>
            <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-medium text-lg'>Filter by Status</h3>
              <button
                title='Filter'
                onClick={() => setShowStatusFilter(false)}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className='py-2'>
              {repaymentStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between ${
                    selectedStatus === status ? "bg-[#F3EFFC]" : ""
                  } hover:bg-[#F3EFFC10] transition-colors`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        statusConfig[status as keyof typeof statusConfig].color
                      }`}
                    >
                      {statusConfig[status as keyof typeof statusConfig].icon}
                    </div>
                    <span>
                      {statusConfig[status as keyof typeof statusConfig].label}
                    </span>
                  </div>
                  {selectedStatus === status && (
                    <Check size={16} className='text-[#670FC5]' />
                  )}
                </button>
              ))}
            </div>

            <div className='px-4 py-3 border-t border-gray-200'>
              <button
                onClick={() => setShowStatusFilter(false)}
                className='w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Loan Modal */}
      {showCloseModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 pb-8'>
          <div className='bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in'>
            <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-medium text-lg'>Close Loan</h3>
              <button
                title='Close Filter'
                onClick={() => {
                  setShowCloseModal(false);
                  setConfirmText("");
                }}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className='p-4'>
              <div className='flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg text-blue-800'>
                <LockKeyhole size={20} className='text-blue-600' />
                <p className='text-sm'>
                  Closing this loan will mark it as completed and prevent any
                  further changes or repayments.
                </p>
              </div>

              <p className='text-sm text-gray-600 mb-4'>
                To confirm, please type the borrower's name:{" "}
                <span className='font-semibold'>{loan.borrower.name}</span>
              </p>

              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type borrower's name"
                className='w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
              />

              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    setShowCloseModal(false);
                    setConfirmText("");
                  }}
                  className='flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseLoan}
                  className={`flex-1 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                    confirmText === loan.borrower.name
                      ? "hover:bg-blue-700"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={
                    confirmText !== loan.borrower.name || processingAction
                  }
                >
                  {processingAction ? (
                    <span className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Processing...
                    </span>
                  ) : (
                    "Close Loan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Loan Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 pb-8'>
          <div className='bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in'>
            <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-medium text-lg'>Delete Loan</h3>
              <button
                title='Delete Loan'
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className='p-4'>
              <div className='flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg text-red-800'>
                <AlertTriangle size={20} className='text-red-600' />
                <p className='text-sm'>
                  This action cannot be undone. This will permanently delete the
                  loan and all associated repayment records.
                </p>
              </div>

              <p className='text-sm text-gray-600 mb-4'>
                To confirm, please type the borrower's name:{" "}
                <span className='font-semibold'>{loan.borrower.name}</span>
              </p>

              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type borrower's name"
                className='w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />

              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmText("");
                  }}
                  className='flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLoan}
                  className={`flex-1 py-2 bg-red-600 text-white rounded-lg transition-colors ${
                    confirmText === loan.borrower.name
                      ? "hover:bg-red-700"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={
                    confirmText !== loan.borrower.name || processingAction
                  }
                >
                  {processingAction ? (
                    <span className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Processing...
                    </span>
                  ) : (
                    "Delete Loan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Date Details Modal */}
      {/* Date Details Modal */}
      {showDateDetails && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 pb-8'>
          <div
            ref={calendarRef}
            className='bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-fade-in'
          >
            <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='font-medium text-lg'>Check Repayment Date</h3>
              <button
                title='Close'
                onClick={() => setShowDateDetails(false)}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className='p-4'>
              <p className='text-sm text-gray-600 mb-4'>
                Select a date to view repayment information
              </p>

              <input
                title='Select a date'
                type='date'
                onChange={(e) => {
                  const { status, repayment } = findRepaymentByDate(
                    e.target.value
                  );
                  setSelectedDate(e.target.value);
                  setDateStatus(status);
                  setDateRepaymentInfo(repayment);
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
              />

              {selectedDate && dateRepaymentInfo ? (
                <div className='mt-4 border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    {dateStatus &&
                      statusConfig[dateStatus as keyof typeof statusConfig] && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            statusConfig[
                              dateStatus as keyof typeof statusConfig
                            ].color
                          }`}
                        >
                          {
                            statusConfig[
                              dateStatus as keyof typeof statusConfig
                            ].icon
                          }
                        </div>
                      )}
                    <div>
                      <p className='font-medium'>
                        {dateStatus &&
                        statusConfig[dateStatus as keyof typeof statusConfig]
                          ? statusConfig[
                              dateStatus as keyof typeof statusConfig
                            ].label
                          : "Unknown Status"}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Due Date:</span>
                      <span className='font-medium'>
                        {formatDate(dateRepaymentInfo.dueDate)}
                      </span>
                    </div>

                    {dateRepaymentInfo.paidDate && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Paid Date:</span>
                        <span className='font-medium'>
                          {formatDate(dateRepaymentInfo.paidDate)}
                        </span>
                      </div>
                    )}

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Amount Due:</span>
                      <span className='font-medium'>
                        {formatCurrency("450")}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Amount Paid:</span>
                      <span
                        className={`font-medium ${
                          dateRepaymentInfo.amountPaid > 0 ? "" : "text-red-600"
                        }`}
                      >
                        {dateRepaymentInfo.amountPaid > 0
                          ? formatCurrency(String(dateRepaymentInfo.amountPaid))
                          : "₹0"}
                      </span>
                    </div>

                    {dateStatus &&
                      [
                        "Paid_Partial",
                        "Paid_Partial_Late",
                        "Paid_Partial_Advance",
                      ].includes(dateStatus) && (
                        <div className='mt-1 px-2 py-1 bg-yellow-50 rounded text-yellow-700 text-xs'>
                          Partial payment made
                        </div>
                      )}
                  </div>
                </div>
              ) : selectedDate ? (
                <div className='flex flex-col items-center justify-center py-6 text-gray-500'>
                  <AlertCircle size={24} className='mb-2' />
                  <p>No repayment found for this date</p>
                </div>
              ) : null}

              <div className='mt-4'>
                <button
                  onClick={() => setShowDateDetails(false)}
                  className='w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
