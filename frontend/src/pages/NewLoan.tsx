import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  PiggyBank,
  User,
  Plus,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

interface Borrower {
  borrowerId: string;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
}

interface GetBorrowersResponse {
  message: string;
  borrowers: Borrower[];
}

const NewLoan = () => {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch borrowers on component mount
  useEffect(() => {
    fetchBorrowers();
  }, []);

  // Fetch borrowers
  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const response = await api.get<GetBorrowersResponse>(
        ApiRoutes.getAllBorrowers.path,
        {
          authenticate: ApiRoutes.getAllBorrowers.authenticate,
        } as CustomAxiosRequestConfig
      );

      setBorrowers(response.borrowers);
      setLoading(false);
    } catch {
      toast.error("Failed to fetch borrowers");
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter borrowers based on search term
  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phoneNumber.includes(searchTerm)
  );

  // Navigate to create loan page for specific borrower
  const handleBorrowerSelect = (borrowerId: string) => {
    navigate(`/create-loan/${borrowerId}`);
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-4'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>New Loan</h1>
          <p className='text-sm opacity-80'>
            Select a borrower to create a new loan
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <PiggyBank size={16} className='mr-2' />
              <span>Select Borrower</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className='sticky top-0 z-10 bg-gray-50 p-4 shadow-sm'>
        <div className='relative'>
          <span className='absolute left-3 top-2.5 text-gray-400'>
            <Search size={20} />
          </span>
          <input
            type='text'
            placeholder='Search by name or phone number...'
            className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent transition duration-200'
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Create New Borrower Card */}
      <div className='px-4 mb-6'>
        <button
          onClick={() => navigate("/create-borrower")}
          className='w-full bg-white border-l-4 border-[#670FC5] border-y border-r rounded-lg p-4 flex items-center justify-between hover:bg-[#F9F7FF] transition-colors shadow-sm group'
        >
          <div className='flex items-center'>
            <div className='bg-[#F3EFFC] p-2.5 rounded-full mr-4'>
              <Plus size={12} className='text-[#670FC5]' />
            </div>
            <div className='flex flex-col'>
              <span className='font-medium text-gray-800 group-hover:text-[#670FC5] transition-colors'>
                Add New Borrower
              </span>
              <span className='text-xs text-gray-500 group-hover:text-[#8D52E5] transition-colors mt-0.5'>
                Create a profile for a new loan applicant
              </span>
            </div>
          </div>
          <ChevronRight
            size={20}
            className='text-gray-400 group-hover:text-[#670FC5] transition-colors'
          />
        </button>
      </div>

      {/* Borrowers List */}
      <div className='px-4'>
        <h2 className='font-semibold text-gray-700 mb-4 flex items-center'>
          <User size={18} className='text-[#670FC5] mr-2' />
          <span>Select from existing borrowers</span>
        </h2>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100'>
            <Loader2 size={36} className='animate-spin text-[#670FC5] mb-4' />
            <p className='text-gray-600 font-medium'>Loading borrowers...</p>
          </div>
        ) : filteredBorrowers.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center'>
            <AlertTriangle size={36} className='text-yellow-500 mb-4' />
            <h3 className='font-semibold text-gray-800 text-lg mb-2'>
              No borrowers found
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchTerm
                ? `No results match "${searchTerm}"`
                : "No borrowers are available"}
            </p>
            <button
              onClick={() => navigate("/create-borrower")}
              className='bg-[#670FC5] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors flex items-center'
            >
              <Plus size={18} className='mr-2' />
              Add New Borrower
            </button>
          </div>
        ) : (
          <div className='space-y-3 mb-6'>
            {filteredBorrowers.map((borrower) => (
              <div
                key={borrower.borrowerId}
                onClick={() => handleBorrowerSelect(borrower.borrowerId)}
                className='bg-white rounded-lg shadow-sm border-l-4 border-[#F3EFFC] border-y border-r p-4 flex items-center justify-between hover:border-l-[#670FC5] hover:shadow-md transition-all cursor-pointer group'
              >
                <div className='flex items-center'>
                  <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center mr-4 group-hover:bg-[#E9DEFF] transition-colors'>
                    <User size={18} className='text-[#670FC5]' />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-800 group-hover:text-[#670FC5] transition-colors'>
                      {borrower.name}
                    </h3>
                    <p className='text-sm text-gray-500 flex items-center mt-1'>
                      {borrower.phoneNumber}
                    </p>
                    <p className='text-xs text-gray-500 mt-1 max-w-xs truncate'>
                      {borrower.address}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className='text-gray-400 group-hover:text-[#670FC5] transition-colors'
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewLoan;
