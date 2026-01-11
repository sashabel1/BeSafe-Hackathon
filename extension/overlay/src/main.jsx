import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Overlay from './Overlay.jsx'

chrome.storage.local.set({
  API_URL: import.meta.env.VITE_API_URL,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Overlay />
  </StrictMode>,
)
