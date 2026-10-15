import './chemicats-v30-9.js';
import './index.css';
import { initChemAudioPlayer } from './chem-audio-player';

// Mount Chemicats Music (Spotify / YT Music Mobile Mode + Background Audio)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => initChemAudioPlayer());
} else {
  initChemAudioPlayer();
}

// Register Service Worker for PWA / Android installation support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration errors in preview iframe
    });
  });
}
