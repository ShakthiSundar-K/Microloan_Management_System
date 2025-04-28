// components/FinanceBannerSimple.tsx
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinanceBannerSimple = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/docs");
  };
  return (
    <div className='relative bg-[#002866] text-white pt-4 ps-4 pe-4 overflow-hidden'>
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
          onClick={handleClick}
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
