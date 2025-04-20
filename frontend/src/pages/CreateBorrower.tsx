import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  MapPin,
  LockKeyhole,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

const CreateBorrower = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", phoneNumber: "", address: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Borrower name is required";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post(ApiRoutes.createBorrower.path, formData, {
        authenticate: ApiRoutes.createBorrower.authenticate,
      } as CustomAxiosRequestConfig);

      setLoading(false);
      setSuccess(true);
      toast.success("Borrower created successfully!");

      // Reset form after success
      setTimeout(() => {
        navigate("/new-loan");
      }, 1500);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to create borrower");
      console.error("Error creating borrower:", error);
    }
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/new-loan")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Create Borrower</h1>
          <p className='text-sm opacity-80'>
            Add a new borrower to your account
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <UserPlus size={16} className='mr-2' />
              <span>New Borrower Registration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className='px-4 -mt-6'>
        <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
          {success ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <div className='bg-green-100 rounded-full p-3 mb-4'>
                <CheckCircle size={32} className='text-green-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Borrower Created Successfully!
              </h3>
              <p className='text-gray-600 text-center mb-6'>
                The borrower has been added to your account.
              </p>
              <button
                onClick={() => navigate("/new-loan")}
                className='bg-[#670FC5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors'
              >
                View All Borrowers
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                    <User size={20} className='text-[#670FC5]' />
                  </div>
                  <h2 className='font-semibold text-gray-800'>
                    Borrower Information
                  </h2>
                </div>

                {/* Info Card */}
                <div className='bg-blue-50 rounded-lg p-4 mb-6 flex items-start gap-3'>
                  <Info size={20} className='text-blue-600 mt-0.5' />
                  <div>
                    <p className='text-sm text-blue-800'>
                      The borrower will be created with a default password of{" "}
                      <strong>123456</strong>
                    </p>
                    <p className='text-xs text-blue-700 mt-1'>
                      They can change their password in their account settings
                      later.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-4'>
                  {/* Name Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Full Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <User size={16} className='text-gray-400' />
                      </div>
                      <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter borrower's full name"
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    {errors.name && (
                      <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Phone size={16} className='text-gray-400' />
                      </div>
                      <input
                        type='tel'
                        name='phoneNumber'
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder='10-digit phone number'
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.phoneNumber
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Address Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Address <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute top-3 left-3 pointer-events-none'>
                        <MapPin size={16} className='text-gray-400' />
                      </div>
                      <textarea
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter borrower's address"
                        rows={3}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.address ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    {errors.address && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Password Info */}
                  <div className='flex items-center gap-2 mt-2 text-gray-500 text-sm'>
                    <LockKeyhole size={14} />
                    <span>
                      Default password will be set to:{" "}
                      <span className='font-mono bg-gray-100 px-1 py-0.5 rounded'>
                        123456
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='pt-4 border-t border-gray-100'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-[#670FC5] text-white py-3 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors flex items-center justify-center'
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className='animate-spin mr-2' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className='mr-2' />
                      Create Borrower
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
            <Info size={16} className='mr-2 text-[#670FC5]' />
            About Borrower Accounts
          </h3>

          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Borrowers will have access to view their own loan details and
                repayment schedule
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                They can use their phone number and default password (123456) to
                login
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                For security, encourage borrowers to change their password after
                first login
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>You can manage all borrowers from the borrowers dashboard</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateBorrower;
