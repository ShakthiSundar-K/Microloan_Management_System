import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Users, User, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";

interface GetAllBorrowersResponse {
  message: string;
  borrowers: Borrower[];
}
interface Borrower {
  borrowerId: string;
  name: string;
  passwordHash: string;
  phoneNumber: string;
  address: string;
}

export default function Borrowers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
  const navigate = useNavigate();

  const getBorrowers = async () => {
    try {
      const response = await api.get<GetAllBorrowersResponse>(
        ApiRoutes.getAllBorrowers.path,
        {
          authenticate: ApiRoutes.getAllBorrowers.authenticate,
        } as CustomAxiosRequestConfig
      );

      setBorrowers(response.borrowers);
      setFilteredBorrowers(response.borrowers);
    } catch {
      console.error("Error fetching borrowers:");
    }
  };

  useEffect(() => {
    getBorrowers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredBorrowers(borrowers);
    } else {
      const filtered = borrowers.filter(
        (borrower) =>
          borrower.name.toLowerCase().includes(value.toLowerCase()) ||
          borrower.phoneNumber.includes(value)
      );
      setFilteredBorrowers(filtered);
    }
  };

  const handleBorrowerClick = (borrowerId: string) => {
    navigate(`/borrower-details/${borrowerId}`);
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
          <h1 className='text-xl font-bold mb-2'>Borrowers</h1>
          <p className='text-sm opacity-80'>Manage all borrowers</p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Users size={16} className='mr-2' />
              <span>{borrowers.length} registered borrowers</span>
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
              placeholder='Search by name or phone number...'
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent transition duration-200'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Borrowers List */}
        <div className='p-4 pt-2'>
          {filteredBorrowers.length === 0 ? (
            <div className='text-center py-10 text-gray-500 flex flex-col items-center'>
              <div className='bg-gray-100 rounded-full p-4 mb-4'>
                <User size={32} className='text-gray-400' />
              </div>
              <p className='font-medium'>No borrowers found</p>
              <p className='text-sm text-gray-400 mt-1'>
                Try a different search term
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredBorrowers.map((borrower) => (
                <div
                  key={borrower.borrowerId}
                  className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                  onClick={() => handleBorrowerClick(borrower.borrowerId)}
                >
                  <div className='p-4'>
                    <div className='flex items-center mb-3'>
                      <div className='bg-[#F3EFFC] p-2 rounded-full flex items-center justify-center mr-3'>
                        <UserRound size={20} className='text-[#670FC5]' />
                      </div>
                      <h2 className='text-lg font-bold text-gray-800'>
                        {borrower.name}
                      </h2>
                    </div>

                    <div className=' space-y-2 text-gray-600 text-sm mb-2'>
                      <div className='flex items-start'>
                        <div className='w-24 flex-shrink-0 font-medium text-gray-500'>
                          Phone:
                        </div>
                        <div>{borrower.phoneNumber}</div>
                      </div>
                      <div className='flex items-start'>
                        <div className='w-24 flex-shrink-0 font-medium text-gray-500'>
                          Address:
                        </div>
                        <div>{borrower.address}</div>
                      </div>
                    </div>
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
