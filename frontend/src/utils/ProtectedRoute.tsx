import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to='/' />;
}

export default ProtectedRoute;
