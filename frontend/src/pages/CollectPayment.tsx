import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
  loan: Loan;
  borrower: Borrower;
}

export default function CollectPayment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const navigate = useNavigate();

  const getRepayments = async (search: string = "") => {
    try {
      const response = await api.get(ApiRoutes.todayRepayments.path, {
        authenticate: ApiRoutes.todayRepayments.authenticate,
      } as CustomAxiosRequestConfig);

      const filtered = response.data.filter((repayment: Repayment) =>
        repayment.borrower.name.toLowerCase().includes(search.toLowerCase())
      );

      setRepayments(filtered);
    } catch {
      toast.error("Error fetching repayments!");
    }
  };

  useEffect(() => {
    getRepayments();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    getRepayments(value); // fetch filtered fresh data from backend
  };

  const handleRecordPayment = (repayment: Repayment) => {
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

  return (
    <div className='flex flex-col h-full mb-20'>
      {/* Header with Search */}
      <div className='bg-[#002866] text-white px-4 pb-6 pt-4 sticky top-0 z-10 shadow-md border-b border-blue-900'>
        <h1 className='text-2xl font-semibold text-center mb-4 tracking-wide'>
          💰 Today's Repayments
        </h1>

        <div className='relative'>
          <span className='absolute left-3 top-2.5 text-gray-400'>
            <Search size={20} />
          </span>
          <input
            type='text'
            placeholder='Search by borrower name...'
            className='w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent transition duration-200'
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Repayments List */}
      <div className='flex-1 overflow-auto p-4 bg-gray-50'>
        {repayments.length === 0 ? (
          <div className='text-center py-10 text-gray-500'>
            No repayments found
          </div>
        ) : (
          <div className='space-y-4'>
            {repayments.map((repayment, index) => (
              <div
                key={index}
                className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200'
              >
                <div className='p-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <h2 className='text-lg font-bold text-gray-800'>
                      {repayment.borrower.name}
                    </h2>
                    <div className='bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded'>
                      ₹{repayment.amountToPay}
                    </div>
                  </div>

                  <div className='space-y-1 text-gray-600 text-sm mb-3'>
                    <div className='flex items-start'>
                      <div className='w-24 flex-shrink-0 font-medium'>
                        Phone:
                      </div>
                      <div>{repayment.borrower.phoneNumber}</div>
                    </div>
                    <div className='flex items-start'>
                      <div className='w-24 flex-shrink-0 font-medium'>
                        Address:
                      </div>
                      <div>{repayment.borrower.address}</div>
                    </div>
                    <div className='flex items-start'>
                      <div className='w-24 flex-shrink-0 font-medium'>
                        Pending:
                      </div>
                      <div>₹{repayment.loan.pendingAmount}</div>
                    </div>
                  </div>

                  <button
                    title='Record Payment'
                    onClick={() => handleRecordPayment(repayment)}
                    className='w-full bg-[#670FC5] hover:bg-[#5a0cb0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200'
                  >
                    Record Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
