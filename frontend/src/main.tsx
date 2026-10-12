import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initStableViewport } from './lib/stableViewport'

// Sticky sahne boyu için sabit --vh / --bars (svh/dvh yerine)
initStableViewport()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Üretimde HTML önceden render edilir (scripts/prerender.mjs) → hydrate; geliştirmede boş → render.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
