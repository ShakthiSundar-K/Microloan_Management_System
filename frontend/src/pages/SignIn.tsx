import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiRoutes from "../utils/ApiRoutes";
import { Eye, EyeOff, ArrowRight, Lock, Shield } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../service/ApiService";
import toast from "react-hot-toast";
import { CustomAxiosRequestConfig } from "../service/ApiService";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  type AuthResponse = {
    token: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // console.log("Form data before API call:", formData); // Debugging line
      const response = (await api.post(ApiRoutes.login.path, formData, {
        authenticate: ApiRoutes.login.authenticate,
      } as CustomAxiosRequestConfig)) as AuthResponse;
      // console.log("API response:", response); // Debugging line
      toast.success("Login successful!");
      localStorage.setItem("token", response.token);
      navigate("/");
    } catch {
      toast.error("Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden'>
      {/* Background pattern elements */}
      <div className='absolute inset-0 z-0'>
        {/* Circles */}
        <div className='absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-[#002866] to-[#670FC5] opacity-5'></div>
        <div className='absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-[#670FC5] to-[#002866] opacity-5'></div>

        {/* Abstract lines */}
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#002866] to-[#670FC5]'></div>
        <div className='absolute top-1/4 right-0 w-32 h-1 bg-[#002866] opacity-10 rounded-l-full'></div>
        <div className='absolute bottom-1/3 left-0 w-48 h-1 bg-[#670FC5] opacity-10 rounded-r-full'></div>
      </div>

      <div className='w-full max-w-md px-6 z-10'>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100'>
          <div className='h-1 bg-gradient-to-r from-[#002866] to-[#670FC5]'></div>

          <div className='p-6'>
            {/* Header with small logo */}
            <div className='flex flex-col items-center mb-6'>
              <div className='bg-gradient-to-r from-[#002866] to-[#670FC5] w-12 h-12 rounded-full flex items-center justify-center mb-3'>
                <Shield size={20} className='text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-800'>Sign In</h1>
              <p className='text-sm text-gray-500 mt-1'>Access your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='phoneNumber'
                  className='text-sm font-medium text-gray-700'
                >
                  Phone Number
                </label>
                <div className='relative mt-1'>
                  <input
                    type='tel'
                    id='phoneNumber'
                    name='phoneNumber'
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder='Enter your phone number'
                    className='w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#002866] focus:border-[#002866] transition-colors'
                    required
                  />
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm'>
                    +91
                  </div>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center'>
                  <label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <Link
                    to='/forgot-password'
                    className='text-xs text-[#002866] hover:text-[#670FC5] transition-colors'
                  >
                    Forgot?
                  </Link>
                </div>
                <div className='relative mt-1'>
                  <input
                    type={showPassword ? "text" : "password"}
                    id='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Enter your password'
                    className='w-full px-3 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#002866] focus:border-[#002866] transition-colors'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className={`w-full py-2.5 mt-2 ${
                  isLoading
                    ? "bg-blue-300"
                    : "bg-gradient-to-r from-[#002866] to-[#670FC5] hover:from-[#001f4d] hover:to-[#5a0daa]"
                } text-white font-medium rounded-md transition-colors flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className='h-4 w-4 text-white mr-2' />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className='ml-2' />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
            <p className='text-sm text-center text-gray-600'>
              Don't have an account?{" "}
              <Link
                to='/sign-up'
                className='font-medium text-[#670FC5] hover:text-[#002866] transition-colors'
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Subtle branding */}
        <div className='flex items-center justify-center mt-4'>
          <Lock size={16} className='text-[#002866] mr-1' />
          <span className='text-xs text-gray-500'>Secured by YourBrand</span>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
