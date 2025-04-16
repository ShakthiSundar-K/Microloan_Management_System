import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
}

const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className='flex justify-center item-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md mx-auto bg-white min-h-screen shadow-lg overflow-hidden'>
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;
