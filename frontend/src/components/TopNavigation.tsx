import { HelpCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";

const TopNavigation = () => {
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
        } as CustomAxiosRequestConfig);
        // console.log("Balance response:", response.data);
        setBalance(response.data.totalCapital);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();

    // Refresh balance every minute
    const intervalId = setInterval(fetchBalance, 60 * 1000); // 1 minute
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='relative bg-[#002866]'>
      <div className='flex justify-between items-center py-3 px-3'>
        {/* Help button on the left */}
        <button
          className='p-2 rounded-full bg-[#003080] text-white'
          title='Help'
        >
          <HelpCircle size={20} />
        </button>

        {/* Right section: Balance + Profile */}
        <div className='flex items-center gap-3'>
          {/* balance displayer */}
          <div className='flex  justify-center'>
            <div className=' bg-white/10 px-4 py-1 rounded-full text-sm text-white'>
              ₹ {balance}
            </div>
          </div>

          <button
            className='p-2 rounded-full bg-[#003080] text-white'
            title='User Profile'
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
