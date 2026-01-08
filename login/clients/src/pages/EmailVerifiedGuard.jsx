import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";

export default function EmailVerifiedGuard() {
  const { authUser } = useAuthStore();

 
  if (!authUser) return <Navigate to="/" replace />;

 
  const isVerified =
    authUser.isEmailVerified ?? authUser.emailVerified ?? authUser.verified;

 
  if (!isVerified) return <Navigate to="/" replace />;

  return <Outlet />;
}
