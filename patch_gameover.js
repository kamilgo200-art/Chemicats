import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const gameOverUI = `
      {gameStateUi === 'gameover' && engineRef.current && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-black/90 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="text-[120px] mb-2 animate-pulse drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">☠️</div>
          <h1 className="text-5xl md:text-7xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] mb-2 text-center uppercase">
            KONIEC GRY
          </h1>
          <p className="text-red-200 text-lg md:text-xl font-bold mb-8 opacity-80 tracking-widest uppercase">Eksperyment Zakończony Niepowodzeniem</p>
          
          <div className="flex flex-col gap-4 max-w-sm w-full px-4">
            {(() => {
                const cost = engineRef.current.state.level;
                const canAfford = engineRef.current.state.protons >= cost;
                const canRevive = (engineRef.current.state.revivesUsed || 0) < 2;
                
                if (!canRevive) {
                    return <div className="text-center text-slate-400 font-bold mb-4 bg-slate-900/50 py-3 rounded-xl border border-slate-700/50">Wykorzystano limit wskrzeszeń (2/2)</div>;
                }
                
                return (
                    <>
                        <button 
                            disabled={!canAfford}
                            onClick={() => {
                                if (engineRef.current && canAfford && canRevive) {
                                    engineRef.current.state.protons -= cost;
                                    engineRef.current.revivePlayer();
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className={\`w-full py-4 rounded-xl font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 \${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}\`}
                        >
                            <span>Wskrześ za</span> 
                            <span className="text-indigo-300 mx-1">{cost}</span> 
                            <span>p⁺</span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                // Simulate Ad
                                if (engineRef.current && canRevive) {
                                    alert("Symulacja Reklamy... (Tu odpaliłoby się wideo). Otrzymujesz Drugie Życie!");
                                    engineRef.current.revivePlayer();
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span>📺 Obejrzyj Reklamę</span>
                        </button>
                    </>
                );
            })()}
            
            <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.forceWipeReset();
                        setTriggerRender(r => r + 1);
                    }
                }}
                className="w-full mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all hover:scale-105 uppercase tracking-widest text-sm"
            >
                Zakończ Podejście (Wróć do Menu)
            </button>
          </div>
        </div>
      )}
`;

content = content.replace(
/      \{gameStateUi === 'victory_screen' && \(/,
gameOverUI + "\n      {gameStateUi === 'victory_screen' && ("
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched');
