/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const requestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (err) {
      console.warn("Could not lock orientation or enter fullscreen:", err);
    }
  };

  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden bg-black text-white font-sans">
      <GameCanvas />
      
      {/* Portait Mode Overlay Warning */}
      <div className="fixed inset-0 z-[1000] bg-black flex flex-col justify-center items-center text-center p-8 landscape:hidden">
         <div className="text-6xl mb-6 animate-bounce">📱➡🔄</div>
         <h1 className="text-2xl font-bold text-white mb-2">Obróć telefon</h1>
         <p className="text-gray-400 mb-6">Gra wymaga trybu poziomego (landscape) do poprawnego działania.</p>
         <button 
            onClick={requestLandscape}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border border-indigo-400"
         >
            Wymuś tryb poziomy / Pełny ekran
         </button>
      </div>
    </main>
  );
}
