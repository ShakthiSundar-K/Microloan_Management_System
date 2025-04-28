/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Book,
  Info,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wallet,
  BarChart2,
  PieChart,
  Settings,
  Search,
  Plus,
} from "lucide-react";

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("introduction");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "traditional-lending", title: "The Legacy of Traditional Lending" },
    { id: "local-lender", title: "The Reality of the Local Lender" },
    { id: "thandal-model", title: "The Emergence of Thandal" },
    { id: "tms-intro", title: "Introducing TMS" },
    { id: "core-modules", title: "Core Modules & Workflows" },
    { id: "quick-access", title: "Quick Access Tools" },
    { id: "financial-intelligence", title: "Financial Intelligence" },
    { id: "conclusion", title: "Conclusion" },
  ];

  const modules = [
    { id: "existing-loans", title: "Migrating Existing Loans" },
    { id: "daily-repayment", title: "Daily Repayment Collection" },
    { id: "closing-day", title: "Closing the Day" },
    { id: "cash-in-hand", title: "Cash in Hand" },
    { id: "todays-collection", title: "Today's Collection" },
    { id: "financial-summary", title: "Financial Summary" },
  ];

  const quickAccess = [
    { id: "loans", title: "Loans" },
    { id: "borrowers", title: "Borrowers" },
    { id: "new-loan", title: "New Loan Issuance" },
  ];

  const handleScroll = () => {
    // Find which section is currently most visible
    let currentSection = "introduction";
    let maxVisibility = 0;

    Object.entries(sectionRefs.current).forEach(([id, ref]) => {
      if (!ref) return;

      const element = ref;
      const rect = element.getBoundingClientRect();

      // Calculate how much of the section is visible in the viewport
      const visibility =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

      if (visibility > maxVisibility && visibility > 0) {
        maxVisibility = visibility;
        currentSection = id;
      }
    });

    if (currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Banner */}
      <div className='bg-[#002866] text-white px-4 pb-10 pt-4 relative mb-6'>
        <button
          title='Go Back'
          className='absolute left-2 top-4 flex items-center text-white'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <div className='text-center pt-6 pb-4'>
          <h1 className='text-xl font-bold mb-2'>TMS Documentation</h1>
          <p className='text-sm opacity-80'>
            Complete guide to Thandal Management System
          </p>
          <div className='flex justify-center mt-4'>
            <div className='bg-white/10 px-4 py-2 rounded-full text-sm flex items-center'>
              <Book size={16} className='mr-2' />
              <span>User Guide & Reference</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 pb-20 relative'>
        <div className='lg:flex gap-6'>
          {/* Sidebar Navigation */}
          <div className='lg:w-72 mb-6 lg:mb-0'>
            <div className='bg-white rounded-lg shadow-md p-4 sticky top-20'>
              <div className='mb-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <Search size={18} className='text-[#670FC5]' />
                  <input
                    type='text'
                    placeholder='Search documentation...'
                    className='w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#670FC5] focus:border-transparent'
                  />
                </div>
              </div>

              <nav className='space-y-1'>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center text-left px-3 py-2 rounded-lg text-sm ${
                      activeSection === section.id
                        ? "bg-[#F3EFFC] text-[#670FC5] font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {activeSection === section.id && (
                      <div className='w-1 h-4 bg-[#670FC5] rounded-full mr-2'></div>
                    )}
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>

              <div className='mt-6 pt-4 border-t border-gray-100'>
                <button
                  onClick={() => navigate("/dashboard")}
                  className='w-full bg-[#670FC5] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5a0db1] transition-colors flex items-center justify-center'
                >
                  <ArrowLeft size={16} className='mr-2' />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Documentation Content */}
          <div className='lg:flex-1'>
            {/* Introduction */}
            <section
              id='introduction'
              ref={(el) => {
                sectionRefs.current.introduction = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-[#F3EFFC] p-3 rounded-full flex items-center justify-center'>
                  <Book size={20} className='text-[#670FC5]' />
                </div>
                <h2 className='text-xl font-semibold text-gray-800'>
                  Thandal Management System (TMS)
                </h2>
              </div>
              <div className='prose max-w-none'>
                <h3 className='text-lg font-medium text-gray-800 mb-3'>
                  A Story of Money, Risk, and a Smarter Way Forward
                </h3>
                <p className='text-gray-600 mb-4'>
                  Welcome to the TMS documentation. This guide provides a
                  comprehensive overview of the Thandal Management System and
                  detailed instructions on how to use all its features
                  effectively.
                </p>
                <div className='bg-blue-50 rounded-lg p-4  my-4'>
                  <div className='flex items-start gap-3'>
                    <Info
                      size={18}
                      className='text-blue-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-blue-800 font-medium'>
                        This documentation is designed for:
                      </p>
                      <ul className='mt-2 space-y-1 text-blue-700'>
                        <li>
                          • Individual lenders managing multiple Thandal loans
                        </li>
                        <li>
                          • Small businesses implementing the Thandal model
                        </li>
                        <li>• New users getting started with TMS</li>
                        <li>
                          • Experienced users looking for specific feature
                          guides
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Legacy of Traditional Lending */}
            <section
              id='traditional-lending'
              ref={(el) => {
                sectionRefs.current["traditional-lending"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <DollarSign size={18} className='text-[#670FC5]' />
                </div>
                1. The Legacy of Traditional Lending
              </h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  For decades, lending has followed a familiar pattern: give
                  someone a sum of money, and every month, they pay interest
                  until—eventually—they repay the principal.
                </p>
                <p className='text-gray-600 mb-4'>
                  This model is reliable for banks and large financial
                  institutions. Why? Because they demand collateral. If a
                  borrower defaults, the lender has something to fall back on.
                  The risk is controlled, and the process is justified.
                </p>
                <p className='text-gray-600 mb-2 font-medium'>
                  But not everyone is a bank.
                </p>
              </div>
            </section>

            {/* The Reality of the Local Lender */}
            <section
              id='local-lender'
              ref={(el) => {
                sectionRefs.current["local-lender"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <Users size={18} className='text-[#670FC5]' />
                </div>
                2. The Reality of the Local Lender
              </h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  Many individuals and small business owners possess idle
                  capital—savings they want to grow. These local lenders often
                  step in where banks won't: offering small-to-medium loans (₹5
                  to ₹10 lakhs) without requiring collateral.
                </p>
                <p className='text-gray-600 mb-4'>
                  The business is attractive. Monthly interest provides
                  consistent returns. But the model is flawed:
                </p>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                  <div className='bg-red-50 rounded-lg p-4'>
                    <h4 className='font-medium text-red-800 mb-2'>
                      Capital Locking
                    </h4>
                    <p className='text-red-700 text-sm'>
                      Principal remains tied up for years.
                    </p>
                  </div>
                  <div className='bg-red-50 rounded-lg p-4'>
                    <h4 className='font-medium text-red-800 mb-2'>High Risk</h4>
                    <p className='text-red-700 text-sm'>
                      No collateral means if a borrower defaults, the lender
                      absorbs the loss.
                    </p>
                  </div>
                  <div className='bg-red-50 rounded-lg p-4'>
                    <h4 className='font-medium text-red-800 mb-2'>
                      Repayment Stress
                    </h4>
                    <p className='text-red-700 text-sm'>
                      Borrowers often struggle to return the principal, leading
                      to delays, tension, and defaults.
                    </p>
                  </div>
                </div>
                <p className='text-gray-700 font-medium'>
                  There had to be a better way.
                </p>
              </div>
            </section>

            {/* The Emergence of Thandal */}
            <section
              id='thandal-model'
              ref={(el) => {
                sectionRefs.current["thandal-model"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <Wallet size={18} className='text-[#670FC5]' />
                </div>
                3. The Emergence of Thandal
              </h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  Enter <span className='font-medium'>Thandal</span> — a
                  localized, smart, and borrower-friendly lending model.
                </p>
                <p className='text-gray-600 mb-4'>Here's how it works:</p>
                <ul className='list-disc pl-5 text-gray-600 mb-6 space-y-2'>
                  <li>
                    Lenders provide capital to small businesses that generate
                    <span className='font-medium'> daily income</span> (e.g.,
                    fruit vendors, flower shops, street-side retailers).
                  </li>
                  <li>
                    <span className='font-medium'>
                      Profit is deducted upfront
                    </span>{" "}
                    — usually 10% of the loan amount.
                  </li>
                  <li>
                    Borrowers repay{" "}
                    <span className='font-medium'>only the principal</span>,
                    spread evenly across{" "}
                    <span className='font-medium'>100 daily installments</span>.
                  </li>
                </ul>

                <div className='bg-green-50 rounded-lg p-5 mb-6'>
                  <h4 className='font-medium text-green-800 mb-3'>Example:</h4>
                  <div className='border-l-4 border-green-500 pl-4'>
                    <p className='text-green-800 mb-3'>
                      A fruit seller borrows ₹50,000.
                    </p>
                    <ul className='space-y-2 text-green-700'>
                      <li>• ₹5,000 (10%) is deducted as profit.</li>
                      <li>• The seller receives ₹45,000.</li>
                      <li>
                        • Repays ₹500 per day for 100 days until he pays
                        ₹50,000.
                      </li>
                    </ul>
                  </div>
                </div>

                <h4 className='font-medium text-gray-700 mb-3'>
                  This model offers:
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div className='bg-blue-50 rounded-lg p-4 text-center'>
                    <h5 className='font-medium text-blue-800 mb-2'>
                      Reduced borrower burden
                    </h5>
                    <p className='text-blue-700 text-sm'>
                      Small daily payments fit cashflow
                    </p>
                  </div>
                  <div className='bg-blue-50 rounded-lg p-4 text-center'>
                    <h5 className='font-medium text-blue-800 mb-2'>
                      Faster capital rotation
                    </h5>
                    <p className='text-blue-700 text-sm'>
                      Complete cycle in 100 days
                    </p>
                  </div>
                  <div className='bg-blue-50 rounded-lg p-4 text-center'>
                    <h5 className='font-medium text-blue-800 mb-2'>
                      Continuous cash flow
                    </h5>
                    <p className='text-blue-700 text-sm'>
                      Daily returns can be reinvested
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Scaling Thandal */}
            <section
              id='scaling-thandal'
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h3 className='text-gray-800 font-medium mb-4'>
                4. Scaling Thandal: The Problem of Pen and Paper
              </h3>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  While Thandal is elegant, its execution becomes complex when
                  scaled. Imagine managing:
                </p>
                <ul className='list-disc pl-5 text-gray-600 mb-6 space-y-2'>
                  <li>50+ borrowers</li>
                  <li>Daily repayments</li>
                  <li>Missed or delayed payments</li>
                  <li>Idle vs. active capital</li>
                </ul>
                <p className='text-gray-600 mb-6'>
                  Doing this on paper is not just tedious—it's dangerous. Errors
                  creep in. Time is lost. Profits are affected.
                </p>
                <p className='text-gray-700 font-medium'>
                  That's where the{" "}
                  <span className='text-[#670FC5]'>
                    Thandal Management System (TMS)
                  </span>{" "}
                  steps in.
                </p>
              </div>
            </section>

            {/* TMS Intro */}
            <section
              id='tms-intro'
              ref={(el) => {
                sectionRefs.current["tms-intro"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <Settings size={18} className='text-[#670FC5]' />
                </div>
                Introducing the Thandal Management System (TMS)
              </h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  TMS is a professional, elegant web-based application designed
                  to manage the complete lifecycle of Thandal loans—from
                  borrower registration to repayment tracking, capital
                  management, and risk evaluation.
                </p>
                <div className='bg-[#F3EFFC] p-4 rounded-lg text-center mb-6'>
                  <p className='text-[#670FC5] font-medium'>
                    Its mission is simple:{" "}
                    <span className='font-bold'>
                      Digitize and scale Thandal lending without losing control.
                    </span>
                  </p>
                </div>

                <h3 className='font-medium text-gray-800 mb-4'>
                  Key Features at a Glance
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 mt-0.5'>
                      <CheckCircle size={16} className='text-[#670FC5]' />
                    </div>
                    <p className='text-gray-600 text-sm'>
                      Digitally register and manage existing and new loans
                    </p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 mt-0.5'>
                      <CheckCircle size={16} className='text-[#670FC5]' />
                    </div>
                    <p className='text-gray-600 text-sm'>
                      Collect, record, and auto-close daily repayments
                    </p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 mt-0.5'>
                      <CheckCircle size={16} className='text-[#670FC5]' />
                    </div>
                    <p className='text-gray-600 text-sm'>
                      Track idle capital and capital in rotation
                    </p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 mt-0.5'>
                      <CheckCircle size={16} className='text-[#670FC5]' />
                    </div>
                    <p className='text-gray-600 text-sm'>
                      View real-time repayment progress and financial summaries
                    </p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 mt-0.5'>
                      <CheckCircle size={16} className='text-[#670FC5]' />
                    </div>
                    <p className='text-gray-600 text-sm'>
                      Manage borrower profiles, risk scores, and loan history
                    </p>
                  </div>
                </div>

                <div className='bg-amber-50 rounded-lg p-4 flex items-start gap-3'>
                  <AlertTriangle
                    size={20}
                    className='text-amber-600 mt-0.5 flex-shrink-0'
                  />
                  <div>
                    <p className='text-amber-800 font-medium'>Important Note</p>
                    <p className='text-amber-700 text-sm mt-1'>
                      TMS is designed to replace manual record-keeping entirely.
                      For best results, migrate all your existing loans into the
                      system and commit to using it as your sole management
                      tool.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Modules Section */}
            <section
              id='core-modules'
              ref={(el) => {
                sectionRefs.current["core-modules"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <Settings size={18} className='text-[#670FC5]' />
                </div>
                Core Modules & Workflows
              </h2>

              <div className='mb-6'>
                <nav className='flex flex-wrap gap-2 mb-4'>
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => scrollToSection(module.id)}
                      className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-colors'
                    >
                      {module.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 1. Migrating Existing Loans */}
              <div
                id='existing-loans'
                ref={(el) => {
                  sectionRefs.current["existing-loans"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      1
                    </div>
                  </div>
                  Migrating Existing Loans
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Register Existing Loans
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    Lenders can move their physical records into TMS, ensuring a
                    smooth transition from paper to digital.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Migration Steps:
                    </h4>
                    <ol className='list-decimal pl-5 text-gray-600 space-y-2'>
                      <li>
                        Navigate to "Register Existing Loans" from the Home
                        screen
                      </li>
                      <li>Choose an existing borrower or create a new one</li>
                      <li>
                        Enter loan details (principal amount, issue date,
                        repayments already made)
                      </li>
                      <li>
                        TMS begins tracking repayments automatically from the
                        present day
                      </li>
                    </ol>
                  </div>

                  <div className='bg-amber-50 rounded-lg p-4 flex items-start gap-3'>
                    <AlertTriangle
                      size={16}
                      className='text-amber-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-amber-800 text-sm font-medium'>
                        For partially paid loans:
                      </p>
                      <p className='text-amber-700 text-xs mt-1'>
                        Enter the original loan amount and then mark the
                        appropriate number of repayments as "Paid" to reflect
                        the current state of the loan. This ensures your
                        financial calculations remain accurate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Daily Repayment Collection */}
              <div
                id='daily-repayment'
                ref={(el) => {
                  sectionRefs.current["daily-repayment"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      2
                    </div>
                  </div>
                  Daily Repayment Collection
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Collect Today's Repayments
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    This module is where you'll spend most of your daily time,
                    collecting and recording payments from borrowers.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Collection Process:
                    </h4>
                    <ul className='text-gray-600 space-y-2'>
                      <li className='flex items-start gap-2'>
                        <div className='min-w-4 mt-1'>1.</div>
                        <div>
                          <span className='font-medium'>
                            View all repayments due today
                          </span>{" "}
                          - A list of all borrowers with payments scheduled for
                          today
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='min-w-4 mt-1'>2.</div>
                        <div>
                          <span className='font-medium'>
                            For each borrower:
                          </span>
                          <ul className='pl-4 mt-1 space-y-1'>
                            <li>
                              • See repayment details (expected amount, due
                              date, status)
                            </li>
                            <li>• Edit and record the amount paid</li>
                            <li>
                              • Automatically update repayment status based on
                              amount and timing
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Repayment Status Types:
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-green-500'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid
                        </span>
                        <span className='text-xs text-gray-500'>
                          Full payment on time
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-red-500'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Unpaid
                        </span>
                        <span className='text-xs text-gray-500'>
                          Not yet paid today
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-red-600'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Missed
                        </span>
                        <span className='text-xs text-gray-500'>
                          Day closed without payment
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-amber-500'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid_Late
                        </span>
                        <span className='text-xs text-gray-500'>
                          Full payment after due date
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid_in_Advance
                        </span>
                        <span className='text-xs text-gray-500'>
                          Full payment before due
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-amber-400'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid_Partial
                        </span>
                        <span className='text-xs text-gray-500'>
                          Partial amount on time
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-amber-600'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid_Partial_Late
                        </span>
                        <span className='text-xs text-gray-500'>
                          Partial after due date
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-blue-400'></div>
                        <span className='text-sm font-medium text-gray-700'>
                          Paid_Partial_Advance
                        </span>
                        <span className='text-xs text-gray-500'>
                          Partial before due
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Closing the Day */}
              <div
                id='closing-day'
                ref={(el) => {
                  sectionRefs.current["closing-day"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      3
                    </div>
                  </div>
                  Closing the Day
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Close Today's Repayments
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    At the end of each business day, you need to close the day's
                    transactions, which finalizes all payment statuses and
                    updates your capital tracking.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Closing Process:
                    </h4>
                    <ul className='text-gray-600 space-y-2'>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <span>
                          All remaining unpaid repayments are marked{" "}
                          <span className='font-medium text-red-600'>
                            Missed
                          </span>
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <span>
                          The day's collection is added to capital tracking
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <span>Further edits for the day are locked</span>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
                    <Info
                      size={16}
                      className='text-blue-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-blue-800 text-sm font-medium'>
                        Auto-close happens daily at{" "}
                        <span className='font-bold'>11:59 PM</span>
                      </p>
                      <p className='text-blue-700 text-xs mt-1'>
                        If you forget to close the day manually, the system will
                        automatically perform the close operation at midnight,
                        ensuring your records stay consistent.
                      </p>
                    </div>
                  </div>

                  <div className='mt-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Clock size={16} className='text-[#670FC5]' />
                      <span className='text-gray-700 font-medium'>
                        Process Timeline
                      </span>
                    </div>
                    <div className='relative pl-6 border-l-2 border-dashed border-gray-300'>
                      <div className='mb-4 relative'>
                        <div className='absolute w-3 h-3 bg-green-500 rounded-full -left-7 mt-1.5'></div>
                        <div>
                          <p className='font-medium text-gray-700'>
                            During Business Hours
                          </p>
                          <p className='text-sm text-gray-600'>
                            Collect and record repayments as they come in
                          </p>
                        </div>
                      </div>
                      <div className='mb-4 relative'>
                        <div className='absolute w-3 h-3 bg-amber-500 rounded-full -left-7 mt-1.5'></div>
                        <div>
                          <p className='font-medium text-gray-700'>
                            End of Business Day
                          </p>
                          <p className='text-sm text-gray-600'>
                            Manually close payments using "Close Today's
                            Repayments"
                          </p>
                        </div>
                      </div>
                      <div className='relative'>
                        <div className='absolute w-3 h-3 bg-red-500 rounded-full -left-7 mt-1.5'></div>
                        <div>
                          <p className='font-medium text-gray-700'>11:59 PM</p>
                          <p className='text-sm text-gray-600'>
                            Auto-closure if manual closure was not performed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Cash in Hand */}
              <div
                id='cash-in-hand'
                ref={(el) => {
                  sectionRefs.current["cash-in-hand"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      4
                    </div>
                  </div>
                  Cash in Hand
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Cash in Hand
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    This represents your{" "}
                    <span className='font-medium'>idle capital</span> — funds
                    available for lending. Accurate tracking ensures better
                    lending decisions.
                  </p>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='bg-green-50 rounded-lg p-4'>
                      <h4 className='flex items-center gap-2 font-medium text-green-800 mb-2'>
                        <Plus size={16} />
                        <span>Add Cash</span>
                      </h4>
                      <p className='text-green-700 text-sm'>
                        Record when receiving outside money from:
                      </p>
                      <ul className='mt-2 text-xs text-green-700 space-y-1'>
                        <li>• Investment injections</li>
                        <li>• Personal savings</li>
                        <li>• Repaid loans</li>
                        <li>• Daily collections</li>
                      </ul>
                    </div>
                    <div className='bg-red-50 rounded-lg p-4'>
                      <h4 className='flex items-center gap-2 font-medium text-red-800 mb-2'>
                        <ArrowRight size={16} />
                        <span>Subtract Cash</span>
                      </h4>
                      <p className='text-red-700 text-sm'>
                        Record when cash leaves the system:
                      </p>
                      <ul className='mt-2 text-xs text-red-700 space-y-1'>
                        <li>• New loans issued</li>
                        <li>• Withdrawals</li>
                        <li>• Business expenses</li>
                        <li>• Personal expenses</li>
                      </ul>
                    </div>
                  </div>

                  <div className='bg-amber-50 rounded-lg p-4 flex items-start gap-3'>
                    <AlertTriangle
                      size={16}
                      className='text-amber-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-amber-800 text-sm font-medium'>
                        Important for Financial Accuracy
                      </p>
                      <p className='text-amber-700 text-xs mt-1'>
                        Always update your Cash in Hand when funds enter or
                        leave your lending operation. This ensures your capital
                        calculations remain accurate and helps with financial
                        decision-making.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Today's Collection */}
              <div
                id='todays-collection'
                ref={(el) => {
                  sectionRefs.current["todays-collection"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      5
                    </div>
                  </div>
                  Today's Collection
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Today's Collection
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    A live display of collection progress that helps monitor
                    repayment performance during business hours.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-5 mb-4'>
                    <div className='mb-2 text-center'>
                      <span className='text-sm text-gray-500'>Example:</span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <div className='mb-3'>
                        <span className='text-2xl font-bold text-[#670FC5]'>
                          ₹1,500
                        </span>
                        <span className='text-gray-400 mx-2'>/</span>
                        <span className='text-lg text-gray-600'>₹3,000</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
                        <div className='bg-[#670FC5] h-2.5 rounded-full w-1/2'></div>
                      </div>
                      <div className='text-sm text-gray-500'>
                        50% collected so far today
                      </div>
                    </div>
                  </div>

                  <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
                    <Info
                      size={16}
                      className='text-blue-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-blue-800 text-sm'>
                        This dashboard element updates automatically whenever a
                        new payment is recorded in the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Financial Summary */}
              <div
                id='financial-summary'
                ref={(el) => {
                  sectionRefs.current["financial-summary"] = el;
                }}
                className='mb-4'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      6
                    </div>
                  </div>
                  Financial Summary
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Home → Financial Summary
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    Track high-level financial metrics to gain insights into
                    your lending operation's performance.
                  </p>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='bg-white border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-medium text-gray-700 mb-3'>
                        Key Metrics Tracked:
                      </h4>
                      <ul className='space-y-2 text-sm text-gray-600'>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <DollarSign size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Total loans issued</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <DollarSign size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Total profit earned</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <Users size={12} className='text-[#670FC5]' />
                          </div>
                          <span>New borrowers</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <PieChart size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Loan status breakdowns</span>
                        </li>
                      </ul>
                    </div>
                    <div className='bg-white border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-medium text-gray-700 mb-3'>
                        Performance Analysis:
                      </h4>
                      <ul className='space-y-2 text-sm text-gray-600'>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <BarChart2 size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Monthly performance</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <Calendar size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Historical comparisons</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <AlertTriangle
                              size={12}
                              className='text-[#670FC5]'
                            />
                          </div>
                          <span>Repayment risk analysis</span>
                        </li>
                        <li className='flex items-center gap-2'>
                          <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center'>
                            <Users size={12} className='text-[#670FC5]' />
                          </div>
                          <span>Borrower performance metrics</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
                    <Info
                      size={16}
                      className='text-blue-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-blue-800 text-sm'>
                        <span className='font-medium'>Pro Tip:</span> Click
                        "Update Now" to fetch the latest summary. This ensures
                        you're always viewing the most current financial data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Access Tools */}
            <section
              id='quick-access'
              ref={(el) => {
                sectionRefs.current["quick-access"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <Clock size={18} className='text-[#670FC5]' />
                </div>
                Quick Access Tools
              </h2>

              <div className='mb-6'>
                <nav className='flex flex-wrap gap-2 mb-4'>
                  {quickAccess.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => scrollToSection(tool.id)}
                      className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-colors'
                    >
                      {tool.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 1. Loans */}
              <div
                id='loans'
                ref={(el) => {
                  sectionRefs.current["loans"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      1
                    </div>
                  </div>
                  Loans
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Quick Access → Loans
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    View and manage all loans issued to date with comprehensive
                    details and statistics.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Loan Details View:
                    </h4>
                    <p className='text-gray-600 mb-3'>
                      Click on any loan to access detailed information:
                    </p>
                    <ul className='space-y-2 text-sm text-gray-600'>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <span>
                          Full repayment history with status breakdown
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <div>
                          <span>Repayment status breakdown</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Example: Paid: 70, Missed: 2, Late: 3
                          </p>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <CheckCircle size={12} className='text-[#670FC5]' />
                        </div>
                        <span>Options to close or delete loans</span>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-amber-50 rounded-lg p-4 flex items-start gap-3'>
                    <AlertTriangle
                      size={16}
                      className='text-amber-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-amber-800 text-sm font-medium'>
                        Managing Completed Loans
                      </p>
                      <p className='text-amber-700 text-xs mt-1'>
                        When a loan is fully repaid, use the "Close Loan" option
                        to mark it as completed rather than deleting it. This
                        preserves your historical data for financial analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Borrowers */}
              <div
                id='borrowers'
                ref={(el) => {
                  sectionRefs.current["borrowers"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      2
                    </div>
                  </div>
                  Borrowers
                </h3>

                <div className='pl-10'>
                  <div className='bg-blue-50 rounded-lg p-3 mb-4 inline-flex items-center'>
                    <span className='text-blue-800 font-medium text-sm'>
                      Quick Access → Borrowers
                    </span>
                  </div>

                  <p className='text-gray-600 mb-4'>
                    Manage borrower profiles, view their loan history, and
                    assess their risk levels.
                  </p>

                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Borrower Profile Features:
                    </h4>
                    <ul className='space-y-2 text-sm text-gray-600'>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <Users size={12} className='text-[#670FC5]' />
                        </div>
                        <div>
                          <span>Personal and contact information</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Name, phone, address, business type
                          </p>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <DollarSign size={12} className='text-[#670FC5]' />
                        </div>
                        <div>
                          <span>Complete loan history</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Current and previous loans with status
                          </p>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <AlertTriangle size={12} className='text-[#670FC5]' />
                        </div>
                        <div>
                          <span>Risk assessment score</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Based on payment history and behavior
                          </p>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <Settings size={12} className='text-[#670FC5]' />
                        </div>
                        <div>
                          <span>Quick actions</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Call, edit details, issue new loan
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
                    <Info
                      size={16}
                      className='text-blue-600 mt-0.5 flex-shrink-0'
                    />
                    <div>
                      <p className='text-blue-800 text-sm'>
                        <span className='font-medium'>Pro Tip:</span> Regularly
                        update borrower contact information to ensure you can
                        reach them regarding repayments or new loan
                        opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. New Loan Issuance */}

              <div
                id='new-loan'
                ref={(el) => {
                  sectionRefs.current["new-loan"] = el;
                }}
                className='mb-8'
              >
                <h3 className='font-medium text-gray-800 mb-3 flex items-center'>
                  <div className='bg-[#F3EFFC] rounded-full p-1.5 mr-2'>
                    <div className='bg-[#670FC5] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold'>
                      3
                    </div>
                  </div>
                  New Loan Issuance
                </h3>
                <div className='pl-10'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Loan Creation Process:
                    </h4>
                    <ul className='space-y-3 text-sm text-gray-600'>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <div className='text-[#670FC5] text-xs font-bold'>
                            1
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Select borrower</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            Choose an existing borrower or create a new one
                          </p>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <div className='text-[#670FC5] text-xs font-bold'>
                            2
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>
                            Enter loan details
                          </span>
                          <div className='mt-2 grid grid-cols-1 gap-2'>
                            <div className='bg-gray-50 p-2 rounded'>
                              <span className='text-xs font-medium'>
                                Principal Amount
                              </span>
                              <p className='text-xs text-gray-500'>
                                Total loan value
                              </p>
                            </div>
                            <div className='bg-gray-50 p-2 rounded'>
                              <span className='text-xs font-medium'>
                                Profit deduction (Auto-filled)
                              </span>
                              <p className='text-xs text-gray-500'>
                                10% of loan amount
                              </p>
                            </div>
                            <div className='bg-gray-50 p-2 rounded'>
                              <span className='text-xs font-medium'>
                                Daily repayment (Auto-filled)
                              </span>
                              <p className='text-xs text-gray-500'>
                                Principal ÷ 100
                              </p>
                            </div>
                            <div className='bg-gray-50 p-2 rounded'>
                              <span className='text-xs font-medium'>
                                Repayment days (Default)
                              </span>
                              <p className='text-xs text-gray-500'>
                                Monday to Saturday
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                          <div className='text-[#670FC5] text-xs font-bold'>
                            3
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Issue loan</span>
                          <p className='text-xs text-gray-500 mt-1'>
                            System automatically updates capital tracking and
                            generates repayment schedule
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-amber-50 rounded-lg p-4 flex items-start gap-3 mb-4'>
                    <div className='text-amber-600 mt-0.5 flex-shrink-0'>
                      ⚠️
                    </div>
                    <div>
                      <p className='text-amber-800 text-sm font-medium'>
                        Capital Management Note
                      </p>
                      <p className='text-amber-700 text-xs mt-1'>
                        When a new loan is issued, your idle capital decreases
                        by the amount disbursed (principal minus profit). The
                        system automatically makes these calculations for you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Intelligence */}
            <section
              id='financial-intelligence'
              ref={(el) => {
                sectionRefs.current["financial-intelligence"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <div className='text-[#670FC5]'>📊</div>
                </div>
                Financial Intelligence
              </h2>
              <div className='prose max-w-none'>
                <h3 className='text-md font-medium text-gray-800 mb-4'>
                  Capital Formula
                </h3>
                <div className='bg-gray-50 p-4 rounded-lg mb-6'>
                  <div className='overflow-x-auto'>
                    <pre className='font-mono text-gray-700 whitespace-nowrap'>
                      totalCapital = pendingLoanAmount + idleCapital
                    </pre>
                  </div>
                  <ul className='mt-3 space-y-2 text-sm text-gray-600'>
                    <li className='flex items-start gap-2'>
                      <div className='bg-green-100 rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                        <span className='text-green-700 text-xs'>↑</span>
                      </div>
                      <div>
                        <span>
                          Capital <strong>increases</strong> only when a{" "}
                          <strong>new loan</strong> is issued (due to upfront
                          profit)
                        </span>
                      </div>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='bg-blue-100 rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                        <span className='text-blue-700 text-xs'>↔️</span>
                      </div>
                      <div>
                        <span>
                          Daily repayments <strong>do not</strong> increase
                          total capital; they just rotate idle funds
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <h3 className='text-md font-medium text-gray-800 mb-4'>
                  Risk Assessment
                </h3>
                <p className='text-gray-600 mb-4'>
                  The system includes modules to calculate and display{" "}
                  <strong>borrower risk levels</strong> based on their payment
                  history. This helps lenders decide whether a borrower is
                  eligible for future loans.
                </p>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                  <div className='bg-green-50 rounded-lg p-4 text-center'>
                    <div className='text-2xl mb-2'>🟢</div>
                    <h5 className='font-medium text-green-800 mb-1'>
                      Low Risk
                    </h5>
                    <p className='text-green-700 text-xs'>
                      Few or no missed payments
                    </p>
                  </div>
                  <div className='bg-amber-50 rounded-lg p-4 text-center'>
                    <div className='text-2xl mb-2'>🟡</div>
                    <h5 className='font-medium text-amber-800 mb-1'>
                      Medium Risk
                    </h5>
                    <p className='text-amber-700 text-xs'>
                      Occasional delays or missed payments
                    </p>
                  </div>
                  <div className='bg-red-50 rounded-lg p-4 text-center'>
                    <div className='text-2xl mb-2'>🔴</div>
                    <h5 className='font-medium text-red-800 mb-1'>High Risk</h5>
                    <p className='text-red-700 text-xs'>
                      Frequent default history
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Conclusion */}
            <section
              id='conclusion'
              ref={(el) => {
                sectionRefs.current["conclusion"] = el;
              }}
              className='bg-white rounded-lg shadow-md p-6 mb-6'
            >
              <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <div className='bg-[#F3EFFC] p-2 rounded-full mr-3 flex items-center justify-center'>
                  <div className='text-[#670FC5]'>🏁</div>
                </div>
                Conclusion
              </h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 mb-4'>
                  The Thandal Management System is more than software. It's a
                  powerful narrative:
                </p>
                <ul className='space-y-3 text-gray-600 mb-6'>
                  <li className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                      <span className='text-[#670FC5]'>→</span>
                    </div>
                    <span>From outdated methods to modern efficiency</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                      <span className='text-[#670FC5]'>→</span>
                    </div>
                    <span>
                      From risk and manual errors to automation and clarity
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <div className='bg-[#F3EFFC] rounded-full p-1 flex items-center justify-center min-w-6 mt-0.5'>
                      <span className='text-[#670FC5]'>→</span>
                    </div>
                    <span>From idle capital to a dynamic financial engine</span>
                  </li>
                </ul>

                <div className='bg-[#F3EFFC] p-5 rounded-lg text-center'>
                  <p className='text-lg font-medium text-[#670FC5] mb-2'>
                    TMS is built for those who believe in smart lending,
                    reliable income, and scalable business.
                  </p>
                  <p className='text-[#670FC5] font-bold'>
                    Welcome to the future of local lending.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
