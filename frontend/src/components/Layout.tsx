import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-grow'>
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;
