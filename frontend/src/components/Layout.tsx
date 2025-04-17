import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavigation from "./TopNavigation";

const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <TopNavigation />
      <main className='flex-grow'>
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;
