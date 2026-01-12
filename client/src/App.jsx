import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";
import { getToken, clearToken, getIsAdmin } from "./lib/auth";
import RequireAuth from "./components/RequireAuth";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles/App.module.css";

import WelcomePage from "./pages/WelcomePage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const navigate = useNavigate();

  const token = getToken();
  const isAdmin = getIsAdmin();
 

  const [checkingToken, setCheckingToken] = useState(() => !!token);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        await apiGet("/auth/me");
      } catch {
        clearToken();
        if (!cancelled) navigate("/login");
      } finally {
        if (!cancelled) setCheckingToken(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  function onLogout() {
    clearToken();
    navigate("/login");
  }

  if (checkingToken) return null;

  const isAuthed = !!getToken();

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <nav className={styles.appNav}>
          <Link to="/" className={styles.appLink}>Home</Link>
          <Link to="/chat" className={styles.appLink}>Chat</Link>
          
          {isAdmin && <Link to="/admin" className={styles.appLink}>Admin</Link>}

          {isAuthed && (
            <button onClick={onLogout} className={styles.logoutButton}>
              Logout
            </button>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<RequireAuth><WelcomePage /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        </Routes>
      </main>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;
