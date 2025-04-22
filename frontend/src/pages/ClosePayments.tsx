/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookX,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

interface CollectionStatus {
  amountCollectedToday: string;
  amountSupposedToBeCollectedToday: string;
}

interface getCollectionStatusResponse {
  message: string;
  data: CollectionStatus;
}

const ClosePayments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [success, setSuccess] = useState(false);
  const [todaysStats, setTodaysStats] = useState({
    collectedAmount: 0,
    pendingAmount: 0,
    totalExpectedAmount: 0,
  });

  // Fetch today's stats
  useEffect(() => {
    const fetchTodaysStats = async () => {
      try {
        const response = await api.get<getCollectionStatusResponse>(
          ApiRoutes.todayCollectionStatus.path,
          {
            authenticate: ApiRoutes.todayCollectionStatus.authenticate,
          } as CustomAxiosRequestConfig
        );

        const collectedAmount = Number(response.data.amountCollectedToday) || 0;
        const totalExpectedAmount =
          Number(response.data.amountSupposedToBeCollectedToday) || 0;

        // Calculate pending amount (cannot be negative)
        const pendingAmount = Math.max(
          0,
          Number(totalExpectedAmount) - collectedAmount
        );

        setTodaysStats({
          collectedAmount,
          pendingAmount,
          totalExpectedAmount,
        });
      } catch (error) {
        console.error("Error fetching today's stats:", error);
      }
    };
    fetchTodaysStats();
  }, []);

  const handleClosePayments = async () => {
    if (confirmText.toLowerCase() !== "close") {
      toast.error('Please type "close" to confirm');
      return;
    }

    setLoading(true);
    try {
      await api.post(ApiRoutes.closePayments.path, {}, {
        authenticate: ApiRoutes.closePayments.authenticate,
      } as CustomAxiosRequestConfig);

      setLoading(false);
      setSuccess(true);
      toast.success("Payments closed successfully for today!");

      // Reset confirmation modal
      setShowConfirmation(false);
      setConfirmText("");
    } catch (error: any) {
      setLoading(false);
      setShowConfirmation(false);
      toast.error(error.response?.data?.message || "Failed to close payments");
      console.error("Error closing payments:", error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Close Daily Payments</h1>
          <p className='text-sm opacity-80'>
            Finalize your collection day and update system
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <BookX size={16} className='mr-2' />
              <span>End-of-Day Settlement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='px-4 -mt-6'>
        {success ? (
          <div className='bg-white rounded-lg shadow-md p-6 mb-4'>
            <div className='flex flex-col items-center justify-center py-8'>
              <div className='bg-green-100 rounded-full p-3 mb-4'>
                <CheckCircle size={32} className='text-green-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Payments Closed Successfully!
              </h3>
              <p className='text-gray-600 text-center mb-6'>
                All payments have been processed for today. Unpaid repayments
                have been marked as missed.
              </p>
              <div className='bg-blue-50 rounded-lg p-4 w-full mb-6'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-blue-800 font-medium'>
                    Total Collected Today:
                  </span>
                  <span className='text-blue-800 font-bold'>
                    ₹{todaysStats.collectedAmount.toLocaleString()}
                  </span>
                </div>
                <div className='h-px bg-blue-200 my-2'></div>
                <div className='flex justify-between items-center'>
                  <span className='text-blue-800 font-medium'>
                    Date Closed:
                  </span>
                  <span className='text-blue-800'>{getCurrentDate()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className='bg-[#670FC5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors'
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                <Clock size={20} className='text-[#670FC5]' />
              </div>
              <h2 className='font-semibold text-gray-800'>
                End of Day Closing
              </h2>
            </div>

            {/* Current Date and Time */}
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <div className='flex justify-between items-center mb-3'>
                <div className='flex items-center text-gray-700'>
                  <Calendar size={18} className='mr-2 text-gray-500' />
                  <span>Current Date:</span>
                </div>
                <span className='font-medium'>{getCurrentDate()}</span>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center text-gray-700'>
                  <Clock size={18} className='mr-2 text-gray-500' />
                  <span>Current Time:</span>
                </div>
                <span className='font-medium'>{getCurrentTime()}</span>
              </div>
            </div>

            {/* Today's Stats */}
            <div className='bg-blue-50 rounded-lg p-4 mb-6'>
              <h3 className='text-blue-800 font-medium mb-3 flex items-center'>
                <Info size={16} className='mr-2' />
                Today's Collection Summary
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                <div className='col-span-2 flex justify-between items-center mb-2'>
                  <span className='text-blue-800'>Expected Collection:</span>
                  <span className='text-blue-800 font-medium'>
                    ₹{todaysStats.totalExpectedAmount.toLocaleString()}
                  </span>
                </div>
                <div className='col-span-2 h-px bg-blue-200 my-1'></div>
                <div className='col-span-2 flex justify-between items-center mb-2'>
                  <span className='text-blue-800'>Amount Collected:</span>
                  <span className='text-green-700 font-bold'>
                    ₹{todaysStats.collectedAmount.toLocaleString()}
                  </span>
                </div>
                <div className='col-span-2 h-px bg-blue-200 my-1'></div>
                <div className='col-span-2 flex justify-between items-center'>
                  <span className='text-blue-800'>Pending Amount:</span>
                  <span
                    className={`font-bold ${
                      todaysStats.pendingAmount > 0
                        ? "text-amber-600"
                        : "text-green-700"
                    }`}
                  >
                    ₹{todaysStats.pendingAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className='bg-amber-50 rounded-lg p-4 mb-6 flex items-start gap-3'>
              <AlertTriangle
                size={20}
                className='text-amber-600 mt-0.5 flex-shrink-0'
              />
              <div>
                <p className='text-sm text-amber-800 font-medium'>
                  What happens when you close payments?
                </p>
                <ul className='text-xs text-amber-700 mt-2 space-y-1.5'>
                  <li>
                    • All unpaid repayments due today will be marked as "Missed"
                  </li>
                  <li>
                    • Today's collection amount will be added to capital
                    tracking
                  </li>
                  <li>
                    • You will not be able to record more payments for today
                  </li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>

            {/* Close Button */}
            <div className='pt-4 border-t border-gray-100'>
              <button
                onClick={() => setShowConfirmation(true)}
                className='w-full bg-[#670FC5] text-white py-3 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors flex items-center justify-center'
              >
                <BookX size={18} className='mr-2' />
                Close Payments for Today
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info Card */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
            <Info size={16} className='mr-2 text-[#670FC5]' />
            About Payment Closing
          </h3>

          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>Close payments once at the end of each business day</p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                This helps maintain accurate financial records and follow-ups
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                After closing, you can still view today's transactions in the
                reports section
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                For any corrections after closing, please contact your
                administrator
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-lg shadow-lg max-w-md w-full p-5'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Confirm Action
              </h3>
              <button
                title='Close Confirmation'
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                }}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={20} />
              </button>
            </div>

            <div className='bg-red-50 rounded-lg p-4 mb-4 flex items-start gap-3'>
              <AlertCircle
                size={20}
                className='text-red-600 mt-0.5 flex-shrink-0'
              />
              <div>
                <p className='text-sm text-red-800 font-medium'>
                  This action cannot be reversed
                </p>
                <p className='text-xs text-red-700 mt-1'>
                  Once closed, all unpaid repayments due today will be marked as
                  missed, and you'll need to wait until tomorrow to collect new
                  payments.
                </p>
              </div>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Type "close" to confirm:
              </label>
              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'close' here"
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
              />
            </div>

            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                }}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleClosePayments}
                disabled={loading || confirmText.toLowerCase() !== "close"}
                className={`px-4 py-2 rounded-lg text-white flex items-center ${
                  confirmText.toLowerCase() === "close"
                    ? "bg-[#670FC5] hover:bg-[#5a0db1]"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className='animate-spin mr-2' />
                    Processing...
                  </>
                ) : (
                  "Confirm & Close Payments"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosePayments;
