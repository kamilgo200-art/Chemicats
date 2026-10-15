import './chemicats-v30-9.js';
import './index.css';

// Register Service Worker for PWA / Android installation support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered successfully!', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
