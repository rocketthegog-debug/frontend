import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { APP_CONFIG } from './config'

// Set favicon and title dynamically from config
const setFavicon = () => {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = APP_CONFIG.faviconPath
  link.type = 'image/svg+xml'
}

const setAppleTouchIcon = () => {
  let link = document.querySelector("link[rel~='apple-touch-icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'apple-touch-icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = APP_CONFIG.appleTouchIconPath
}

// Set title and icons on load
document.title = APP_CONFIG.appName
setFavicon()
setAppleTouchIcon()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main>
      <App />
    </main>
  </StrictMode>,
)
