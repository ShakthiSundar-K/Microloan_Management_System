import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function useLogout() {
  const navigate = useNavigate();
  return () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    toast.success("Logout Successfull");
    navigate("/sign-in");
  };
}

export default useLogout;
