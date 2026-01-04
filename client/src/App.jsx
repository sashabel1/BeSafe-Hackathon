import { Link, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './styles/App.module.css';
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
      <div className={styles.app}>
        <header className={styles.appHeader}>
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
      </div>
  );
}

export default App;
