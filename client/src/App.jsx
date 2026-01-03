import { Link, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './styles/App.module.css';
import projectLogo from './assets/project-logo.png'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'



function App() {
  return (
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <img src={projectLogo} alt="Logo" className={styles.appLogo} />
          <nav className={styles.appNav}>
            <Link to="/" className={styles.appLink}>Home</Link>
            <Link to="/chat" className={styles.appLink}>Chat</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
        <ToastContainer position="top-center" />
        <footer className={styles.footer}>
          <p>&copy; 2024 My App</p>
        </footer>
      </div>
  );
}

export default App;
