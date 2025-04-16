import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiRoutes from "../utils/ApiRoutes";
import { Eye, EyeOff, Phone } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../service/ApiService";
import toast from "react-hot-toast";

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post(ApiRoutes.login.path, formData, {
        authenticate: ApiRoutes.login.authenticate,
      });
      toast.success("Login successful!");
      localStorage.setItem("token", response.token);
      navigate("/");
    } catch (error) {
      toast.error("Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='px-8 pt-36'>
      <h1 className='text-2xl font-bold text-center mb-1 text-gray-700'>
        Welcome Back
      </h1>
      <p className='text-center text-gray-600 text-sm mb-6'>
        Please login to your account
      </p>

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <label
            htmlFor='phoneNumber'
            className='text-sm font-medium text-gray-700'
          >
            Phone Number
          </label>
          <div className='relative'>
            <input
              type='tel'
              id='phoneNumber'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder='Enter Your phone number'
              className='w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#670FC5]'
              required
            />
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium'>
              +91
            </div>
            <Phone
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='password'
            className='text-sm font-medium text-gray-700'
          >
            Password
          </label>
          <div className='relative'>
            <input
              type={showPassword ? "text" : "password"}
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter Your Password'
              className='w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#670FC5]'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className='text-right'>
          <Link
            to='/forgot-password'
            className='text-sm text-[#670FC5] font-medium'
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type='submit'
          disabled={isLoading}
          className={`w-full py-3 ${
            isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-[#670FC5]"
          } hover:bg-purple-700 text-white font-medium rounded-full transition-colors flex items-center justify-center`}
        >
          <span className='flex items-center gap-2'>
            {isLoading ? (
              <>
                <span>Signing In...</span>
                <LoadingSpinner className='h-4 w-4 text-white' />
              </>
            ) : (
              "Sign In"
            )}
          </span>
        </button>
      </form>
      <div className='text-center mt-6 text-sm'>
        Don't an account?{" "}
        <Link to='/sign-up' className='text-[#670FC5] font-medium'>
          SignUp
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
