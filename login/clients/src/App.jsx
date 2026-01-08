
import { useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import ProfileCompleteGuard from "./pages/ProfileCompleteGuard";
import ChatPage from "./pages/ChatPage";
import { useAuthStore } from "./pages/useAuthStore";

function BackgroundLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-pink-200 opacity-80" />
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-pink-300/40 rounded-full blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-blue-300/40 rounded-full blur-[120px]" />

      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Routes>
      <Route element={<BackgroundLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

       
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
<Route path="/chat/:id" element={<ChatPage />} />
        
        <Route element={<ProfileCompleteGuard />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
