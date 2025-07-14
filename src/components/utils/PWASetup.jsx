import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PWASetup() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // --- PWA Setup ---

    // 1. Define the manifest content
    const manifest = {
      short_name: "Yardash",
      name: "Yardash: Quality Yard Work, On Demand",
      description: "Yardash connects you with skilled local workers for all your outdoor needs.",
      icons: [
        { src: 'https://cdn.glitch.global/c528695c-9be8-4107-b6a9-82c0f16238de/icon-192x192.png?v=1720979893978', type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
        { src: 'https://cdn.glitch.global/c528695c-9be8-4107-b6a9-82c0f16238de/icon-512x512.png?v=1720979897109', type: 'image/png', sizes: '512x512', purpose: 'any maskable' }
      ],
      start_url: ".",
      display: "standalone",
      scope: "/",
      theme_color: "#10b981",
      background_color: "#ffffff",
      orientation: "portrait"
    };

    // 2. Create and inject the manifest link
    const oldManifest = document.getElementById('yardash-manifest');
    if (oldManifest) oldManifest.remove();
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestUrl;
    manifestLink.id = 'yardash-manifest';
    document.head.appendChild(manifestLink);

    // 3. Service Worker: dynamically create and register
    const serviceWorkerCode = `
      const CACHE_NAME = 'yardash-cache-v2';
      const URLS_TO_CACHE = ['/'];

      self.addEventListener('install', (event) => {
        console.log('Service Worker: Installing...');
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(URLS_TO_CACHE);
          }).catch(err => console.error('SW cache open error', err))
        );
      });

      self.addEventListener('activate', (event) => {
        console.log('Service Worker: Activating...');
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                  console.log('Service Worker: Deleting old cache', cacheName);
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
        return self.clients.claim();
      });

      self.addEventListener('fetch', (event) => {
        if (event.request.mode === 'navigate') {
          event.respondWith(
            fetch(event.request).catch(() => caches.match('/'))
          );
          return;
        }

        if (!event.request.url.startsWith(self.location.origin)) {
          event.respondWith(fetch(event.request));
          return;
        }

        event.respondWith(
          caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
          })
        );
      });
    `;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Old service worker unregistered');
        }
      }).then(() => {
        const swBlob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);
        navigator.serviceWorker.register(swUrl, { scope: '/' })
          .then(registration => console.log('Dynamic Service Worker registered successfully:', registration))
          .catch(error => console.error('Dynamic Service Worker registration failed:', error));
      });
    }

    // 4. Handle the install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => setInstallPrompt(null));
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <Button onClick={handleInstallClick} className="bg-green-600 hover:bg-green-700 shadow-lg" size="lg">
        <Download className="mr-2 h-5 w-5" />
        Install App
      </Button>
    </div>
  );
}
