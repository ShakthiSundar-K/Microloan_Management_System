// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
// import SignIn from "./pages/SignIn";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MobileContainer from "./components/MobileContainer";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <MobileContainer>
      <BrowserRouter>
        <Routes>
          {/* Auth routes without navbar */}
          <Route path='/sign-up' element={<SignUp />} />
          {/* <Route path='/signin' element={<SignIn />} /> */}

          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path='profile' element={<div>Profile Page</div>} />
            <Route path='settings' element={<div>Settings Page</div>} />
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </MobileContainer>
  );
};

export default App;
