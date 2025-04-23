const ApiRoutes = {
  login: {
    path: "/api/user/login",
    authenticate: false,
  },
  register: {
    path: "/api/user/register",
    authenticate: false,
  },
  forgotPassword: {
    path: "/api/user/forgotPassword",
    authenticate: false,
  },
  resetPassword: {
    path: "/api/user/resetPassword",
    authenticate: false,
  },
  createBorrower: {
    path: "/api/borrower/create",
    authenticate: true,
  },
  getAllBorrowers: {
    path: "/api/borrower",
    authenticate: true,
  },
  getBorrowerByPhoneNumber: {
    path: "/api/borrower/getByPhoneNumber",
    authenticate: true,
  },
  getBorrowerByName: {
    path: "/api/borrower/getByName",
    authenticate: true,
  },
  updateBorrowerPassword: {
    path: "/api/borrower/updatePassword",
    authenticate: true,
  },
  deleteBorrower: {
    path: "/api/borrower/delete/:borrowerId",
    authenticate: true,
  },
  searchBorrowers: {
    path: "/api/borrower/search",
    authenticate: true,
  },
  getBorrowerInfo: {
    path: "/api/borrower/borrower-details/:borrowerId",
    authenticate: true,
  },
  getLoanHistory: {
    path: "/api/loan/history",
    authenticate: true,
  },
  issueLoan: {
    path: "/api/loan/issue/:borrowerId",
    authenticate: true,
  },
  getLoanDetails: {
    path: "/api/loan/:loanId",
    authenticate: true,
  },
  registerExistingLoan: {
    path: "/api/loan/register-existing-loan/:borrowerId",
    authenticate: true,
  },
  initializeCapital: {
    path: "/api/loan/initialize-capital",
    authenticate: true,
  },
  closeLoan: {
    path: "/api/loan/close-loan/:loanId",
    authenticate: true,
  },
  deleteLoan: {
    path: "/api/loan/delete-loan/:loanId",
    authenticate: true,
  },
  filterLoans: {
    path: "/api/loan",
    authenticate: true,
  },
  recordPayment: {
    path: "/api/repayment/record-payment/:borrowerId/:loanId",
    authenticate: true,
  },
  closePayments: {
    path: "/api/repayment/close-payments",
    authenticate: true,
  },
  todayRepayments: {
    path: "/api/repayment/today-repayments",
    authenticate: true,
  },
  repaymentHistory: {
    path: "/api/repayment/repayment-history",
    authenticate: true,
  },
  todayCollectionStatus: {
    path: "/api/repayment/today-collection-status",
    authenticate: true,
  },
  generateFinancialSummary: {
    path: "/api/generate-financial-summary",
    authenticate: true,
  },
  getMonthlyFinancialSummary: {
    path: "/api/financial-summary",
    authenticate: true,
  },
  getFinancialSummaryForGraph: {
    path: "/api/financial-summary/graph",
    authenticate: true,
  },
  getDynamicFinancialSummary: {
    path: "/api/summary/dynamic",
    authenticate: true,
  },
  getLatestCapital: {
    path: "/api/capital/latest/:userId",
    authenticate: true,
  },
  updateRiskThreshold: {
    path: "/api/risk-assessment/update-risk-threshold",
    authenticate: true,
  },
  getRiskAssessment: {
    path: "/api/risk-assessment/get-risk-assessment/:borrowerId",
    authenticate: true,
  },
  manualRiskAssessmentTrigger: {
    path: "/api/risk-assessment/:borrowerId",
    authenticate: true,
  },
};

export default ApiRoutes;
