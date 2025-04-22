import { HelpCircle, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../service/ApiService";
import ApiRoutes from "../utils/ApiRoutes";
import { CustomAxiosRequestConfig } from "../service/ApiService";
import useLogout from "../hooks/useLogout";

interface Capital {
  totalCapital: number;
}

interface getCapitalResponse {
  message: string;
  data: Capital;
}

const TopNavigation = () => {
  const [balance, setBalance] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();

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
        const response = await api.get<getCapitalResponse>(path, {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <div className='relative bg-[#002866]'>
      <div className='flex justify-between items-center py-3 px-3'>
        {/* Help button on the left */}
        <button
          className='p-2 rounded-full bg-[#003080] text-white hover:bg-[#003c99] transition-colors duration-200'
          title='Help'
        >
          <HelpCircle size={20} />
        </button>

        {/* Right section: Balance + Profile */}
        <div className='flex items-center gap-3'>
          {/* balance displayer */}
          <div className='flex justify-center'>
            <div className='bg-white/10 px-4 py-1 rounded-full text-sm text-white font-medium'>
              ₹ {balance.toLocaleString()}
            </div>
          </div>

          {/* User profile button with dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              className={`p-2 rounded-full ${
                showDropdown ? "bg-[#004cb3]" : "bg-[#003080]"
              } text-white hover:bg-[#003c99] transition-colors duration-200`}
              title='User Profile'
              onClick={toggleDropdown}
            >
              <User size={20} />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn'>
                <Link
                  to='/profile'
                  className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} className='mr-2' />
                  Profile
                </Link>
                <Link
                  to='/settings'
                  className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} className='mr-2' />
                  Settings
                </Link>
                <div className='h-px bg-gray-200 my-1' />
                <button
                  className='flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors'
                  onClick={handleLogout}
                >
                  <LogOut size={16} className='mr-2' />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
