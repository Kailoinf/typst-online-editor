import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import './pdfjs-textlayer.css'
import './pdfjs-annotationlayer.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
