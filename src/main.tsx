import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n/config'
import './index.css'

async function cleanupLegacyPwaServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations.map(async (registration) => {
      const scriptUrls = [
        registration.active?.scriptURL,
        registration.waiting?.scriptURL,
        registration.installing?.scriptURL,
      ].filter(Boolean) as string[]

      const isMswRegistration = scriptUrls.some((url) => url.includes('mockServiceWorker.js'))
      if (isMswRegistration) return

      const isPwaRegistration = scriptUrls.some((url) => url.includes('/sw.js') || url.includes('workbox-'))
      if (isPwaRegistration) {
        await registration.unregister()
      }
    }),
  )
}

async function enableMocking(): Promise<void> {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

async function bootstrap(): Promise<void> {
  try {
    await cleanupLegacyPwaServiceWorkers()
    await enableMocking()
  } catch (error) {
    // Keep the UI booting even if mock worker registration is blocked in a browser state.
    console.warn('Mock worker initialization failed. Continuing without mock interception.', error)
  }

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void bootstrap()
