import { Link, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";
import { getToken, clearToken } from "./lib/auth";
import RequireAuth from "./components/RequireAuth";
import 'react-toastify/dist/ReactToastify.css';
import styles from './styles/App.module.css';

import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import ProfileSetupPage from "./pages/ProfileSetupPage";

function App() {
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiGet("/auth/me", token)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        clearToken();
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <nav className={styles.appNav}>
            <Link to="/" className={styles.appLink}>Home</Link>
            <Link to="/chat" className={styles.appLink}>Chat</Link>
            <Link to="/admin" className={styles.appLink}>Admin</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>}/>
            <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>}/>
            <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>}/>
          </Routes>
        </main>
        <ToastContainer position="top-center" />
      </div>
  );
}

export default App;
