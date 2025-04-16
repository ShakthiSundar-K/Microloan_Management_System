import React, { useState } from "react";
import { Search } from "lucide-react";

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
  const [repayments, setRepayments] = useState<Repayment[]>([
    {
      loanId: "25aa6e8d-b34a-4e16-92bc-5d8e0a41f47e",
      borrowerId: "ef848811-37fd-46ca-8d51-11197368a77c",
      amountToPay: "300",
      dueDate: "2025-04-17T03:18:56.384Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "11700",
        dueDate: "2025-05-26T03:18:56.384Z",
      },
      borrower: {
        name: "Rekha Juice",
        phoneNumber: "1334267780",
        address: "Near Axis Bank",
      },
    },
    {
      loanId: "b477c978-d7ed-40f5-864c-631d36631c64",
      borrowerId: "074f80ad-f25b-4d8d-96e8-ed1a3aeaab71",
      amountToPay: "200",
      dueDate: "2025-04-17T03:19:59.357Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "7800",
        dueDate: "2025-05-26T03:19:59.357Z",
      },
      borrower: {
        name: "poo senthil",
        phoneNumber: "1234567890",
        address: "near A.R departmental store",
      },
    },
    {
      loanId: "dc761442-18f0-4cde-88a7-24504b0fa198",
      borrowerId: "a8cb78d8-b948-4165-a339-9c774d1e0e16",
      amountToPay: "500",
      dueDate: "2025-04-17T03:21:41.424Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "36500",
        dueDate: "2025-07-04T03:21:41.424Z",
      },
      borrower: {
        name: "Ravi digital printing",
        phoneNumber: "1234567780",
        address: "Gandhi statue",
      },
    },
    {
      loanId: "7cb768d9-b21d-44d4-81b8-e1674ff18c7c",
      borrowerId: "8f15eaf6-5d2b-4606-95a9-fe44075bd9ed",
      amountToPay: "400",
      dueDate: "2025-04-17T03:27:54.595Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "40000",
        dueDate: "2025-08-05T03:27:54.595Z",
      },
      borrower: {
        name: "Arun Pizza",
        phoneNumber: "1334557780",
        address: "Near Greens",
      },
    },
    {
      loanId: "5a8f0f6c-df21-4e94-a184-45bebe98dea2",
      borrowerId: "a4fa7c92-6b13-4b2c-863b-ebfda4c00846",
      amountToPay: "300",
      dueDate: "2025-04-17T03:32:39.820Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "30000",
        dueDate: "2025-08-05T03:32:39.820Z",
      },
      borrower: {
        name: "Santhi",
        phoneNumber: "1234267780",
        address: "Singarathoppu",
      },
    },
    {
      loanId: "d48a8391-42c7-4c76-9ccb-2b8bd0362031",
      borrowerId: "a4fa7c92-6b13-4b2c-863b-ebfda4c00846",
      amountToPay: "300",
      dueDate: "2025-04-17T11:20:36.760Z",
      status: "Unpaid",
      loan: {
        pendingAmount: "30000",
        dueDate: "2025-08-05T11:20:36.760Z",
      },
      borrower: {
        name: "Santhi",
        phoneNumber: "1234267780",
        address: "Singarathoppu",
      },
    },
  ]);

  const handleRecordPayment = (repayment: Repayment) => {
    // Navigate to record-payment page with repayment details
    console.log("Navigating to record-payment with:", repayment);
    // In a real app, you would use router.push or window.location
    // window.location.href = `/record-payment?data=${encodeURIComponent(JSON.stringify(repayment))}`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRepayments = repayments.filter((repayment) =>
    repayment.borrower.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex flex-col h-full'>
      {/* Header with Search */}
      <div className='bg-[#670FC5] text-white p-4 sticky top-0 z-10'>
        <h1 className='text-xl font-bold mb-3'>Today's Repayments</h1>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search borrowers...'
            className='w-full py-2 px-4 pr-10 rounded-lg text-gray-800'
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className='absolute right-3 top-2.5'>
            <Search size={20} className='text-gray-500' />
          </div>
        </div>
      </div>

      {/* Repayments List */}
      <div className='flex-1 overflow-auto p-4 bg-gray-50'>
        {filteredRepayments.length === 0 ? (
          <div className='text-center py-10 text-gray-500'>
            No repayments found
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredRepayments.map((repayment, index) => (
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
