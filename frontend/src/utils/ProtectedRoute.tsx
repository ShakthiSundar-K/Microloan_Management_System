import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
  exp: number; // in seconds
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to='/sign-in' />;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // console.log("Decoded token:", decoded);
    const currentTime = Date.now() / 1000; // convert ms to seconds

    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("role");
      return <Navigate to='/sign-in' />;
    }

    // Save id and role in localStorage if not already
    localStorage.setItem("id", decoded.id);
    localStorage.setItem("role", decoded.role);

    return children;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.clear();
    return <Navigate to='/sign-in' />;
  }
}

export default ProtectedRoute;
