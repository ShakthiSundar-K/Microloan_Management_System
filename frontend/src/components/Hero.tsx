// components/FinanceBannerSimple.tsx
import { useState, useEffect } from "react";
import { HelpCircle, User, ArrowRight } from "lucide-react";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";

const FinanceBannerSimple = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userId = localStorage.getItem("id");
        // console.log("User ID from localStorage:", userId);
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }
        const path = ApiRoutes.getLatestCapital.path.replace(":userId", userId);
        const response = await api.get(path, {
          authenticate: ApiRoutes.getLatestCapital.authenticate,
        });
        // console.log("Balance response:", response.data);
        setBalance(response.data.totalCapital);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();

    // Refresh balance every minute
    const intervalId = setInterval(fetchBalance, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='relative bg-[#002866] text-white pt-4 ps-4 pe-4 overflow-hidden'>
      {/* Top Navigation */}
      <div className='flex justify-between items-center mb-6'>
        {/* Help button on the left */}
        <button
          className='p-2 rounded-full bg-[#003080] text-white'
          title='Help'
        >
          <HelpCircle size={20} />
        </button>

        {/* Right section: Balance + Profile */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center bg-purple-700 py-1 px-4 rounded-full text-white text-sm'>
            <span className='font-bold'>₹ {balance}</span>
          </div>
          <button
            className='p-2 rounded-full bg-[#003080] text-white'
            title='User Profile'
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Banner Content */}
      <div className='text-center mb-6'>
        <h2 className='text-base font-bold'>
          Manual tracking slowing you down?
        </h2>
        <h1 className='text-2xl font-bold mb-4'>
          Run your finance like a pro!!
        </h1>
        <button
          className='bg-purple-700 hover:bg-purple-800 transition-colors text-white px-6 py-2 rounded-full font-medium'
          title='Get Started'
        >
          <div className='flex flex-row gap-1 items-center justify-center'>
            <span>See how</span>
            <ArrowRight size={20} strokeWidth={2.5} />
          </div>
        </button>
      </div>

      <div className='relative '>
        <img src='/hero2.png' alt='Finance graphics' className='w-screen' />
      </div>
    </div>
  );
};

export default FinanceBannerSimple;
