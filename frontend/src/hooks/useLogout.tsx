import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function useLogout() {
  const navigate = useNavigate();
  return () => {
    localStorage.removeItem("token");
    toast.success("Logout Successfull");
    navigate("/");
  };
}

export default useLogout;
