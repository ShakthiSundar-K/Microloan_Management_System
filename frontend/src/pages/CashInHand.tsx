import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  Wallet,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ApiRoutes from "../utils/ApiRoutes";
import api, { CustomAxiosRequestConfig } from "../service/ApiService";
import { toast } from "react-hot-toast";

interface CapitalData {
  id: string;
  userId: string;
  date: string;
  totalCapital: string;
  idleCapital: string;
  pendingLoanAmount: string;
  amountCollectedToday: string | null;
}

const CashInHand = () => {
  const navigate = useNavigate();
  const [capitalData, setCapitalData] = useState<CapitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState("");
  const [subtractAmount, setSubtractAmount] = useState("");
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showSubtractConfirm, setShowSubtractConfirm] = useState(false);
  const [confirmAmount, setConfirmAmount] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculatedIdleCapital, setCalculatedIdleCapital] = useState<
    string | null
  >(null);
  const [hasError, setHasError] = useState(false);

  // Fetch latest capital data
  useEffect(() => {
    const fetchCapitalData = async () => {
      setLoading(true);
      setHasError(false);
      try {
        // Assuming userId is stored in localStorage or can be retrieved
        const userId = localStorage.getItem("id") || "";
        const response = await api.get<{ message: string; data: CapitalData }>(
          ApiRoutes.getLatestCapital.path.replace(":userId", userId),
          {
            authenticate: ApiRoutes.getLatestCapital.authenticate,
          } as CustomAxiosRequestConfig
        );

        console.log("Capital data response:", response);

        setCapitalData(response.data);
        setCalculatedIdleCapital(response.data.idleCapital);
      } catch (error) {
        console.error("Error fetching capital data:", error);
        setHasError(true);
        // For new users with no capital data, we'll allow them to add initial cash
        // Set default values to enable the add cash functionality
        setCalculatedIdleCapital("0");
        toast.error(
          "No capital data found. You can add your initial cash below."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCapitalData();
  }, []);

  // Calculate new idle capital based on inputs
  useEffect(() => {
    const currentIdleCapital = capitalData
      ? parseFloat(capitalData.idleCapital)
      : 0;
    let newIdleCapital = currentIdleCapital;

    // Add extra cash if any
    if (addAmount) {
      newIdleCapital += parseFloat(addAmount);
    }

    // Subtract spent cash if any
    if (subtractAmount) {
      newIdleCapital -= parseFloat(subtractAmount);
    }

    // Ensure we don't go below zero
    newIdleCapital = Math.max(0, newIdleCapital);

    setCalculatedIdleCapital(newIdleCapital.toString());
  }, [addAmount, subtractAmount, capitalData]);

  // Handle confirmation input change
  const handleConfirmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmAmount(e.target.value);
  };

  // Handle form submission to update capital
  const handleUpdateCapital = async () => {
    // Calculate new values
    const currentIdleCapital = capitalData
      ? parseFloat(capitalData.idleCapital)
      : 0;
    const addValue = addAmount ? parseFloat(addAmount) : 0;
    const subtractValue = subtractAmount ? parseFloat(subtractAmount) : 0;
    const newIdleCapital = currentIdleCapital + addValue - subtractValue;

    // Prepare payload - only idleCapital is needed
    const payload = {
      idleCapital: Math.max(0, newIdleCapital),
    };

    setUpdating(true);
    try {
      await api.post(ApiRoutes.initializeCapital.path, payload, {
        authenticate: ApiRoutes.initializeCapital.authenticate,
      } as CustomAxiosRequestConfig);

      setSuccess(true);
      toast.success("Cash in hand updated successfully!");

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setAddAmount("");
        setSubtractAmount("");
        setConfirmAmount("");
        setShowAddConfirm(false);
        setShowSubtractConfirm(false);
        setHasError(false);

        // Fetch latest data
        const userId = localStorage.getItem("id") || "";
        api
          .get<{ message: string; data: CapitalData }>(
            ApiRoutes.getLatestCapital.path.replace(":userId", userId),
            {
              authenticate: ApiRoutes.getLatestCapital.authenticate,
            } as CustomAxiosRequestConfig
          )
          .then((response) => {
            setCapitalData(response.data);
            setCalculatedIdleCapital(response.data.idleCapital);
          })
          .catch(() => {
            // If still no data after update, keep the add functionality available
            setCalculatedIdleCapital("0");
          });
      }, 1500);
    } catch (error) {
      console.error("Error updating capital:", error);
      toast.error("Failed to update cash in hand");
    } finally {
      setUpdating(false);
    }
  };

  // Handle add cash button click
  const handleAddCashClick = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error("Please enter a valid amount to add");
      return;
    }
    setShowAddConfirm(true);
  };

  // Handle subtract cash button click
  const handleSubtractCashClick = () => {
    if (!subtractAmount || parseFloat(subtractAmount) <= 0) {
      toast.error("Please enter a valid amount to spend");
      return;
    }

    const currentIdleCapital = capitalData
      ? parseFloat(capitalData.idleCapital)
      : 0;
    if (parseFloat(subtractAmount) > currentIdleCapital) {
      toast.error("You cannot spend more than your idle capital");
      return;
    }

    setShowSubtractConfirm(true);
  };

  // Confirm add cash
  const confirmAddCash = () => {
    if (confirmAmount !== addAmount) {
      toast.error("Confirmation amount doesn't match");
      return;
    }

    handleUpdateCapital();
    setShowAddConfirm(false);
  };

  // Confirm subtract cash
  const confirmSubtractCash = () => {
    if (confirmAmount !== subtractAmount) {
      toast.error("Confirmation amount doesn't match");
      return;
    }

    handleUpdateCapital();
    setShowSubtractConfirm(false);
  };

  // Format currency
  const formatCurrency = (value: string | null) => {
    if (!value) return "₹0";
    return `₹${parseFloat(value).toLocaleString("en-IN")}`;
  };

  // Calculate date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 pb-20'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-10'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>Cash In Hand</h1>
          <p className='text-sm opacity-80'>
            Manage your available funds and track capital
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Wallet size={16} className='mr-2' />
              <span>Idle Capital Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='px-4 -mt-6'>
        <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <Loader2 size={32} className='text-[#670FC5] animate-spin mb-4' />
              <p className='text-gray-600'>Loading capital data...</p>
            </div>
          ) : success ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <div className='bg-green-100 rounded-full p-3 mb-4'>
                <CheckCircle size={32} className='text-green-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Cash Updated Successfully!
              </h3>
              <p className='text-gray-600 text-center mb-6'>
                Your idle capital has been updated accordingly.
              </p>
            </div>
          ) : (
            <>
              {/* Capital Overview - Show if data exists */}
              {capitalData && (
                <div className='mb-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                      <Wallet size={20} className='text-[#670FC5]' />
                    </div>
                    <h2 className='font-semibold text-gray-800'>
                      Capital Overview
                    </h2>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='mb-3'>
                      <p className='text-xs text-gray-500'>Last Updated</p>
                      <p className='font-medium text-gray-700'>
                        {formatDate(capitalData.date)}
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4 mb-2'>
                      <div className='bg-white p-3 rounded-lg shadow-sm'>
                        <p className='text-xs text-gray-500 mb-1'>
                          Total Capital
                        </p>
                        <p className='text-lg font-bold text-gray-800'>
                          {formatCurrency(capitalData.totalCapital)}
                        </p>
                      </div>
                      <div className='bg-blue-50 p-3 rounded-lg shadow-sm'>
                        <p className='text-xs text-blue-600 mb-1'>
                          Cash In Hand
                        </p>
                        <p className='text-lg font-bold text-blue-700'>
                          {formatCurrency(capitalData.idleCapital)}
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-white p-3 rounded-lg shadow-sm'>
                        <p className='text-xs text-gray-500 mb-1'>
                          Pending Loans
                        </p>
                        <p className='text-lg font-bold text-gray-800'>
                          {formatCurrency(capitalData.pendingLoanAmount)}
                        </p>
                      </div>
                      <div className='bg-white p-3 rounded-lg shadow-sm'>
                        <p className='text-xs text-gray-500 mb-1'>
                          Today's Collection
                        </p>
                        <p className='text-lg font-bold text-gray-800'>
                          {formatCurrency(capitalData.amountCollectedToday)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message for new users */}
              {hasError && !capitalData && (
                <div className='mb-6'>
                  <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
                    <Info size={20} className='text-blue-600 mt-0.5' />
                    <div>
                      <p className='text-sm text-blue-800 font-medium'>
                        Welcome! Set up your initial cash
                      </p>
                      <p className='text-xs text-blue-700 mt-1'>
                        As a new user, add your starting capital below to begin
                        managing your funds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Cash Section - Always show */}
              <div className='mb-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                    <RefreshCw size={20} className='text-[#670FC5]' />
                  </div>
                  <h2 className='font-semibold text-gray-800'>
                    {hasError && !capitalData
                      ? "Add Initial Cash"
                      : "Update Cash"}
                  </h2>
                </div>

                {/* Add Extra Cash */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {hasError && !capitalData
                      ? "Add your starting capital"
                      : "Got extra cash to put in thandal?"}
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <PlusCircle size={16} className='text-green-500' />
                    </div>
                    <input
                      type='number'
                      min='0'
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder='Enter amount to add'
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                    />
                  </div>
                </div>

                {/* Subtract Spent Cash - Only show if there's existing capital */}
                {capitalData && (
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Spent some amount?
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <MinusCircle size={16} className='text-red-500' />
                      </div>
                      <input
                        type='number'
                        min='0'
                        max={capitalData.idleCapital}
                        value={subtractAmount}
                        onChange={(e) => setSubtractAmount(e.target.value)}
                        placeholder='Enter amount spent'
                        className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                      />
                    </div>
                  </div>
                )}

                {/* Calculated New Balance */}
                {(addAmount || subtractAmount) && (
                  <div className='bg-blue-50 rounded-lg p-4 mb-4 flex items-start gap-3'>
                    <Info size={20} className='text-blue-600 mt-0.5' />
                    <div>
                      <p className='text-sm text-blue-800'>
                        After this update, your cash in hand will be{" "}
                        <strong>{formatCurrency(calculatedIdleCapital)}</strong>
                      </p>
                      <p className='text-xs text-blue-700 mt-1'>
                        Review the amount before confirming
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  className={`grid ${
                    capitalData ? "grid-cols-2" : "grid-cols-1"
                  } gap-4 mt-4`}
                >
                  <button
                    type='button'
                    onClick={handleAddCashClick}
                    disabled={!addAmount || parseFloat(addAmount) <= 0}
                    className={`bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center ${
                      !addAmount || parseFloat(addAmount) <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <PlusCircle size={18} className='mr-2' />
                    {hasError && !capitalData ? "Add Initial Cash" : "Add Cash"}
                  </button>

                  {capitalData && (
                    <button
                      type='button'
                      onClick={handleSubtractCashClick}
                      disabled={
                        !subtractAmount ||
                        parseFloat(subtractAmount) <= 0 ||
                        parseFloat(subtractAmount) >
                          parseFloat(capitalData.idleCapital)
                      }
                      className={`bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center ${
                        !subtractAmount ||
                        parseFloat(subtractAmount) <= 0 ||
                        parseFloat(subtractAmount) >
                          parseFloat(capitalData.idleCapital)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <MinusCircle size={18} className='mr-2' />
                      Subtract Cash
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      {showAddConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-sm w-full p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
              Confirm Add Cash
            </h3>
            <p className='text-gray-600 mb-4'>
              Please confirm you want to add{" "}
              <strong>{formatCurrency(addAmount)}</strong> to your idle capital.
            </p>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Type the amount to confirm
              </label>
              <input
                type='number'
                value={confirmAmount}
                onChange={handleConfirmInputChange}
                placeholder={`Type ${addAmount} to confirm`}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowAddConfirm(false);
                  setConfirmAmount("");
                }}
                className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmAddCash}
                disabled={confirmAmount !== addAmount || updating}
                className={`flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center ${
                  confirmAmount !== addAmount || updating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {updating ? (
                  <>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubtractConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-sm w-full p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
              Confirm Subtract Cash
            </h3>
            <p className='text-gray-600 mb-4'>
              Please confirm you want to subtract{" "}
              <strong>{formatCurrency(subtractAmount)}</strong> from your idle
              capital.
            </p>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Type the amount to confirm
              </label>
              <input
                type='number'
                value={confirmAmount}
                onChange={handleConfirmInputChange}
                placeholder={`Type ${subtractAmount} to confirm`}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowSubtractConfirm(false);
                  setConfirmAmount("");
                }}
                className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmSubtractCash}
                disabled={confirmAmount !== subtractAmount || updating}
                className={`flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center ${
                  confirmAmount !== subtractAmount || updating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {updating ? (
                  <>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
            <Info size={16} className='mr-2 text-[#670FC5]' />
            About Cash Management
          </h3>

          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Cash in hand represents your idle capital that isn't currently
                loaned out
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Add cash when you receive money from external sources or
                investments
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Subtract cash when you spend money on business expenses or
                personal withdrawals
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <div className='min-w-4 mt-1'>•</div>
              <p>
                Regular updates ensure accurate financial reporting and loan
                management
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CashInHand;
