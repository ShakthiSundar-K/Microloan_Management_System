import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Calendar, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";
import toast from "react-hot-toast";

interface Borrower {
  name: string;
  phoneNumber: string;
  address: string;
}

interface Loan {
  pendingAmount: string;
  dueDate: string;
}

interface Repayment {
  loanId: string;
  borrowerId: string;
  amountToPay: string;
  dueDate: string;
  status: string;
  loan?: Loan; // Made optional to handle missing loan data
  borrower: Borrower;
}

interface GetTodayRepaymentsResponse {
  message: string;
  data: Repayment[];
}

export default function CollectPayment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const getRepayments = async (search: string = "") => {
    try {
      const response = await api.get<GetTodayRepaymentsResponse>(
        ApiRoutes.todayRepayments.path,
        {
          authenticate: ApiRoutes.todayRepayments.authenticate,
        } as CustomAxiosRequestConfig
      );

      // Filter out repayments that don't have loan data and apply search filter
      const validRepayments = response.data.filter((repayment: Repayment) => {
        // Check if loan data exists
        if (!repayment.loan) {
          console.warn(`Repayment ${repayment.loanId} is missing loan data`);
          return false;
        }

        // Apply search filter
        return repayment.borrower.name
          .toLowerCase()
          .includes(search.toLowerCase());
      });

      setRepayments(validRepayments);
    } catch (error) {
      console.error("Error fetching repayments:", error);
    }
  };

  useEffect(() => {
    getRepayments();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    getRepayments(value);
  };

  const handleRecordPayment = (repayment: Repayment) => {
    // Additional safety check before navigation
    if (!repayment.loan) {
      toast.error("Loan data is missing. Cannot record payment.");
      return;
    }

    navigate(`/record-payment/${repayment.borrowerId}/${repayment.loanId}`, {
      state: {
        name: repayment.borrower.name,
        phoneNumber: repayment.borrower.phoneNumber,
        address: repayment.borrower.address,
        pendingAmount: repayment.loan.pendingAmount,
        dueDate: repayment.loan.dueDate,
        amountToPay: repayment.amountToPay,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className='flex flex-col h-full pb-20'>
      {/* Enhanced Banner */}
      <div className='bg-[#002866] text-white px-4 pb-6 pt-4 relative'>
        <button
          title='GO BACK'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </button>

        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Today's Repayments</h1>
          <p className='text-sm opacity-80'>{today}</p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Calendar size={16} className='mr-2' />
              <span>{repayments.length} payments due today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-auto bg-gray-50'>
        {/* Search Bar */}
        <div className='sticky top-0 z-10 bg-gray-50 p-4 shadow-sm'>
          <div className='relative'>
            <span className='absolute left-3 top-2.5 text-gray-400'>
              <Search size={20} />
            </span>
            <input
              type='text'
              placeholder='Search by borrower name...'
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent transition duration-200'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Repayments List */}
        <div className='p-4 pt-2'>
          {repayments.length === 0 ? (
            <div className='text-center py-10 text-gray-500 flex flex-col items-center'>
              <div className='bg-gray-100 rounded-full p-4 mb-4'>
                <Calendar size={32} className='text-gray-400' />
              </div>
              <p className='font-medium'>No repayments found</p>
              <p className='text-sm text-gray-400 mt-1'>
                Try a different search term
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {repayments.map((repayment, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200'
                >
                  <div className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <h2 className='text-lg font-bold text-gray-800'>
                        {repayment.borrower.name}
                      </h2>
                      <div className='bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center'>
                        <span className='mr-1'>₹</span>
                        {repayment.amountToPay}
                      </div>
                    </div>

                    <div className='space-y-2 text-gray-600 text-sm mb-4'>
                      <div className='flex items-start'>
                        <div className='w-24 flex-shrink-0 font-medium text-gray-500'>
                          Phone:
                        </div>
                        <div>{repayment.borrower.phoneNumber}</div>
                      </div>
                      <div className='flex items-start'>
                        <div className='w-24 flex-shrink-0 font-medium text-gray-500'>
                          Address:
                        </div>
                        <div>{repayment.borrower.address}</div>
                      </div>
                      <div className='flex items-start'>
                        <div className='w-24 flex-shrink-0 font-medium text-gray-500'>
                          Pending:
                        </div>
                        <div className='font-medium text-gray-700'>
                          {/* Safe access to loan.pendingAmount with fallback */}
                          ₹{repayment.loan?.pendingAmount ?? "N/A"}
                        </div>
                      </div>
                      {new Date(repayment.dueDate).toDateString() ===
                        new Date().toDateString() && (
                        <div className='mt-1 flex items-center text-green-600 text-xs'>
                          <Check size={14} className='mr-1' />
                          <span>Due today</span>
                        </div>
                      )}
                    </div>

                    <button
                      title='Record Payment'
                      onClick={() => handleRecordPayment(repayment)}
                      className='w-full bg-[#670FC5] hover:bg-[#5a0cb0] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center'
                    >
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
