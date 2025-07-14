import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PWASetup() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    // 1. Define the manifest content
    const manifest = {
      short_name: "Yardash",
      name: "Yardash: Quality Yard Work, On Demand",
      description: "Yardash connects you with skilled local workers for all your outdoor needs.",
      icons: [
        { src: 'https://cdn.glitch.global/c528695c-9be8-4107-b6a9-82c0f16238de/icon-192x192.png?v=1720979893978', type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
        { src: 'https://cdn.glitch.global/c528695c-9be8-4107-b6a9-82c0f16238de/icon-512x512.png?v=1720979897109', type: 'image/png', sizes: '512x512', purpose: 'any maskable' }
      ],
      start_url: "/",
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

    // 3. Create service worker using data URL instead of blob URL
    const serviceWorkerCode = `
      const CACHE_NAME = 'yardash-v1';
      
      self.addEventListener('install', (event) => {
        console.log('SW: Installing');
        self.skipWaiting();
      });

      self.addEventListener('activate', (event) => {
        console.log('SW: Activating');
        event.waitUntil(self.clients.claim());
      });

      self.addEventListener('fetch', (event) => {
        // Only handle same-origin requests to avoid CORS issues
        if (event.request.url.startsWith(self.location.origin)) {
          event.respondWith(
            fetch(event.request).catch(() => {
              // If fetch fails, try to return a cached response
              return caches.match(event.request);
            })
          );
        }
      });
    `;

    // Register service worker using different method
    if ('serviceWorker' in navigator) {
      // First unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      }).then(() => {
        // Create service worker using data URL
        const dataUrl = `data:application/javascript;base64,${btoa(serviceWorkerCode)}`;
        
        navigator.serviceWorker.register(dataUrl, { scope: '/' })
          .then(registration => {
            console.log('Service Worker registered successfully:', registration);
            setServiceWorkerReady(true);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
            // If data URL fails, try inline approach
            tryInlineServiceWorker();
          });
      });
    }

    // Fallback method if data URL doesn't work
    const tryInlineServiceWorker = () => {
      // Create a minimal service worker that just enables PWA
      const minimalSW = `
        self.addEventListener('install', () => self.skipWaiting());
        self.addEventListener('activate', () => self.clients.claim());
        self.addEventListener('fetch', (e) => {
          if (e.request.url.startsWith(self.location.origin)) {
            e.respondWith(fetch(e.request));
          }
        });
      `;
      
      try {
        const blob = new Blob([minimalSW], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(url, { scope: '/' })
          .then(() => {
            console.log('Fallback Service Worker registered');
            setServiceWorkerReady(true);
            URL.revokeObjectURL(url);
          })
          .catch(err => console.log('Fallback SW failed:', err));
      } catch (e) {
        console.log('No service worker support');
      }
    };

    // 4. Handle the install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Add event listener for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (manifestUrl) URL.revokeObjectURL(manifestUrl);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      console.log('User choice:', choiceResult.outcome);
      setInstallPrompt(null);
    });
  };

  // Show install button if we have the prompt
  if (!installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleInstallClick} 
        className="bg-green-600 hover:bg-green-700 shadow-lg animate-pulse" 
        size="lg"
      >
        <Download className="mr-2 h-5 w-5" />
        Install App
      </Button>
    </div>
  );
}
