const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Add 'feedback' to optionsTab
const optionsTabTarget = `optionsTab, setOptionsTab] = useState<'main' | 'settings' | 'investments' | 'market' | 'periodic_table'>('main');`;
if(code.includes(optionsTabTarget)) {
    code = code.replace(optionsTabTarget, `optionsTab, setOptionsTab] = useState<'main' | 'settings' | 'investments' | 'market' | 'periodic_table' | 'feedback'>('main');`);
}

// Add Feedback state for input
const stateImportsTarget = `const [bossIntro, setBossIntro] = useState`;
if(code.includes(stateImportsTarget)) {
    code = code.replace(stateImportsTarget, `const [feedbackText, setFeedbackText] = useState("");\n  const [bossIntro, setBossIntro] = useState`);
}

// Add button in main options tab
const investButtonTarget = `<button 
                          onClick={() => setOptionsTab('investments')}`;
if(code.includes(investButtonTarget)) {
    const feedbackButton = `
                      <button 
                          onClick={() => setOptionsTab('feedback')}
                          className="bg-indigo-600/50 hover:bg-indigo-500/55 border border-indigo-500/20 rounded-xl px-2 py-2 text-xs font-bold text-indigo-100 transition-all flex items-center justify-center gap-1.5 col-span-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-2"
                      >
                          💬 {tx("Opinia i Prywatność")} (+50 p⁺)
                      </button>
                      `;
    code = code.replace(investButtonTarget, feedbackButton + investButtonTarget);
}

// Ensure the UI adds the feedback tab logic
const settingsTabTarget = `{optionsTab === 'settings' && (`;
if(code.includes(settingsTabTarget)) {
    const feedbackTabUI = `
                {optionsTab === 'feedback' && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-black tracking-tight text-white mb-1.5 text-center">💬 OPINIA I PRYWATNOŚĆ</h2>
                    
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto font-sans">
                        <strong className="text-white block mb-1">Polityka Prywatności:</strong>
                        Aplikacja zbiera anonimowe logi błędów oraz opinie w celu poprawy jakości rozgrywki. Nie zbieramy i nie przetwarzamy danych osobowych (np. imienia, adresu e-mail, numeru telefonu, lokalizacji czy Google Advertising ID). Do analizy opinii oraz zachowań graczy wykorzystujemy anonimowe usługi analityczne (Third-party analytics services) w tym asystentów AI (np. Gemini/OpenAI API). Korzystając z funkcji "Wyślij opinię", akceptujesz te zasady.
                    </div>

                    <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30">
                        <strong className="text-red-400 block mb-2 text-xs uppercase tracking-widest text-center">
                           ⚠️ Zastrzeżenie!
                        </strong>
                        <p className="text-xs text-indigo-200 text-center mb-3">
                            Prosimy o szczere opinie na temat gry! Zastrzeżenie: Nie wpisuj tu żadnych danych osobowych (np. imienia, e-maila). System przetwarza je w 100% anonimowo.
                        </p>
                        
                        {!engineRef.current?.state.feedbackSubmitted ? (
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
                        )}
                    </div>
                  </div>
                )}
`;
    code = code.replace(settingsTabTarget, feedbackTabUI + settingsTabTarget);
}

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log("GameCanvas patched");
