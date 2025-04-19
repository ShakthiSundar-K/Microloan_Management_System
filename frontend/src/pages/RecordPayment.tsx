import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Pen,
  Phone,
  MapPin,
  Wallet,
  Clock,
  ArrowLeft,
  Check,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api from "../service/ApiService";
import { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

const RecordPayment = () => {
  const { borrowerId, loanId } = useParams();

  const location = useLocation();
  const { name, phoneNumber, address, pendingAmount, dueDate, amountToPay } =
    location.state;
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amountToPay);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentAmount(e.target.value);
  };

  const handlePaymentSubmit = () => {
    setShowConfirmation(true);
  };

  const confirmPayment = async () => {
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      if (!borrowerId || !loanId) {
        console.error("Missing route params");
        toast.error("Params are missing. Please try again.");
        setIsLoading(false);
        return;
      }
      console.log("borrowerId:", borrowerId);
      console.log("loanId:", loanId);
      const path = ApiRoutes.recordPayment.path
        .replace(":borrowerId", borrowerId)
        .replace(":loanId", loanId);
      console.log("API Path:", path);
      console.log("Payment Amount:", paymentAmount);

      await api.post(path, { amountPaid: paymentAmount }, {
        authenticate: ApiRoutes.recordPayment.authenticate,
      } as CustomAxiosRequestConfig);
      setIsLoading(false);
      toast.success("Payment recorded successfully!");
      navigate("/");
    } catch {
      toast.error("Error recording payment. Please try again.");
      setIsLoading(false);
    }
  };

  const cancelPayment = () => {
    setShowConfirmation(false);
  };

  return (
    <div className='flex flex-col h-full pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white p-4 relative'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={20} />
        </button>

        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Record Payment</h1>
          <p className='text-sm opacity-80'>
            Complete the transaction details below
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm'>
              Payment Due Today
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 bg-gray-50 p-4'>
        {/* Borrower Info Card */}
        <div className='bg-white rounded-lg shadow mb-4 overflow-hidden'>
          <div className='border-b border-gray-100 p-4'>
            <h2 className='text-lg font-bold text-gray-800'>{name}</h2>
            <p className='text-gray-500 text-sm'>Borrower Details</p>
          </div>

          <div className='p-4 space-y-4'>
            <div className='flex items-center'>
              <Phone size={18} className='text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Phone Number</p>
                <p className='font-medium'>{phoneNumber}</p>
              </div>
            </div>

            <div className='flex items-center'>
              <MapPin size={18} className='text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Address</p>
                <p className='font-medium'>{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Details Card */}
        <div className='bg-white rounded-lg shadow mb-4'>
          <div className='border-b border-gray-100 p-4'>
            <h2 className='text-lg font-bold text-gray-800'>
              Loan Information
            </h2>
          </div>

          <div className='p-4 space-y-4'>
            <div className='flex items-center'>
              <Wallet size={18} className='text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Pending Amount</p>
                <p className='font-medium'>₹{pendingAmount}</p>
              </div>
            </div>

            <div className='flex items-center'>
              <Clock size={18} className='text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Loan Due Date</p>
                <p className='font-medium'>{formatDate(dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Amount Card */}
        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='border-b border-gray-100 p-4'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-bold text-gray-800'>
                Payment Amount
              </h2>
              <button
                title='edit amount'
                onClick={handleEditToggle}
                className='p-2 text-[#670FC5] rounded-full hover:bg-purple-50'
              >
                <Pen size={16} />
              </button>
            </div>
          </div>

          <div className='p-4'>
            <div className='flex items-center justify-center'>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                  ₹ :
                </span>
                {isEditing ? (
                  <input
                    title='Enter amount to pay'
                    type='number'
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    className='pl-6 pr-3 py-3 text-xl font-bold text-center border-2 border-[#670FC5] rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-purple-200'
                    autoFocus
                  />
                ) : (
                  <div className='pl-6 pr-3 py-3 text-xl font-bold bg-gray-50 rounded-lg w-40 text-center'>
                    {paymentAmount}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className='mt-3 text-center'>
                <button
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  className='bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm flex items-center mx-auto'
                >
                  <Check size={16} className='mr-1' />
                  Confirm Amount
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePaymentSubmit}
          disabled={isLoading}
          className={`w-full py-3 ${
            isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-[#670FC5]"
          } hover:bg-purple-700 text-white font-medium rounded-full transition-colors flex items-center justify-center`}
        >
          <span className='flex items-center gap-2'>
            {isLoading ? (
              <>
                <span>Processing Payment...</span>
                {/* This is where LoadingSpinner would be placed */}
                <div className='h-4 w-4 text-white'>
                  {/* LoadingSpinner placeholder */}
                </div>
              </>
            ) : (
              "Record Payment"
            )}
          </span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-lg max-w-sm w-full p-6'>
            <h3 className='text-lg font-bold mb-4'>Confirm Payment</h3>
            <p className='mb-6'>
              Are you sure you want to record a payment of{" "}
              <span className='font-bold'>₹{paymentAmount}</span> from{" "}
              <span className='font-bold'>{name}</span>?
            </p>
            <div className='flex gap-3'>
              <button
                onClick={cancelPayment}
                className='flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className='flex-1 py-2 bg-[#670FC5] hover:bg-purple-700 text-white rounded-lg'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordPayment;
