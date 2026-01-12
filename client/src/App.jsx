import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";
import { getToken, clearToken } from "./lib/auth";
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

  const [loading, setLoading] = useState(() => !!getToken());
  const [isAuthed, setIsAuthed] = useState(() => !!getToken());

  useEffect(() => {
    const token = getToken();

    // אין טוקן => לא מחובר
    if (!token) {
      setIsAuthed(false);
      setLoading(false);
      return;
    }

    // יש טוקן => בודקים אם הוא תקף
    apiGet("/auth/me", token)
      .then(() => {
        setIsAuthed(true);
        setLoading(false);
      })
      .catch(() => {
        clearToken();
        setIsAuthed(false);
        setLoading(false);
        navigate("/login");
      });
  }, [navigate]);

  function onLogout() {
    clearToken();
    setIsAuthed(false);
    navigate("/login");
  }

  if (loading) return null;

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <nav className={styles.appNav}>
          <Link to="/" className={styles.appLink}>Home</Link>
          <Link to="/chat" className={styles.appLink}>Chat</Link>
          <Link to="/admin" className={styles.appLink}>Admin</Link>

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
