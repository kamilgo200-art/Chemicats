const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `{!engineRef.current?.state.feedbackSubmitted ? (
                            <>
                                <textarea 
                                    className="w-full bg-black/50 border border-indigo-500/50 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-400 resize-none h-24 mb-2 placeholder-indigo-900"
                                    placeholder="Napisz co sądzisz o grze, co byś zmienił..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                ></textarea>
                                
                                <button 
                                    onClick={() => {
                                        if (engineRef.current && feedbackText.trim().length > 5) {
                                            engineRef.current.state.feedbackSubmitted = true;
                                            engineRef.current.state.protons += 50;
                                            engineRef.current.saveGame();
                                            setFeedbackText("");
                                            setTriggerRender(r => r + 1);
                                        }
                                    }}
                                    disabled={feedbackText.trim().length <= 5}
                                    className={\`w-full font-bold py-2.5 rounded-xl transition-all shadow-lg text-xs \${feedbackText.trim().length > 5 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}\`}
                                >
                                    Wyślij anonimową opinię i zgarnij +50 p⁺
                                </button>
                            </>
                        ) : (
                            <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 text-center">
                                <span className="text-2xl block mb-1">💖</span>
                                <span className="text-green-300 font-bold text-sm block">Dziękujemy za opinię!</span>
                                <span className="text-green-400/80 text-xs">Nagroda 50 p⁺ została przyznana.</span>
                            </div>
                        )}`;

const newStr = `{(() => {
                            const hasProgression = engineRef.current?.state.unlockedAtoms.length >= 4 || engineRef.current?.state.unlockedCharacters.length >= 2;
                            const t = feedbackText.trim();
                            const uniqueChars = new Set(t.toLowerCase().split('')).size;
                            const isSpam = t.length < 25 || uniqueChars < 8;
                            
                            if (engineRef.current?.state.feedbackSubmitted) {
                                return (
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 text-center">
                                            <span className="text-2xl block mb-1">💖</span>
                                            <span className="text-green-300 font-bold text-sm block">Dziękujemy za opinię!</span>
                                            <span className="text-green-400/80 text-xs">Nagroda 50 p⁺ została przyznana.</span>
                                        </div>
                                        <button 
                                            onClick={() => { window.open('https://play.google.com/store/apps/details?id=com.hackermerge.game', '_blank'); }}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] text-xs mt-2"
                                        >
                                            ⭐ Oceń grę w Google Play!
                                        </button>
                                    </div>
                                );
                            }

                            if (!hasProgression) {
                                return (
                                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 text-center">
                                        <span className="text-3xl block mb-2 opacity-50">🔒</span>
                                        <span className="text-slate-300 font-bold text-sm block mb-1">Wymagany progres</span>
                                        <span className="text-slate-400 text-xs">Aby zapobiec nadużyciom, opcja wysyłania opinii i darmowych p⁺ jest dostępna dopiero po pokonaniu pierwszych bossów (minimum 4 odblokowane pierwiastki) lub odblokowaniu nowych postaci. Graj dalej!</span>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <textarea 
                                        className="w-full bg-black/50 border border-indigo-500/50 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-400 resize-none h-24 mb-2 placeholder-indigo-900"
                                        placeholder="Napisz co sądzisz o grze, co byś zmienił... (min. 25 znaków, wyczerpujące zdania)"
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                    ></textarea>
                                    
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && !isSpam) {
                                                engineRef.current.state.feedbackSubmitted = true;
                                                engineRef.current.state.protons += 50;
                                                engineRef.current.saveGame();
                                                setFeedbackText("");
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        disabled={isSpam}
                                        className={\`w-full font-bold py-2.5 rounded-xl transition-all shadow-lg text-xs \${!isSpam ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}\`}
                                    >
                                        {!isSpam ? "Wyślij anonimową opinię i zgarnij +50 p⁺" : (t.length < 25 ? "Opinia jest za krótka (min. 25 znaków)" : "Napisz coś bardziej sensownego (spam znaków)")}
                                    </button>
                                </>
                            );
                        })()}`;

if(code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/components/GameCanvas.tsx', code);
    console.log("Anti-farming patched in GameCanvas");
} else {
    console.log("NOT FOUND, looking for partial match...");
}
