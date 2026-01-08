import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";

export default function ProfileCompleteGuard() {
  const { authUser } = useAuthStore();

  if (!authUser) return <Navigate to="/" replace />;

  const isComplete =
    authUser.isProfileComplete ?? authUser.profileComplete ?? false;

 
  if (!isComplete) return <Navigate to="/profile-setup" replace />;

  return <Outlet />;
}
