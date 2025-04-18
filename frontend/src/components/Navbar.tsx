import { Link } from "react-router-dom";
import { Home, Clock } from "lucide-react";

const Navbar = () => {
  return (
    <nav className='bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 max-w-sm mx-auto z-50 h-20'>
      <div className='flex justify-around items-center h-full'>
        {/* Home */}
        <Link
          to='/'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <Home size={20} />
          <span className='text-xs mt-1'>Home</span>
        </Link>

        {/* Collect Payment (SVG from public folder) */}
        <Link
          to='/collect-payment'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <img
            src='/collect-payment-home.svg'
            alt='Collect Payment'
            className='h-16 w-16'
          />
          {/* <span className='text-xs mt-0'>Collect</span> */}
        </Link>

        {/* History (Clock Icon) */}
        <Link
          to='/repayment-history'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <Clock size={20} />
          <span className='text-xs mt-1'>History</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
