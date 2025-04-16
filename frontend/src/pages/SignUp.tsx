// pages/SignUp.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import api from "../service/ApiService";
import toast from "react-hot-toast";
import ApiRoutes from "../utils/ApiRoutes";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "LENDER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(ApiRoutes.register.path, formData, {
        authenticate: ApiRoutes.register.authenticate,
      });
      toast.success("Registration successful!");
      navigate("/sign-in");
    } catch (error) {
      toast.error("Registration failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='px-8 pt-12'>
      <h1 className='text-2xl font-bold text-center mb-1 text-gray-700'>
        Get Started Now
      </h1>
      <p className='text-center text-gray-600 text-sm mb-6'>
        Create an Account or{" "}
        <Link to='/sign-in' className='text-[#670FC5]'>
          Login in
        </Link>{" "}
        to explore about our app
      </p>

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm font-medium text-gray-700'>
            Name
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Enter Your Email'
            className='w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#670FC5]'
            required
          />
        </div>

        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm font-medium text-gray-700'>
            Email
          </label>
          <div className='relative'>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter Your Email'
              className='w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#670FC5]'
              required
            />
            <Mail
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
          </div>
        </div>

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
              id='phone'
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
            Set Password
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
                <span>Signing Up...</span>
                <LoadingSpinner className='h-4 w-4 text-white' />
              </>
            ) : (
              "Sign Up"
            )}
          </span>
        </button>
      </form>
      <div className='text-center mt-6 text-sm'>
        Already have an account?{" "}
        <Link to='/sign-in' className='text-[#670FC5] font-medium'>
          SignIn
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
