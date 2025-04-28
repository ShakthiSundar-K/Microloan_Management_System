// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MobileContainer from "./components/MobileContainer";
import ProtectedRoute from "./utils/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import CollectPayment from "./pages/CollectPayment";
import RecordPayment from "./pages/RecordPayment";
import PaymentHistory from "./pages/PaymentHistory";
import Loans from "./pages/Loans";
import Borrowers from "./pages/Borrowers";
import NewLoan from "./pages/NewLoan";
import CashInHand from "./pages/CashInHand";
import ExistingLoans from "./pages/ExistingLoans";
import FinancialSummary from "./pages/FinancialSummary";
import ClosePayments from "./pages/ClosePayments";
import LoanDetails from "./pages/LoanDetails";
import BorrowerDetails from "./pages/BorrowerDetails";
import CreateBorrower from "./pages/CreateBorrower";
import CreateLoan from "./pages/CreateLoan";
import CreateExistingLoan from "./pages/CreateExistingLoan";
import Documentation from "./pages/Documentation";

const App = () => {
  return (
    <MobileContainer>
      <BrowserRouter>
        <Routes>
          {/* Auth routes without navbar */}
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path='/collect-payment' element={<CollectPayment />} />
            <Route
              path='/record-payment/:borrowerId/:loanId'
              element={<RecordPayment />}
            />
            <Route path='/repayment-history' element={<PaymentHistory />} />
            <Route path='/loans' element={<Loans />} />
            <Route path='/borrowers' element={<Borrowers />} />
            <Route path='/new-loan' element={<NewLoan />} />
            <Route path='/create-borrower' element={<CreateBorrower />} />
            <Route path='/create-loan/:borrowerId' element={<CreateLoan />} />
            <Route path='/capital' element={<CashInHand />} />
            <Route path='/existing-loan' element={<ExistingLoans />} />
            <Route
              path='create-existing-loan/:borrowerId'
              element={<CreateExistingLoan />}
            />
            <Route path='/financial-summary' element={<FinancialSummary />} />
            <Route path='close-repayments' element={<ClosePayments />} />
            <Route path='/loan-details/:loanId' element={<LoanDetails />} />
            <Route
              path='/borrower-details/:borrowerId'
              element={<BorrowerDetails />}
            />
            <Route path='/docs' element={<Documentation />} />
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </MobileContainer>
  );
};

export default App;
