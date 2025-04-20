import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  HandCoins,
  PieChart,
  ArrowUpRight,
  FileText,
  Wallet,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  CircleDollarSign,
} from "lucide-react";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";
import toast from "react-hot-toast";

interface CollectionStatus {
  amountCollectedToday: string;
  amountSupposedToBeCollectedToday: string;
}

interface getCollectionStatusResponse {
  message: string;
  data: CollectionStatus;
}

interface Capital {
  idleCapital: string;
  totalCapital: string;
  pendingLoanAmount: string;
}

interface getCapitalResponse {
  message: string;
  data: Capital;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [collectionStatus, setCollectionStatus] = useState({
    amountCollectedToday: "0",
    amountSupposedToBeCollectedToday: "0",
  });
  const [capital, setCapital] = useState({
    idleCapital: "0",
    totalCapital: "0",
    pendingLoanAmount: "0",
  });
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch collection status
        const collectionResponse = await api.get<getCollectionStatusResponse>(
          ApiRoutes.todayCollectionStatus.path,
          {
            authenticate: ApiRoutes.todayCollectionStatus.authenticate,
          } as CustomAxiosRequestConfig
        );

        if (collectionResponse.data) {
          setCollectionStatus(collectionResponse.data);
        }
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }
        // Fetch capital data
        const path = ApiRoutes.getLatestCapital.path.replace(":userId", userId);

        const capitalResponse = await api.get<getCapitalResponse>(path, {
          authenticate: ApiRoutes.getLatestCapital.authenticate,
        } as CustomAxiosRequestConfig);

        if (capitalResponse.data) {
          setCapital(capitalResponse.data);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Calculate collection percentage
  const collectionPercentage =
    parseInt(collectionStatus.amountSupposedToBeCollectedToday) > 0
      ? Math.round(
          (parseInt(collectionStatus.amountCollectedToday) /
            parseInt(collectionStatus.amountSupposedToBeCollectedToday)) *
            100
        )
      : 0;

  // Navigation handlers
  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    // Added the pb-24 class to create space for the bottom navigation bar
    <div className='flex flex-col bg-gray-50 min-h-screen pb-24'>
      {/* Quick Access Section */}
      <div className='px-5 py-6'>
        <h2 className='text-lg font-semibold text-gray-800 mb-5'>
          Quick Access
        </h2>
        <div className='grid grid-cols-3 gap-6'>
          <div
            className='flex flex-col items-center cursor-pointer'
            onClick={() => handleNavigation("/loans")}
          >
            <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm'>
              <BookOpen className='text-[#002866] h-7 w-7' />
            </div>
            <span className='mt-3 text-sm font-medium text-gray-700'>
              Loans
            </span>
          </div>

          <div
            className='flex flex-col items-center cursor-pointer'
            onClick={() => handleNavigation("/borrowers")}
          >
            <div className='w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center shadow-sm'>
              <Users className='text-[#670FC5] h-7 w-7' />
            </div>
            <span className='mt-3 text-sm font-medium text-gray-700'>
              Borrowers
            </span>
          </div>

          <div
            className='flex flex-col items-center cursor-pointer'
            onClick={() => handleNavigation("/new-loan")}
          >
            <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-sm'>
              <HandCoins className='text-green-600 h-7 w-7' />
            </div>
            <span className='mt-3 text-sm font-medium text-gray-700'>
              New Loan
            </span>
          </div>
        </div>
      </div>

      {/* Cards Section - Improved spacing and layout */}
      <div className='px-5 py-3'>
        <div className='flex flex-col gap-5'>
          {/* First row - Two cards side by side */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {/* Today's Collection Status */}
            <div className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer'>
              <div className='relative z-10'>
                <div className='flex items-center mb-3'>
                  <Clock size={18} className='text-[#670FC5] mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Today's Collection
                  </h3>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between items-end mb-2'>
                    <span className='text-xs text-gray-500'>Progress</span>
                    <span className='text-xs font-medium'>
                      {collectionPercentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5'>
                    <div
                      className='bg-[#670FC5] h-2.5 rounded-full'
                      style={{ width: `${collectionPercentage}%` }}
                    ></div>
                  </div>
                  <div className='mt-3 flex items-baseline'>
                    <span className='text-lg font-bold text-gray-800'>
                      ₹
                      {parseInt(
                        collectionStatus.amountCollectedToday
                      ).toLocaleString()}
                    </span>
                    <span className='text-xs text-gray-500 ml-2'>
                      / ₹
                      {parseInt(
                        collectionStatus.amountSupposedToBeCollectedToday
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {/* <ArrowUpRight
                size={18}
                className='absolute bottom-3 right-3 text-gray-400'
              /> */}
              <div className='absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mt-10 -mr-10 opacity-70'></div>
            </div>

            {/* Cash in Hand */}
            <div
              className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer'
              onClick={() => handleNavigation("/capital")}
            >
              <div className='relative z-10'>
                <div className='flex items-center mb-3'>
                  <Wallet size={18} className='text-blue-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Cash in Hand
                  </h3>
                </div>
                <div className='mt-4'>
                  <div className='flex flex-col'>
                    <span className='text-lg font-bold text-gray-800'>
                      ₹{parseInt(capital.idleCapital).toLocaleString()}
                    </span>
                    <span className='text-xs text-gray-500 mt-1'>
                      Available to lend
                    </span>
                  </div>
                </div>
              </div>
              <ArrowUpRight
                size={18}
                className='absolute bottom-3 right-3 text-gray-400'
              />
              <div className='absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mt-10 -mr-10 opacity-70'></div>
              <CircleDollarSign
                size={28}
                className='absolute bottom-5 right-12 text-blue-100'
              />
            </div>
          </div>

          {/* Second row - Two cards side by side */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {/* Register Existing Loans */}
            <div
              className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer'
              onClick={() => handleNavigation("/existing-loan")}
            >
              <div className='relative z-10'>
                <div className='flex items-center mb-3'>
                  <ClipboardList size={18} className='text-green-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Register Existing Loans
                  </h3>
                </div>
                <div className='mt-4'>
                  <p className='text-xs text-gray-500 leading-relaxed'>
                    Import your existing loans to track them digitally
                  </p>
                </div>
              </div>
              <ArrowUpRight
                size={18}
                className='absolute bottom-3 right-3 text-gray-400'
              />
              <div className='absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mt-10 -mr-10 opacity-70'></div>
              <BookOpen
                size={28}
                className='absolute bottom-5 right-12 text-green-100'
              />
            </div>

            {/* Close Today's Repayment */}
            <div
              className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer'
              onClick={() => handleNavigation("/close-repayments")}
            >
              <div className='relative z-10'>
                <div className='flex items-center mb-3'>
                  <CheckCircle size={18} className='text-orange-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Close Today's Repayment
                  </h3>
                </div>
                <div className='mt-4'>
                  <p className='text-xs text-gray-500 leading-relaxed'>
                    Finalize your daily collections
                  </p>
                </div>
              </div>
              <ArrowUpRight
                size={18}
                className='absolute bottom-3 right-3 text-gray-400'
              />
              <div className='absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mt-10 -mr-10 opacity-70'></div>
              <Clock
                size={28}
                className='absolute bottom-5 right-12 text-orange-100'
              />
            </div>
          </div>

          {/* Third row - Full width card */}
          <div className='mt-1 mb-2'>
            {/* Financial Reports */}
            <div
              className='bg-gradient-to-r from-[#002866] to-[#003580] rounded-xl p-6 shadow-md text-white relative overflow-hidden cursor-pointer'
              onClick={() => handleNavigation("/financial-summary")}
            >
              <div className='relative z-10'>
                <div className='flex items-center mb-3'>
                  <PieChart size={20} className='text-white mr-2' />
                  <h3 className='text-base font-semibold'>Financial Reports</h3>
                </div>
                <div className='mt-3'>
                  <p className='text-sm text-gray-100 opacity-90 mb-3 leading-relaxed'>
                    View detailed insights and analytics about your finances
                  </p>
                  <div className='mt-2 flex items-center'>
                    <span className='text-xs border border-white/30 rounded-full px-3 py-1 inline-flex items-center'>
                      <TrendingUp size={12} className='mr-1.5' />
                      View Reports
                    </span>
                  </div>
                </div>
              </div>
              <div className='absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mt-16 -mr-16'></div>
              <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -mb-12 -ml-12'></div>
              <FileText
                size={32}
                className='absolute bottom-4 right-4 text-white/20'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-50'>
          <div className='flex flex-col items-center'>
            <div className='w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#670FC5] animate-spin'></div>
            <p className='mt-4 text-gray-600 font-medium'>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
