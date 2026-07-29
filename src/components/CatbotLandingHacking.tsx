import React, { useState, useEffect, useRef } from 'react';
import { PERIODIC_TABLE } from './PeriodicTable';

export function CatbotLandingHacking({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) {
  const [phase, setPhase] = useState<'landing' | 'hacking' | 'success'>('landing');
  const [landingStep, setLandingStep] = useState(0);

  // Hacking state
  const [hackLevel, setHackLevel] = useState(1);
  // Level 1
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);
  // Level 2
  const [atomicNumberInput, setAtomicNumberInput] = useState<number>(1);
  // Level 3
  const [frequency, setFrequency] = useState<number>(1.0);

  // Animation sequences
  useEffect(() => {
    if (phase === 'landing') {
      const timers = [
        setTimeout(() => setLandingStep(1), 1500),
        setTimeout(() => setLandingStep(2), 3500),
        setTimeout(() => setLandingStep(3), 5500),
        setTimeout(() => setPhase('hacking'), 8500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  const handleLevel1Submit = () => {
    if (selectedAtom === 'Si') {
      setHackLevel(2);
    }
  };

  const handleLevel2Submit = () => {
    if (atomicNumberInput === 14) {
      setHackLevel(3);
    }
  };

  const handleLevel3Submit = () => {
    if (Math.abs(frequency - 3.8) <= 0.05) {
      setHackLevel(4);
    }
  };

  const handleLevel4Submit = () => {
    setPhase('success');
    setTimeout(() => {
        onComplete();
    }, 2000);
  };

  if (phase === 'landing') {
    return (
      <div className="absolute inset-0 bg-black text-[#ff003c] font-mono flex flex-col items-center justify-center z-[9999] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#440000_0%,_#000000_100%)] opacity-40"></div>
        
        {/* Planet Rax View */}
        <div className={`relative w-[300px] h-[300px] rounded-full bg-[#220000] shadow-[0_0_50px_#ff003c] overflow-hidden transition-all duration-1000 ${landingStep >= 2 ? 'scale-150' : ''}`}>
           {/* Craters */}
           <div className="absolute top-[20%] left-[30%] w-12 h-12 rounded-full border border-black/50 bg-[#150000]"></div>
           <div className="absolute top-[50%] left-[60%] w-20 h-20 rounded-full border border-black/50 bg-[#150000]"></div>
           <div className="absolute top-[70%] left-[10%] w-8 h-8 rounded-full border border-black/50 bg-[#150000]"></div>
           
           {/* Ship */}
           <div className={`absolute left-1/2 -ml-2 transition-all duration-1000 ${landingStep === 0 ? '-top-10' : landingStep === 1 ? 'top-[40%]' : landingStep >= 2 ? 'top-[80%]' : ''}`}>
               <div className="w-4 h-6 border bg-gray-600 relative">
                  {landingStep === 1 && (
                     <>
                       <div className="absolute -bottom-4 left-0 w-1 h-4 bg-orange-500 animate-pulse"></div>
                       <div className="absolute -bottom-4 right-0 w-1 h-4 bg-orange-500 animate-pulse"></div>
                     </>
                  )}
                  {landingStep >= 2 && (
                     <>
                       <div className="absolute -bottom-6 -left-2 w-8 h-8 bg-red-600/50 blur-sm animate-pulse rounded-full"></div>
                     </>
                  )}
               </div>
           </div>
        </div>
        
        <div className="mt-12 text-center relative z-10 w-full max-w-lg px-8">
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em]">Systemy Lądowania</h2>
            <div className="bg-[#110000] border border-[#ff003c] p-4 text-left h-32 overflow-y-auto w-full text-xs opacity-90 shadow-[0_0_15px_rgba(255,0,60,0.3)]">
                <div>{"> "} Inicjalizacja podejścia do Planety RAX...</div>
                {landingStep >= 1 && <div className="text-orange-400">{"> "} Wejście w atmosferę. Temperatura tarczy rośnie...</div>}
                {landingStep >= 2 && <div>{"> "} Hamowanie aerodynamiczne. Korekta wektora...</div>}
                {landingStep >= 3 && <div className="text-white font-bold">{"> "} Przyziemienie udane. Oczekiwanie na manualną autoryzację rdzenia.</div>}
            </div>
        </div>
        <button onClick={onExit} className="absolute top-4 right-4 text-white/50 hover:text-[#ff003c] uppercase text-xs transition-colors">Przerwij</button>
      </div>
    );
  }

  if (phase === 'hacking') {
    return (
        <div className="absolute inset-0 bg-[#0a0000] text-[#ff003c] font-mono z-[9999] flex flex-col pt-12 items-center p-4">
           {/* Cyberpunk Red CRT Scanline effect */}
           <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,0,0,0)_50%,rgba(30,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.08),rgba(200,0,0,0.03),rgba(255,0,0,0.08))] bg-[length:100%_4px,_3px_100%] z-50"></div>
           
           <h1 className="text-3xl lg:text-4xl font-black mb-8 animate-pulse text-[#ff2a2a] drop-shadow-[0_0_15px_#ff003c] uppercase tracking-widest text-center mt-4">
             Terminal O.S KOTBOT
           </h1>

           <div className="w-full max-w-2xl bg-black/80 border-2 border-[#ff003c]/70 p-6 rounded relative backdrop-blur-md shadow-[0_0_40px_rgba(255,0,60,0.15)]">
             <div className="absolute -top-3 left-4 bg-[#0a0000] px-2 text-[#ff003c] font-bold text-xs uppercase border-l-2 border-r-2 border-[#ff003c]/50">Autoryzacja Krytyczna - Poziom {hackLevel}/4</div>
             
             {hackLevel === 1 && (
                 <div className="animate-fade-in text-center mt-4">
                    <p className="mb-6 opacity-90 text-sm">Zidentyfikuj podstawowy budulec półprzewodnikowy rdzenia Kombinatu Krzemowo-Cybernetycznego (KOTBOT).</p>
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                       {['C', 'Si', 'Fe', 'Cu', 'Ge'].map(atom => (
                           <button 
                             key={atom}
                             onClick={() => setSelectedAtom(atom)}
                             className={`w-16 h-16 border-2 transition-all font-bold text-xl flex items-center justify-center
                                ${selectedAtom === atom ? 'bg-[#ff003c] text-black border-[#ff003c] shadow-[0_0_20px_#ff003c]' : 'border-[#ff003c]/30 text-[#ff003c]/60 hover:border-[#ff003c] hover:text-[#ff003c] hover:bg-[#ff003c]/10'}`}
                           >
                              {atom}
                           </button>
                       ))}
                    </div>
                    <button 
                        onClick={handleLevel1Submit}
                        disabled={!selectedAtom}
                        className={`px-8 py-3 uppercase tracking-widest font-bold ${selectedAtom ? 'bg-[#ff003c] text-black hover:bg-white hover:text-black shadow-[0_0_15px_#ff003c] transition-colors' : 'bg-gray-900 border border-gray-800 text-gray-700 cursor-not-allowed'}`}
                    >
                        Zatwierdź Budulec rdzenia
                    </button>
                 </div>
             )}

             {hackLevel === 2 && (
                 <div className="animate-fade-in text-center mt-4">
                    <p className="mb-6 opacity-90 text-sm">Wprowadź prawidłową liczbę atomową (Z) dla Krzemu (Si) by dostroić rezonans układów.</p>
                    
                    <div className="flex flex-col items-center gap-4 mb-8">
                       <span className="text-5xl text-[#ff2a2a] font-black drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]">{atomicNumberInput}</span>
                       <input 
                         type="range" 
                         min="1" 
                         max="20" 
                         value={atomicNumberInput}
                         onChange={(e) => setAtomicNumberInput(parseInt(e.target.value))}
                         className="w-full max-w-sm accent-[#ff003c]"
                       />
                       <span className="text-xs text-[#ff003c]/50 uppercase tracking-widest">Wskazówka: Zależy od ułożenia w Układzie Okresowym.</span>
                    </div>

                    <button 
                        onClick={handleLevel2Submit}
                        className={`px-8 py-3 uppercase tracking-widest font-bold bg-[#ff003c] text-black hover:bg-white hover:text-black shadow-[0_0_15px_#ff003c] transition-colors`}
                    >
                        Kalibruj Rezonans
                    </button>
                 </div>
             )}

             {hackLevel === 3 && (
                 <div className="animate-fade-in text-center mt-4">
                    <p className="mb-6 opacity-90 text-sm">Przeskanuj pasma od <span className="text-white font-bold">1 GHz do 10 GHz</span>. Znajdź częstotliwość podprzestrzenną wojskowej cytadeli OLA, by przebić się przez pole asteroid.</p>
                    
                    <div className="flex flex-col items-center gap-4 mb-4">
                       <span className="text-3xl text-[#ff003c] font-black drop-shadow-[0_0_10px_rgba(255,0,60,0.8)]">{frequency.toFixed(2)} GHz</span>
                       
                       <input 
                         type="range" 
                         min="1.0" 
                         max="10.0" 
                         step="0.01"
                         value={frequency}
                         onChange={(e) => setFrequency(parseFloat(e.target.value))}
                         className="w-full max-w-full accent-[#ff003c] h-2 bg-gray-900 appearance-none rounded-full outline-none"
                       />
                    </div>
                    
                    <div className="h-24 w-full mb-8 border border-[#ff003c]/30 relative overflow-hidden bg-[#0A0000] flex items-center justify-center rounded-lg shadow-[inset_0_0_20px_rgba(255,0,0,0.2)]">
                        {/* Dynamic radar wave, tightening based on accuracy */}
                        <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path 
                                d={`M 0 10 Q 5 ${10 + (Math.sin(frequency) * 15)} 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10`} 
                                fill="none" 
                                stroke={Math.abs(frequency - 3.80) <= 0.05 ? '#ffffff' : '#ff003c'} 
                                strokeWidth={Math.abs(frequency - 3.80) <= 0.05 ? "3" : "1"}
                                className="transition-all duration-75"
                                style={{ transform: `scaleX(${frequency/3})` }}
                            />
                        </svg>
                        <div className="absolute left-0 bottom-0 text-[10px] text-[#ff003c]/50 p-1">1.0 GHz</div>
                        <div className="absolute right-0 bottom-0 text-[10px] text-[#ff003c]/50 p-1">10.0 GHz</div>

                        {Math.abs(frequency - 3.80) <= 0.05 && (
                            <div className="absolute inset-0 bg-[#ffffff]/20 animate-pulse pointer-events-none mix-blend-overlay"></div>
                        )}
                        {/* Background grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,60,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,60,0.1)_1px,transparent_1px)] bg-[length:10px_10px] pointer-events-none"></div>
                    </div>

                    <button 
                        onClick={handleLevel3Submit}
                        className={`px-8 py-3 uppercase tracking-widest font-bold ${Math.abs(frequency - 3.80) <= 0.05 ? 'bg-white text-black shadow-[0_0_25px_#ffffff]' : 'bg-[#110000] border border-[#ff003c]/50 text-[#ff003c]'} transition-all`}
                    >
                        {Math.abs(frequency - 3.80) <= 0.05 ? "ZATWIERDŹ SYGNAŁ W OLA" : "Ustal Częstotliwość"}
                    </button>
                 </div>
             )}

             {hackLevel === 4 && (
                 <div className="animate-fade-in text-center mt-4">
                    <p className="mb-6 text-white font-black text-2xl uppercase tracking-widest drop-shadow-[0_0_15px_#ffffff]">
                       POŁĄCZENIE USTANOWIONE
                    </p>
                    <p className="mb-10 text-[#ff003c] font-bold text-sm max-w-md mx-auto leading-relaxed border-t border-b border-[#ff003c]/30 py-4 bg-[#ff003c]/5">
                        Inicjalizacja proceduralnych sieci. Wgrywanie modułów surwiwalowych Kotbota. Wybudzanie rdzenia głównego zakończone powodzeniem.
                    </p>
                    
                    <button 
                        onClick={handleLevel4Submit}
                        className="bg-[#ff003c] text-black px-10 py-4 uppercase tracking-[0.3em] font-black hover:bg-white hover:text-black transition-all animate-pulse drop-shadow-[0_0_20px_rgba(255,0,60,1)]"
                    >
                        START SYSTEMU (SURVIVAL)
                    </button>
                 </div>
             )}
           </div>

           <button onClick={onExit} className="mt-8 text-[#ff003c]/50 hover:text-[#ff003c] uppercase text-xs tracking-[0.2em] transition-colors">Zakończ Terminal</button>
        </div>
    );
  }

  return (
      <div className="absolute inset-0 bg-black z-[9999] flex items-center justify-center text-[#ff003c] font-mono text-4xl font-black tracking-widest">
         <span className="animate-pulse drop-shadow-[0_0_25px_#ff003c]">KOTBOT O.S AKTYWNY...</span>
      </div>
  );
}

