const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `{gameStateUi === 'proton_tutorial' && (`;

const tutorialOverlay = `
      {engineRef.current && !engineRef.current.state.hasSeenTutorial && gameStateUi === 'playing' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/90 text-slate-100 z-[100] backdrop-blur-xl animate-in fade-in zoom-in duration-300 p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 md:p-10 max-w-2xl w-full shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <h2 className="text-3xl md:text-4xl font-black text-indigo-400 mb-6 tracking-tight text-center">Witaj w Hacker Merge! 🎮</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-black/50 p-4 rounded-xl border border-indigo-500/30 flex items-center gap-4">
                    <div className="text-3xl">⌨️</div>
                    <div>
                        <strong className="text-white block">Poruszanie się</strong>
                        <span className="text-sm text-slate-400">Użyj klawiszy W, A, S, D aby sterować postacią.</span>
                    </div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-indigo-500/30 flex items-center gap-4">
                    <div className="text-3xl">🖱️</div>
                    <div>
                        <strong className="text-white block">Celowanie i Strzał</strong>
                        <span className="text-sm text-slate-400">Celuj myszką, strzelaj Lewym Przyciskiem (LPM).</span>
                    </div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-indigo-500/30 flex items-center gap-4">
                    <div className="text-3xl">❄️</div>
                    <div>
                        <strong className="text-white block">Przegrzewanie (Heat)</strong>
                        <span className="text-sm text-slate-400">Nie strzelaj ciągle! Uważaj na pasek przegrzania broni pod postacią.</span>
                    </div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-indigo-500/30 flex items-center gap-4">
                    <div className="text-3xl">⚛️</div>
                    <div>
                        <strong className="text-white block">Super Broń (Q)</strong>
                        <span className="text-sm text-slate-400">Odblokuj Księgę Reakcji, twórz związki i strzelaj nimi klawiszem Q.</span>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-900/40 p-4 rounded-xl border border-indigo-500/50 mb-8 text-center text-sm text-indigo-200">
                W trakcie gry pauzuj (klawisz ESC) aby otworzyć Opcje, Księgę Związków lub Sklep!
            </div>

            <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.state.hasSeenTutorial = true;
                        engineRef.current.saveGame();
                        setTriggerRender(r => r + 1);
                    }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] text-lg"
            >
                ZROZUMIAŁEM, GRAMY! 🔥
            </button>
          </div>
        </div>
      )}

      {gameStateUi === 'proton_tutorial' && (`;

if(code.includes(targetStr)) {
    code = code.replace(targetStr, tutorialOverlay);
    fs.writeFileSync('src/components/GameCanvas.tsx', code);
    console.log("GameCanvas patched with tutorial");
} else {
    console.log("Target string not found");
}
