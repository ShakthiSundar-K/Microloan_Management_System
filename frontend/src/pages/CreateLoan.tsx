/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  PiggyBank,
  User,
  Wallet,
  Calculator,
  Info,
  CheckCircle,
  Loader2,
  CreditCard,
  IndianRupee,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

interface Borrower {
  borrower: SetStateAction<Borrower | null>;
  borrowerId: string;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
}

interface RiskAssessment {
  id: string;
  borrowerId: string;
  riskScore: number;
  riskLevel: string;
  lastEvaluatedAt: string;
}

interface GetRiskAssessmentResponse {
  message: string;
  data: RiskAssessment;
}

interface GetBorrowersResponse {
  message: string;
  data: Borrower;
}

const CreateLoan = () => {
  const navigate = useNavigate();
  const { borrowerId } = useParams();
  const [borrowerDetails, setBorrowerDetails] = useState<Borrower | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingBorrower, setLoadingBorrower] = useState(true);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [loadingRisk, setLoadingRisk] = useState(false);

  const [formData, setFormData] = useState({
    principalAmount: "",
    upfrontDeductedAmount: "",
    dailyRepaymentAmount: "",
    daysToRepay: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  });

  const [errors, setErrors] = useState({
    principalAmount: "",
    upfrontDeductedAmount: "",
    dailyRepaymentAmount: "",
    daysToRepay: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch borrower details on component mount
  useEffect(() => {
    if (borrowerId) {
      fetchBorrowerDetails();
      fetchRiskAssessment();
    }
  }, []);

  // Fetch borrower details
  const fetchBorrowerDetails = async () => {
    setLoadingBorrower(true);
    try {
      const response = await api.get<GetBorrowersResponse>(
        ApiRoutes.getBorrowerInfo.path.replace(":borrowerId", borrowerId ?? ""),
        {
          authenticate: ApiRoutes.getBorrowerInfo.authenticate,
        } as CustomAxiosRequestConfig
      );

      //   console.log("Borrower details:", response.data);

      setBorrowerDetails(response.data.borrower);
      setLoadingBorrower(false);
    } catch {
      toast.error("Failed to fetch borrower details");
      setLoadingBorrower(false);
    }
  };

  // Fetch risk assessment data
  const fetchRiskAssessment = async () => {
    setLoadingRisk(true);
    try {
      const response = await api.get<GetRiskAssessmentResponse>(
        ApiRoutes.getRiskAssessment.path.replace(
          ":borrowerId",
          borrowerId ?? ""
        ),
        {
          authenticate: ApiRoutes.getRiskAssessment.authenticate,
        } as CustomAxiosRequestConfig
      );

      setRiskAssessment(response.data);
      setLoadingRisk(false);
    } catch {
      // Silent fail - we'll just not show risk assessment if it fails
      setLoadingRisk(false);
    }
  };

  // Handle amount input changes with auto calculations
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as {
      name: keyof typeof errors;
      value: string;
    };
    const numericValue = value.replace(/[^0-9.]/g, "");

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: numericValue };

      // Auto calculate other fields when principal amount changes
      if (name === "principalAmount" && numericValue) {
        const principal = parseFloat(numericValue);
        updatedForm.upfrontDeductedAmount = (principal * 0.1).toFixed(2); // 10% of principal
        updatedForm.dailyRepaymentAmount = (principal / 100).toFixed(2); // 1% of principal
      }

      return updatedForm;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle day selection for repayment
  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const currentDays = [...prev.daysToRepay];

      if (currentDays.includes(day)) {
        // Remove day if already selected
        return {
          ...prev,
          daysToRepay: currentDays.filter((d) => d !== day),
        };
      } else {
        // Add day if not selected
        return {
          ...prev,
          daysToRepay: [...currentDays, day],
        };
      }
    });

    // Clear error when user selects days
    if (errors.daysToRepay) {
      setErrors((prev) => ({
        ...prev,
        daysToRepay: "",
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      principalAmount: "",
      upfrontDeductedAmount: "",
      dailyRepaymentAmount: "",
      daysToRepay: "",
    };

    // Principal amount validation
    if (!formData.principalAmount.trim()) {
      newErrors.principalAmount = "Principal amount is required";
      isValid = false;
    } else if (parseFloat(formData.principalAmount) <= 0) {
      newErrors.principalAmount = "Principal amount must be greater than zero";
      isValid = false;
    }

    // Upfront deducted amount validation
    if (!formData.upfrontDeductedAmount.trim()) {
      newErrors.upfrontDeductedAmount = "Upfront deducted amount is required";
      isValid = false;
    } else if (parseFloat(formData.upfrontDeductedAmount) < 0) {
      newErrors.upfrontDeductedAmount =
        "Upfront deducted amount cannot be negative";
      isValid = false;
    } else if (
      parseFloat(formData.upfrontDeductedAmount) >=
      parseFloat(formData.principalAmount)
    ) {
      newErrors.upfrontDeductedAmount =
        "Upfront deducted amount cannot exceed principal amount";
      isValid = false;
    }

    // Daily repayment amount validation
    if (!formData.dailyRepaymentAmount.trim()) {
      newErrors.dailyRepaymentAmount = "Daily repayment amount is required";
      isValid = false;
    } else if (parseFloat(formData.dailyRepaymentAmount) <= 0) {
      newErrors.dailyRepaymentAmount =
        "Daily repayment amount must be greater than zero";
      isValid = false;
    }

    // Days to repay validation
    if (formData.daysToRepay.length === 0) {
      newErrors.daysToRepay = "At least one repayment day must be selected";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert string values to numbers for API
      const apiFormData = {
        ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        upfrontDeductedAmount: parseFloat(formData.upfrontDeductedAmount),
        dailyRepaymentAmount: parseFloat(formData.dailyRepaymentAmount),
      };

      await api.post(
        ApiRoutes.issueLoan.path.replace(":borrowerId", borrowerId ?? ""),
        apiFormData,
        {
          authenticate: ApiRoutes.issueLoan.authenticate,
        } as CustomAxiosRequestConfig
      );

      setLoading(false);
      setSuccess(true);
      toast.success("Loan issued successfully!");

      // Redirect to loans page after success
      setTimeout(() => {
        navigate("/loans");
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to issue loan");
      console.error("Error issuing loan:", error);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low_Risk":
        return "bg-green-100 text-green-800";
      case "Medium_Risk":
        return "bg-yellow-100 text-yellow-800";
      case "High_Risk":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate loan statistics
  const calculateLoanStats = () => {
    const principal = parseFloat(formData.principalAmount) || 0;
    const upfront = parseFloat(formData.upfrontDeductedAmount) || 0;
    const daily = parseFloat(formData.dailyRepaymentAmount) || 0;
    const daysCount = formData.daysToRepay.length;

    // Avoid division by zero
    if (daily === 0 || daysCount === 0)
      return { disbursed: principal - upfront, daysToComplete: 0 };

    const totalToRepay = principal;
    const weeklyRepayment = daily * daysCount;
    const weeksToComplete = Math.ceil(totalToRepay / weeklyRepayment);
    const daysToComplete = weeksToComplete * 7;

    return {
      disbursed: principal - upfront,
      daysToComplete,
      totalWeeks: weeksToComplete,
    };
  };

  const loanStats = calculateLoanStats();

  if (loadingBorrower) {
    return (
      <div className='flex flex-col h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#670FC5]'></div>
        <p className='mt-4 text-gray-600'>Loading borrower details...</p>
      </div>
    );
  }

  if (!borrowerDetails && !loadingBorrower) {
    return (
      <div className='flex flex-col h-full items-center justify-center pb-20'>
        <Info size={48} className='text-red-500 mb-4' />
        <p className='text-lg font-medium text-gray-800'>Borrower not found</p>
        <p className='mt-2 text-gray-600'>
          The requested borrower could not be found
        </p>
        <button
          onClick={() => navigate("/borrowers")}
          className='mt-6 bg-[#670FC5] text-white px-6 py-2 rounded-lg font-medium'
        >
          Back to Borrowers
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Issue New Loan</h1>
          <p className='text-sm opacity-80'>
            Create a new loan for {borrowerDetails?.name || "borrower"}
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <PiggyBank size={16} className='mr-2' />
              <span>Loan Configuration</span>
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
                Loan Issued Successfully!
              </h3>
              <p className='text-gray-600 text-center mb-6'>
                The loan has been created and assigned to the borrower.
              </p>
              <button
                onClick={() => navigate("/loans")}
                className='bg-[#670FC5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5a0db1] transition-colors'
              >
                View All Loans
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Borrower Info */}
              <div className='mb-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                    <User size={20} className='text-[#670FC5]' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h2 className='font-semibold text-gray-800'>
                          {borrowerDetails?.name || "Borrower"}
                        </h2>
                        <p className='text-sm text-gray-500'>
                          {borrowerDetails?.phoneNumber ||
                            "Phone number unavailable"}
                        </p>
                      </div>

                      {loadingRisk ? (
                        <div className='flex items-center'>
                          <Loader2
                            size={16}
                            className='animate-spin text-gray-400 mr-1'
                          />
                          <span className='text-xs text-gray-500'>
                            Loading risk...
                          </span>
                        </div>
                      ) : riskAssessment?.riskLevel ? (
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                            riskAssessment.riskLevel
                          )}`}
                        >
                          {riskAssessment.riskLevel.replace("_", " ")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Details Section */}
              <div className='mb-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                    <PiggyBank size={20} className='text-[#670FC5]' />
                  </div>
                  <h2 className='font-semibold text-gray-800'>Loan Details</h2>
                </div>

                <div className='space-y-4'>
                  {/* Principal Amount Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Principal Amount <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Wallet size={16} className='text-gray-400' />
                      </div>
                      <input
                        type='text'
                        name='principalAmount'
                        value={formData.principalAmount}
                        onChange={handleAmountChange}
                        placeholder='Enter loan amount'
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.principalAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    {errors.principalAmount && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.principalAmount}
                      </p>
                    )}
                  </div>

                  {/* Upfront Deducted Amount Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Upfront Deducted Amount{" "}
                      <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <CreditCard size={16} className='text-gray-400' />
                      </div>
                      <input
                        type='text'
                        name='upfrontDeductedAmount'
                        value={formData.upfrontDeductedAmount}
                        onChange={handleAmountChange}
                        placeholder='Amount deducted upfront'
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.upfrontDeductedAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    <p className='mt-1 text-xs text-gray-500'>
                      Default: 10% of principal amount
                    </p>
                    {errors.upfrontDeductedAmount && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.upfrontDeductedAmount}
                      </p>
                    )}
                  </div>

                  {/* Daily Repayment Amount Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Daily Repayment Amount{" "}
                      <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <IndianRupee size={16} className='text-gray-400' />
                      </div>
                      <input
                        type='text'
                        name='dailyRepaymentAmount'
                        value={formData.dailyRepaymentAmount}
                        onChange={handleAmountChange}
                        placeholder='Amount to be paid each day'
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.dailyRepaymentAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent`}
                      />
                    </div>
                    <p className='mt-1 text-xs text-gray-500'>
                      Default: 1% of principal amount
                    </p>
                    {errors.dailyRepaymentAmount && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.dailyRepaymentAmount}
                      </p>
                    )}
                  </div>

                  {/* Days to Repay Field */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Repayment Days <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type='button'
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.daysToRepay.includes(day)
                              ? "bg-[#670FC5] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    {errors.daysToRepay && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.daysToRepay}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Loan Stats Preview */}
              <div className='mb-6 bg-blue-50 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <Calculator size={18} className='text-blue-600' />
                  <h3 className='font-medium text-blue-800'>Loan Summary</h3>
                </div>

                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <p className='text-gray-600'>Principal Amount:</p>
                    <p className='font-semibold'>
                      {formData.principalAmount
                        ? formatCurrency(
                            parseFloat(formData.principalAmount) || 0
                          )
                        : "₹0"}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Amount Disbursed:</p>
                    <p className='font-semibold'>
                      {formatCurrency(loanStats.disbursed)}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Repayment Days:</p>
                    <p className='font-semibold'>
                      {formData.daysToRepay.length} days per week
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Estimated Duration:</p>
                    <p className='font-semibold'>
                      {loanStats.daysToComplete} days ({loanStats.totalWeeks}{" "}
                      weeks)
                    </p>
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
                      Issuing Loan...
                    </>
                  ) : (
                    <>
                      <PiggyBank size={18} className='mr-2' />
                      Issue Loan
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
            About Loan Terms
          </h3>

          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                The <strong>upfront deducted amount</strong> is deducted from
                the principal and kept as interest/fees
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Borrowers will receive the principal minus the upfront deducted
                amount
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                The <strong>daily repayment amount</strong> is the amount the
                borrower will pay on each repayment day
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Repayments will follow the weekly schedule until the full
                principal amount is repaid
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateLoan;
