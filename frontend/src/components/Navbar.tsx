import { Link } from "react-router-dom";
import { Home, User, Settings } from "lucide-react";

const Navbar = () => {
  return (
    <nav className='bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 max-w-sm mx-auto'>
      <div className='flex justify-around items-center py-3'>
        <Link
          to='/'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <Home size={20} />
          <span className='text-xs mt-1'>Home</span>
        </Link>
        <Link
          to='/profile'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <User size={20} />
          <span className='text-xs mt-1'>Profile</span>
        </Link>
        <Link
          to='/settings'
          className='flex flex-col items-center text-gray-600 hover:text-purple-600'
        >
          <Settings size={20} />
          <span className='text-xs mt-1'>Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
