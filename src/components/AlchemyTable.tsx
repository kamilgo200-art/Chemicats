import React, { useState, useEffect } from 'react';
import { PeriodicTable, PERIODIC_TABLE } from './PeriodicTable';
import { MenuGameplay } from './MenuGameplay';

const BetaDecayTab = ({ engine, setTriggerRender }: { engine: any, setTriggerRender: any }) => {
    const [decayAmount, setDecayAmount] = useState<number>(() => engine.state.betaDecayVaultNeutrons || 1);
    const [isDecaying, setIsDecaying] = useState(() => (engine.state.betaDecayVaultNeutrons || 0) > 0);
    const [timeElapsedReal, setTimeElapsedReal] = useState(0);
    const [bursting, setBursting] = useState(false);
    const [burstYield, setBurstYield] = useState<{p: number, e: number}>({p: 0, e: 0});

    const T_HALF = 612; // 10 minutes 12 seconds in real life

    // On mount + tick
    useEffect(() => {
        let interval: any;
        if (isDecaying) {
            const updateTime = () => {
                if (engine.state.betaDecayLastTimestamp) {
                    const elapsed = (Date.now() - engine.state.betaDecayLastTimestamp) / 1000;
                    setTimeElapsedReal(elapsed);
                }
            };
            updateTime();
            interval = setInterval(updateTime, 100);
        }
        return () => clearInterval(interval);
    }, [isDecaying, engine]);

    const activeVaultAmount = engine.state.betaDecayVaultNeutrons || 0;
    
    // N(t) = N0 * (1/2)^(t / T_HALF)
    const currentN = isDecaying && activeVaultAmount > 0
        ? Math.max(0, Math.round(activeVaultAmount * Math.pow(0.5, timeElapsedReal / T_HALF)))
        : decayAmount;
        
    const convertedAmount = isDecaying ? (activeVaultAmount - currentN) : 0;

    const startDecay = () => {
        if (engine.state.neutrons >= decayAmount && decayAmount > 0) {
            engine.state.neutrons -= decayAmount; 
            engine.state.betaDecayVaultNeutrons = decayAmount;
            engine.state.betaDecayLastTimestamp = Date.now();
            engine.saveGame();
            setIsDecaying(true);
            setTimeElapsedReal(0);
            setTriggerRender((r: number) => r + 1);
        }
    };

    const collectPartial = () => {
        const finalTime = timeElapsedReal;
        const remainingN = Math.round(activeVaultAmount * Math.pow(0.5, finalTime / T_HALF));
        const finalConverted = activeVaultAmount - remainingN;

        if (finalConverted > 0) {
            engine.state.protons += finalConverted;
            engine.state.lobbyElectrons += finalConverted;
            
            engine.state.betaDecayVaultNeutrons = remainingN;
            engine.state.betaDecayLastTimestamp = Date.now();
            
            engine.saveGame();
            
            setBurstYield({p: finalConverted, e: finalConverted});
            setBursting(true);
            setTimeout(() => {
                setBursting(false);
            }, 3000);
            
            setTimeElapsedReal(0);
            
            if (remainingN <= 0) {
                setIsDecaying(false);
                setDecayAmount(1);
            }
            
            setTriggerRender((r: number) => r + 1);
        }
    };

    const finishDecay = () => {
        setIsDecaying(false);
        const finalTime = timeElapsedReal;
        const remainingN = Math.round(activeVaultAmount * Math.pow(0.5, finalTime / T_HALF));
        const finalConverted = activeVaultAmount - remainingN;

        engine.state.neutrons += remainingN; 
        engine.state.protons += finalConverted;
        engine.state.lobbyElectrons += finalConverted;
        
        engine.state.betaDecayVaultNeutrons = 0;
        engine.state.betaDecayLastTimestamp = 0;
        
        engine.saveGame();
        
        if (finalConverted > 0) {
            setBurstYield({p: finalConverted, e: finalConverted});
            setBursting(true);
            setTimeout(() => {
                setBursting(false);
                setDecayAmount(1);
            }, 3000);
        } else {
            setDecayAmount(1);
        }
        
        setTriggerRender((r: number) => r + 1);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-4 relative">
            {bursting && (
                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
                     {/* Shockwave */}
                     <div className="absolute w-10 h-10 border-4 border-fuchsia-500 rounded-full animate-[ping_1.5s_ease-out_forwards]"></div>
                     {/* Ejected particles */}
                     {Array.from({ length: Math.min(30, burstYield.p) }).map((_, i) => (
                         <div key={`p-${i}`} className="absolute w-8 h-8 rounded-full bg-red-600 border-2 border-red-300 flex items-center justify-center font-black text-white text-[10px] drop-shadow-[0_0_15px_red] z-30" style={{
                             animation: `flyOutProton ${1 + Math.random()}s cubic-bezier(0.1, 0.8, 0.2, 1) forwards`,
                             transformOrigin: 'center'
                         }}>p⁺</div>
                     ))}
                     {Array.from({ length: Math.min(30, burstYield.e) }).map((_, i) => (
                         <div key={`e-${i}`} className="absolute w-[108px] h-[108px] rounded-full bg-blue-500/80 border-4 border-blue-300 flex items-center justify-center font-black text-white text-3xl drop-shadow-[0_0_20px_blue] z-20 mix-blend-screen" style={{
                             animation: `flyOutElectron ${0.8 + Math.random()}s cubic-bezier(0.1, 0.8, 0.2, 1) forwards`,
                             transformOrigin: 'center'
                         }}>e⁻</div>
                     ))}
                     {Array.from({ length: Math.min(30, burstYield.e) }).map((_, i) => (
                         <div key={`v-${i}`} className="absolute w-1 h-1 rounded-full bg-fuchsia-300/80 drop-shadow-[0_0_5px_fuchsia] z-10" style={{
                             animation: `flyOutNeutrino ${0.5 + Math.random()}s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                             transformOrigin: 'center'
                         }}></div>
                     ))}
                     {/* Visual cue for neutrino */}
                     <div className="absolute top-[20%] text-fuchsia-300 font-black tracking-widest text-lg drop-shadow-[0_0_20px_fuchsia] animate-[fadeOutUp_2.5s_ease-out_forwards]">
                        + {burstYield.e} ν̄ₑ (antyneutrina uciekły!)
                     </div>
                     <style dangerouslySetInnerHTML={{__html:`
                         @keyframes flyOutProton {
                             0% { transform: scale(1) translate(0,0) rotate(0deg); opacity: 1; }
                             80% { opacity: 1; }
                             100% { transform: scale(0.6) translate(${(Math.random() - 0.5) * 600}px, ${(Math.random() - 0.5) * 600}px) rotate(${Math.random()*360}deg); opacity: 0; }
                         }
                         @keyframes flyOutElectron {
                             0% { transform: scale(1) translate(0,0) rotate(0deg); opacity: 1; }
                             80% { opacity: 1; }
                             100% { transform: scale(0.5) translate(${(Math.random() - 0.5) * 1200}px, ${(Math.random() - 0.5) * 1200}px) rotate(${Math.random()*720}deg); opacity: 0; }
                         }
                         @keyframes flyOutNeutrino {
                             0% { transform: scale(1) translate(0,0); opacity: 1; }
                             100% { transform: scale(0.2) translate(${(Math.random() - 0.5) * 2000}px, ${(Math.random() - 0.5) * 2000}px); opacity: 0; }
                         }
                         @keyframes fadeOutUp {
                             0% { transform: translateY(0); opacity: 1; }
                             100% { transform: translateY(-80px); opacity: 0; }
                         }
                     `}} />
                </div>
            )}

            <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">Rozpad Beta Minus (β⁻)</h3>
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                Czas rzeczywisty (<span className="text-white font-bold">Offline Progress</span>). Neutron swobodny w naszym modelu standardowym ma czas połowicznego rozpadu na zewnątrz jądra <span className="font-mono text-purple-300 block">T½ = ≈10 min 12 s (612s)</span> Działa w tle!
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center w-full justify-center">
                
                {/* Visualizer */}
                <div className="w-48 h-48 rounded-full border-4 border-slate-700 bg-black flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                    {!isDecaying && (
                        <div className="text-amber-500 text-6xl drop-shadow-[0_0_15px_rgba(217,119,6,0.6)]">
                            n⁰
                        </div>
                    )}
                    {isDecaying && (
                        <>
                            {/* "Vacuum fluctuation / Ether suction" */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(168,85,247,0.3)_100%)] animate-pulse" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.4)_90deg,transparent_180deg)] animate-[spin_5s_linear_infinite]"></div>
                                {/* Inverse sucking lines */}
                                <div className="absolute inset-0" style={{ background: 'repeating-radial-gradient(circle, transparent, transparent 10px, rgba(168,85,247,0.1) 12px, transparent 14px)' }}></div>
                            </div>
                            
                            {/* Central sucking void */}
                            <div className="absolute z-10 w-24 h-24 bg-black/80 rounded-full shadow-[0_0_30px_10px_rgba(88,28,135,1)] flex flex-col items-center justify-center border-2 border-fuchsia-900 overflow-hidden">
                                <span className="text-amber-500 text-3xl font-black drop-shadow-[0_0_10px_rgba(217,119,6,0.8)] mb-1">
                                    n⁰
                                </span>
                                <span className="text-fuchsia-400 text-[10px] font-mono whitespace-nowrap bg-fuchsia-950/80 px-2 rounded-full border border-fuchsia-500/50">
                                    {Math.floor(timeElapsedReal)}s / 612s
                                </span>
                            </div>

                            {/* Emitting beta particles sporadically based on active amount */}
                            <div className="absolute inset-0 border-[20px] border-black rounded-full pointer-events-none z-30"></div>
                            {convertedAmount > 0 && Array.from({ length: Math.min(8, convertedAmount) }).map((_, i) => (
                                <div key={`sp-e-${i}`} className="absolute z-20 w-[54px] h-[54px] bg-blue-500/60 rounded-full border border-blue-300 mix-blend-screen flex items-center justify-center font-bold text-white/50 text-[10px] animate-[ping]_infinite" 
                                    style={{ 
                                        animationDuration: `${0.8 + Math.random()}s`,
                                        top: `${10 + Math.random() * 80}%`,
                                        left: `${10 + Math.random() * 80}%`
                                    }}
                                >e⁻</div>
                            ))}
                            {convertedAmount > 0 && Array.from({ length: Math.min(3, convertedAmount) }).map((_, i) => (
                                <div key={`sp-p-${i}`} className="absolute z-20 w-4 h-4 bg-red-500 rounded-full blur-[1px] shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[pulse]_infinite" 
                                    style={{ 
                                        animationDuration: `${1.5 + Math.random()}s`,
                                        bottom: `${10 + Math.random() * 80}%`,
                                        right: `${10 + Math.random() * 80}%`
                                    }}
                                ></div>
                            ))}
                        </>
                    )}

                    {/* Progress indicator */}
                    <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-fuchsia-600 via-red-500 to-blue-500 transition-all duration-300" style={{ width: `${(convertedAmount / Math.max(1, activeVaultAmount)) * 100}%` }}></div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase">
                            <span>Neutrony: {currentN}</span>
                            <span className="text-fuchsia-400">Zamieniono: {convertedAmount}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max={Math.max(1, isDecaying ? activeVaultAmount : engine.state.neutrons)} 
                            value={isDecaying ? currentN : decayAmount} 
                            onChange={e => !isDecaying && setDecayAmount(parseInt(e.target.value))}
                            disabled={isDecaying || engine.state.neutrons < 1}
                            className="w-full mb-2 accent-fuchsia-500 disabled:opacity-50"
                        />
                        <div className="text-center font-mono text-lg font-black text-white">
                            {isDecaying ? currentN : decayAmount} n⁰ <span className="text-slate-500 text-sm">➔</span> <span className="text-red-400">{convertedAmount} p⁺</span>, <span className="text-blue-400">{convertedAmount} e⁻</span>
                        </div>
                        
                        {/* Status ETA Data */}
                        {(() => {
                            const formatT = (sec: number) => {
                                if (!isFinite(sec) || sec < 0) return '0s';
                                const sm = Math.floor(sec / 60);
                                const ss = Math.floor(sec % 60);
                                return sm > 0 ? `${sm}m ${ss}s` : `${ss}s`;
                            };
                            
                            const tv = isDecaying ? currentN : decayAmount;
                            const totalTime = tv > 0 ? T_HALF * (1 + Math.log2(tv)) : 0;
                            
                            if (isDecaying) {
                                return (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span>Całkowity koniec za:</span>
                                            <span className="text-fuchsia-400 font-mono">{formatT(totalTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Kolejny T½ (do {Math.floor(currentN/2)} n⁰):</span>
                                            <span className="text-amber-400 font-mono">{formatT(T_HALF - (timeElapsedReal % T_HALF))}</span>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span>Czas T½ (do {Math.floor(decayAmount/2)} n⁰):</span>
                                            <span className="text-amber-400 font-mono">{formatT(T_HALF)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Czas całk. zniknięcia:</span>
                                            <span className="text-fuchsia-400 font-mono">{formatT(totalTime)}</span>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>

                    {!isDecaying ? (
                        <button 
                            disabled={engine.state.neutrons < decayAmount || engine.state.neutrons < 1}
                            onClick={startDecay}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                                engine.state.neutrons >= decayAmount && engine.state.neutrons >= 1
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:scale-105 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                        >
                            Umieść i Czekaj (Offline)
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button 
                                disabled={convertedAmount <= 0}
                                onClick={collectPartial}
                                className="w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 border border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ZBIERZ CZĘŚĆ ({convertedAmount} p⁺)
                            </button>
                            <button 
                                onClick={finishDecay}
                                className="w-full py-2 rounded-xl font-bold uppercase tracking-widest transition-all bg-fuchsia-900/50 hover:bg-fuchsia-800 text-white hover:scale-105 active:scale-95 border border-fuchsia-500/30 text-xs"
                            >
                                Zakończ Całkowicie
                            </button>
                        </div>
                    )}
                    {isDecaying && <p className="text-center text-[10px] text-fuchsia-300/70 font-mono tracking-widest uppercase">Reakcja trwa. Możesz bezpiecznie wyjść z gry.</p>}
                </div>
            </div>
        </div>
    );
};

export const AlchemyTable = ({
    engine,
    onClose,
    setTriggerRender
}: {
    engine: any;
    onClose: () => void;
    setTriggerRender: any;
}) => {
    const [activeTab, setActiveTab] = useState<'transmute' | 'synthesize' | 'base' | 'beta'>('synthesize');
    const [p, setP] = useState(1);
    const [n, setN] = useState(0);
    const [e, setE] = useState(1);
    const [discovered, setDiscovered] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [showAlchemyPeriodicTable, setShowAlchemyPeriodicTable] = useState(false);
    const [selectedBaseElementSymbol, setSelectedBaseElementSymbol] = useState<string | null>(null);
    const [baseWarning, setBaseWarning] = useState<string>('');

    // Sprawdzanie czy podane protony i elektrony pasuja do czegokolwiek
    const checkStable = () => {
        if (p !== e) {
            setError(`Niestabilny ładunek sztucznego jonu! Zaburzenie elektrostatyczne. Potrzebujesz tylu samo elektronów (${e}) co protonów (${p}).`);
            setDiscovered(null);
            return;
        }

        const element = PERIODIC_TABLE.find(el => el.z === p);
        if (!element) {
            setError('Nieudana synteza jądrowa. Atom rozpadł się na fotony i kwarki.');
            setDiscovered(null);
            return;
        }
        
        if (element.group === 'unknown') {
            setError(`Zsyntezowałeś materię! Ale ten pierwiastek jest nieznany nauce: Z=${p}. Znika.`);
            setDiscovered(null);
            return;
        }

        let expectedN = Math.round(p * 1.1);
        if (p > 20) expectedN = Math.round(p * 1.3);
        if (p > 50) expectedN = Math.round(p * 1.4);
        if (p > 80) expectedN = Math.round(p * 1.5);
        if (p === 1) expectedN = 0; // Protium
        if (p === 2) expectedN = 2; // Helium-4

        const nDiff = Math.abs(n - expectedN);
        const maxTol = Math.max(1, Math.floor(p * 0.15));

        const isStandard = n === expectedN;
        const isRadioactive = nDiff > maxTol;

        setError('');
        setDiscovered({
            ...element,
            isotopeSymbol: `${p + n}${element.symbol}`,
            isRadioactive,
            n,
            p,
            e,
            title: isStandard 
                ? `Standardowy ${element.name} (${p + n}${element.symbol})` 
                : isRadioactive 
                    ? `Promieniotwórczy izotop ${element.name} (${p + n}${element.symbol}*)` 
                    : `Stabilny izotop ${element.name} (${p + n}${element.symbol})`
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            checkStable();
        }, 300);
        return () => clearTimeout(timeout);
    }, [p, n, e]);

    const handleUnlock = () => {
        if (!discovered) return;
        
        const canBuild = engine.state.protons >= p && engine.state.lobbyElectrons >= e && engine.state.neutrons >= n;
        if (!canBuild) {
            setError(`Brakuje surowców! Potrzebujesz ${p} p⁺, ${e} e⁻ i ${n} n⁰ do stworzenia ${discovered.isotopeSymbol}.`);
            return;
        }

        setIsSynthesizing(true);
        setTimeout(() => {
            engine.state.protons -= p;
            engine.state.lobbyElectrons -= e;
            engine.state.neutrons -= n;
            
            const targetSymbol = discovered.isotopeSymbol;
            if (!engine.state.unlockedAlchemyAtoms.includes(targetSymbol)) {
                engine.state.unlockedAlchemyAtoms.push(targetSymbol);
            }
            if (!engine.state.unlockedAtoms.includes(targetSymbol)) {
                engine.state.unlockedAtoms.push(targetSymbol);
            }
            if (!engine.state.unlockedAlchemyAtoms.includes(discovered.symbol)) {
                engine.state.unlockedAlchemyAtoms.push(discovered.symbol);
            }
            if (!engine.state.unlockedAtoms.includes(discovered.symbol)) {
                engine.state.unlockedAtoms.push(discovered.symbol);
            }
            engine.syncReactions();
            engine.saveGame();
            
            setIsSynthesizing(false);
            setTriggerRender((r: number) => r + 1);
        }, 2500);
    };

    if (!engine.state.alchemyUnlocked) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] backdrop-blur-md p-4" onClick={onClose}>
                <div className="bg-slate-900 border border-fuchsia-500/30 shadow-[0_0_50px_rgba(217,70,239,0.2)] rounded-3xl p-8 max-w-lg w-full text-center relative max-h-screen overflow-y-auto" onClick={ev => ev.stopPropagation()}>
                    <button className="absolute top-4 right-4 text-2xl text-slate-400 hover:text-white" onClick={onClose}>&times;</button>
                    <h2 className="text-3xl font-black text-fuchsia-400 mb-6">⚗️ STÓŁ ALCHEMICZNY</h2>
                    <p className="text-lg text-slate-300 mb-6">Aby włączyć Stół Alchemiczny potrzebujesz początkowej energii.</p>
                    <button 
                        className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-transform ${engine.state.protons >= 10 ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        onClick={() => {
                            if (engine.state.protons >= 10) {
                                engine.state.protons -= 10;
                                engine.state.alchemyUnlocked = true;
                                engine.saveGame();
                                setTriggerRender((r: number) => r+1);
                            }
                        }}
                    >
                        Włącz (Koszt: 10 p⁺)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[200] backdrop-blur-md p-2 sm:p-4" onClick={!isSynthesizing ? onClose : undefined}>
            <div className="bg-slate-900/95 border border-purple-500 shadow-2xl rounded-xl sm:rounded-2xl p-3 sm:p-6 w-full max-w-4xl max-h-[100dvh] md:max-h-[80vh] flex flex-col relative overflow-hidden" onClick={ev => ev.stopPropagation()}>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-wrap justify-between w-full items-center mb-4 z-10 gap-x-4 gap-y-2">
                    <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">
                        Stół Alchemiczny
                    </h2>
                    
                    {/* Compact Currencies */}
                    <div className="flex gap-2 mr-6 md:mr-0">
                        <div className="bg-slate-800/80 px-3 py-1 md:py-2 rounded-xl border border-red-500/30 w-16 md:w-20 text-center flex flex-col">
                            <span className="text-sm md:text-lg font-black text-red-500 leading-none">{engine.state.protons}</span>
                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 leading-none">p⁺</span>
                        </div>
                        <div className="bg-slate-800/80 px-3 py-1 md:py-2 rounded-xl border border-blue-500/30 w-16 md:w-20 text-center flex flex-col">
                            <span className="text-sm md:text-lg font-black text-blue-500 leading-none">{engine.state.lobbyElectrons}</span>
                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 leading-none">e⁻</span>
                        </div>
                        <div className="bg-slate-800/80 px-3 py-1 md:py-2 rounded-xl border border-amber-500/30 w-16 md:w-20 text-center flex flex-col">
                            <span className="text-sm md:text-lg font-black text-amber-500 leading-none">{engine.state.neutrons}</span>
                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 leading-none">n⁰</span>
                        </div>
                    </div>
                    
                    {!isSynthesizing && <button onClick={onClose} className="absolute top-2 right-3 md:top-4 md:right-6 text-slate-400 hover:text-white text-2xl md:text-3xl">&times;</button>}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap w-full mb-4 z-10 bg-slate-800/50 rounded-lg p-1 gap-1">
                    <button onClick={() => { setActiveTab('synthesize'); setBaseWarning(''); }} className={`flex-1 min-w-[120px] py-1.5 md:py-2 text-xs md:text-sm font-bold rounded-md transition-colors ${activeTab === 'synthesize' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Synteza Atomów</button>
                    <button onClick={() => { setActiveTab('transmute'); setBaseWarning(''); }} className={`flex-1 min-w-[120px] py-1.5 md:py-2 text-xs md:text-sm font-bold rounded-md transition-colors ${activeTab === 'transmute' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Transmutacje</button>
                    <button onClick={() => { setActiveTab('beta'); setBaseWarning(''); }} className={`flex-1 min-w-[120px] py-1.5 md:py-2 text-xs md:text-sm font-bold rounded-md transition-colors ${activeTab === 'beta' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-slate-400 hover:bg-slate-700'}`}>Rozpad Beta</button>
                    <button onClick={() => { setActiveTab('base'); setBaseWarning(''); }} className={`flex-1 min-w-[120px] py-1.5 md:py-2 text-xs md:text-sm font-bold rounded-md transition-colors ${activeTab === 'base' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Wybór Bazy</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto relative z-10 w-full rounded-xl custom-scrollbar pb-6 md:pb-0">
                    {activeTab === 'synthesize' && (
                        <div className="flex flex-col md:flex-row gap-4 w-full h-full pb-4">
                            {/* Left side: Canvas */}
                            <div className="w-full md:w-1/2 h-44 md:h-full min-h-[170px] md:min-h-[300px] flex-shrink-0 relative rounded-xl overflow-hidden border border-slate-700 bg-black/50">
                                <MenuGameplay isAlchemyMode customParticles={{p, n, e}} alchemySynthesizing={isSynthesizing} />
                            </div>

                            {/* Right side: Controls */}
                            <div className="w-full md:w-1/2 flex flex-col z-10 relative">
                                <p className="text-slate-300 text-xs text-center mb-4 z-10 italic font-medium">
                                    Skonstruuj pierwiastek z cząstek elementarnych.
                                </p>

                                {/* Periodic Table Selector Button */}
                                <div className="w-full mb-4 z-10">
                                    <button 
                                        disabled={isSynthesizing}
                                        onClick={() => setShowAlchemyPeriodicTable(true)}
                                        className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400"
                                    >
                                        ⚛️ Wybierz z Tablicy Mendelejewa
                                    </button>
                                </div>

                                <div className="w-full flex flex-col gap-4 z-10 mb-4 pointer-events-auto">
                                    {/* Protons */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-red-400 font-bold">
                                            <span className="uppercase text-[10px] md:text-xs">Protony (Koszt)</span>
                                            <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded border border-red-500/50">{p} / {p}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button disabled={isSynthesizing || p <= 1} onClick={() => setP(v => Math.max(1, v - 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">-</button>
                                            <input type="range" disabled={isSynthesizing} min="1" max="118" value={p} onChange={ev => setP(parseInt(ev.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-50" />
                                            <button disabled={isSynthesizing || p >= 118} onClick={() => setP(v => Math.min(118, v + 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">+</button>
                                        </div>
                                    </div>

                                    {/* Neutrons */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-slate-400 font-bold">
                                            <span className="uppercase text-[10px] md:text-xs">Neutrony (Koszt)</span>
                                            <span className="text-xs bg-slate-500/20 px-2 py-0.5 rounded border border-slate-500/50">{n} / {p}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button disabled={isSynthesizing || n <= 0} onClick={() => setN(v => Math.max(0, v - 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">-</button>
                                            <input type="range" disabled={isSynthesizing} min="0" max="180" value={n} onChange={ev => setN(parseInt(ev.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 disabled:opacity-50" />
                                            <button disabled={isSynthesizing || n >= 180} onClick={() => setN(v => Math.min(180, v + 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">+</button>
                                        </div>
                                    </div>

                                    {/* Electrons */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-blue-400 font-bold">
                                            <span className="uppercase text-[10px] md:text-xs">Elektrony (Koszt)</span>
                                            <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/50">{e} / {p}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button disabled={isSynthesizing || e <= 1} onClick={() => setE(v => Math.max(1, v - 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">-</button>
                                            <input type="range" disabled={isSynthesizing} min="1" max="118" value={e} onChange={ev => setE(parseInt(ev.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50" />
                                            <button disabled={isSynthesizing || e >= 118} onClick={() => setE(v => Math.min(118, v + 1))} className="bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30">+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Isotope Quick-Selection Selector */}
                                {(() => {
                                    const element = PERIODIC_TABLE.find(el => el.z === p);
                                    if (!element) return null;
                                    const formatSuperscript = (num: number) => num.toString().split('').map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(char)]).join('');
                                    
                                    let expectedN = Math.round(p * 1.1);
                                    if (p > 20) expectedN = Math.round(p * 1.3);
                                    if (p > 50) expectedN = Math.round(p * 1.4);
                                    if (p > 80) expectedN = Math.round(p * 1.5);
                                    if (p === 1) expectedN = 0;
                                    if (p === 2) expectedN = 2;

                                    const isotopes = [];
                                    const minN = Math.max(0, expectedN - 3);
                                    const maxN = expectedN + 4;

                                    for (let curN = minN; curN <= maxN; curN++) {
                                        const mass = p + curN;
                                        const isStandard = curN === expectedN;
                                        const isRadioactive = Math.abs(curN - expectedN) > Math.max(1, Math.floor(p * 0.15));
                                        isotopes.push({
                                            nVal: curN,
                                            mass,
                                            isStandard,
                                            isRadioactive,
                                            label: isStandard ? 'Stabilny' : (isRadioactive ? 'Rozpadający' : 'Izotop')
                                        });
                                    }

                                    return (
                                        <div className="flex flex-col gap-1.5 mb-4 z-10 pointer-events-auto">
                                            <span className="uppercase text-[9px] font-extrabold text-indigo-300 tracking-wider">Szybki wybór izotopu ({element.name}):</span>
                                            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                                                {isotopes.map(iso => {
                                                    const active = n === iso.nVal;
                                                    let themeCls = "border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-900/40";
                                                    if (active) {
                                                        themeCls = "border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]";
                                                    } else if (iso.isStandard) {
                                                        themeCls = "border-emerald-950 bg-emerald-950/20 text-emerald-400";
                                                    } else if (iso.isRadioactive) {
                                                        themeCls = "border-rose-950 bg-rose-950/20 text-rose-400";
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={iso.nVal}
                                                            type="button"
                                                            disabled={isSynthesizing}
                                                            onClick={() => setN(iso.nVal)}
                                                            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer max-w-full ${themeCls}`}
                                                        >
                                                            <span className="text-xs leading-none font-bold">{formatSuperscript(iso.mass)}{element.symbol}</span>
                                                            <span className="text-[7px] font-semibold scale-90 tracking-tight opacity-75 leading-none mt-1">{iso.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="w-full min-h-[80px] flex items-center justify-center border-2 border-dashed border-slate-600 rounded-xl bg-black/40 relative z-10 p-2 overflow-hidden">
                                    {isSynthesizing ? (
                                        <div className="text-fuchsia-400 text-sm font-bold tracking-widest uppercase animate-pulse">SYNTEZA W TOKU...</div>
                                    ) : error ? (
                                        <div className="text-red-400 text-xs text-center animate-[pulse_1s_ease-in-out_infinite] px-2">{error}</div>
                                    ) : discovered ? (
                                        <div className="flex flex-col items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
                                            <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${discovered.isRadioactive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{discovered.title}</div>
                                            <div className="text-3xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] leading-none">
                                                {discovered.isotopeSymbol}
                                            </div>
                                            <div className="text-indigo-300 font-bold mt-1 text-xs">Koszt: {p} p⁺, {e} e⁻, {n} n⁰</div>
                                            {discovered.isRadioactive && (
                                                <div className="text-[9px] text-rose-300 font-mono mt-1 text-center font-bold">
                                                    ⚠ PROMIENIOTWÓRCZY: Pulsacja aury po uderzeniu!
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="w-full mt-4 z-10">
                                    {(() => {
                                        const owns = discovered ? engine.state.unlockedAlchemyAtoms.includes(discovered.isotopeSymbol) : false;
                                        const canAfford = discovered ? (engine.state.protons >= p && engine.state.lobbyElectrons >= e && engine.state.neutrons >= n) : false;
                                        const disabled = isSynthesizing || !discovered || owns || !canAfford;

                                        return (
                                            <button
                                                onClick={handleUnlock}
                                                disabled={disabled}
                                                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all duration-300 ${disabled ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95'}`}
                                            >
                                                {isSynthesizing ? 'TWORZENIE...' : (owns ? 'Już posiadasz' : (discovered ? (!canAfford ? 'Brak Surowców' : `ZBUDUJ ${discovered.isotopeSymbol}`) : 'Brak Formuły'))}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'transmute' && (
                        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-blue-500/30 text-center flex flex-col gap-4 shadow-inner flex-1 max-w-sm">
                                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm">Transmutuj Elektrony</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-2">Rozpad protonu dostarcza gigantycznej energii i masy elektronów (1p = 1836e⁻).</p>
                                <button
                                    className={`py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all border ${engine.state.protons >= 1 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    onClick={() => {
                                        if (engine.state.protons >= 1) {
                                            engine.state.protons -= 1;
                                            engine.state.lobbyElectrons += 1836;
                                            engine.saveGame();
                                            setTriggerRender((r: number) => r+1);
                                        }
                                    }}
                                >
                                    PRODUKUJ ELEKTRONY<br/><span className="text-[10px] text-blue-200 block mt-1">(Koszt: 1p⁺ ➔ +1836e⁻)</span>
                                </button>
                            </div>
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-amber-500/30 text-center flex flex-col gap-4 shadow-inner flex-1 max-w-sm">
                                <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm">Transmutuj Neutrony</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-2">Połączenie p⁺ i e⁻ tworzy ciężki neutron przydatny jako złącznik.</p>
                                <button
                                    className={`py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all border ${engine.state.protons >= 1 && engine.state.lobbyElectrons >= 3 ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    onClick={() => {
                                        if (engine.state.protons >= 1 && engine.state.lobbyElectrons >= 3) {
                                            engine.state.protons -= 1;
                                            engine.state.lobbyElectrons -= 3; // 1 to combine, 2 fee
                                            engine.state.neutrons += 1;
                                            engine.saveGame();
                                            setTriggerRender((r: number) => r+1);
                                        }
                                    }}
                                >
                                    PRODUKUJ NEUTRON<br/><span className="text-[10px] text-amber-200 block mt-1">(Koszt: 1p⁺ + 3e⁻ ➔ 1n⁰)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'beta' && (
                        <BetaDecayTab engine={engine} setTriggerRender={setTriggerRender} />
                    )}

                    {activeTab === 'base' && (
                        <div className="flex flex-col items-center text-center w-full">
                            <h3 className="text-xl font-bold text-indigo-300 mb-1">Baza Postaci (Wyposażenie)</h3>

                                    <p className="text-xs text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed mt-4">
                                        Wybierz odblokowany pierwiastek z listy poniżej, aby przełączać między jego zdobytymi formami lub izotopami. Możesz wyposażyć maksymalnie <span className="text-cyan-400 font-bold">dwa pierwiastki startowe</span> (bronie).
                                    </p>

                                    {/* Currently Equipped Slots */}
                                    <div className="flex gap-4 mb-4 justify-center items-center bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Wybrane pierwiastki (Broń):</span>
                                        <div className="flex gap-2">
                                            {[0, 1].map(index => {
                                                const atomStr = engine.state.baseAtoms[index];
                                                const formatSuperscriptSymbol = (name: string) => {
                                                    const match = name.match(/^(\d+)([A-Z][a-z]?)$/);
                                                    if (match) {
                                                        const supers = match[1].split('').map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(char)]).join('');
                                                        return `${supers}${match[2]}`;
                                                    }
                                                    return name;
                                                };
                                                if (!atomStr) {
                                                    return (
                                                        <div key={index} className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 bg-black/40 text-[9px] text-slate-500 flex flex-col items-center justify-center font-bold">
                                                            <span>Wolny Slot</span>
                                                            <span className="scale-[0.8] opacity-50 mt-1">{index === 0 ? 'Lewa ręka' : 'Prawa ręka'}</span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            engine.state.baseAtoms = engine.state.baseAtoms.filter((a: string) => a !== atomStr);
                                                            setBaseWarning('');
                                                            engine.saveGame();
                                                            setTriggerRender((r: number) => r + 1);
                                                        }}
                                                        className="w-14 h-14 rounded-xl border border-fuchsia-500 bg-fuchsia-950/30 text-fuchsia-200 flex flex-col items-center justify-center font-bold group hover:border-red-500 hover:bg-red-950/30 hover:text-red-300 transition-all text-sm cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(217,70,239,0.25)]"
                                                        title="Kliknij, aby zdjąć"
                                                    >
                                                        <span className="text-base font-black leading-none">{formatSuperscriptSymbol(atomStr)}</span>
                                                        <span className="text-[7px] font-bold text-fuchsia-400 group-hover:text-red-400 scale-[0.8] mt-1.5 uppercase leading-none">Zdejmij</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Warnings list */}
                                    {baseWarning && (
                                        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl px-4 py-2 text-xs text-rose-300 mb-4 max-w-sm mx-auto text-center font-bold animate-bounce">
                                            ⚠️ {baseWarning}
                                        </div>
                                    )}

                                    {/* Isotope Selection Drawer / Sub-panel */}
                                    {selectedBaseElementSymbol && (() => {
                                        const matchingElement = PERIODIC_TABLE.find(x => x.symbol === selectedBaseElementSymbol);
                                        if (!matchingElement) return null;
                                        
                                        const formatIsotopic = (name: string) => {
                                            const match = name.match(/^(\d+)([A-Z][a-z]?)$/);
                                            if (match) {
                                                const supers = match[1].split('').map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(char)]).join('');
                                                return `${supers}${match[2]}`;
                                            }
                                            return `Stabilny ${name}`;
                                        };

                                        // Filter all items in unlockedAlchemyAtoms where atomic symbol is selectedBaseElementSymbol
                                        const elementIsotopes = engine.state.unlockedAlchemyAtoms.filter((atomStr: string) => {
                                            const match = atomStr.match(/^(\d+)([A-Z][a-z]?)$/);
                                            const sym = match ? match[2] : atomStr;
                                            return sym === selectedBaseElementSymbol;
                                        });

                                        return (
                                            <div className="w-full max-w-2xl bg-slate-950/80 p-4 rounded-xl border border-indigo-500/30 mb-4 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="text-left flex-1">
                                                        <span className="text-[10px] uppercase font-extrabold text-indigo-400 tracking-wider">Odblokowane postacie / izotopy:</span>
                                                        <h4 className="text-base font-black text-white">{matchingElement.name} ({matchingElement.symbol})</h4>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSelectedBaseElementSymbol(null)}
                                                        className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-bold rounded-lg cursor-pointer border border-slate-700/60 active:scale-95"
                                                    >
                                                        Zamknij podgląd
                                                    </button>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2.5 justify-center">
                                                    {elementIsotopes.map((atomStr: string) => {
                                                        const isEquipped = engine.state.baseAtoms.includes(atomStr);
                                                        const isRadioactive = atomStr.match(/^\d+/) && (() => {
                                                            // Parse protons & neutrons to determine radioactivity
                                                            const match = atomStr.match(/^(\d+)([A-Z][a-z]?)$/);
                                                            if (!match) return false;
                                                            const mass = parseInt(match[1]);
                                                            const pVal = matchingElement.z;
                                                            const nVal = mass - pVal;
                                                            let expectedN = Math.round(pVal * 1.1);
                                                            if (pVal > 20) expectedN = Math.round(pVal * 1.3);
                                                            if (pVal > 50) expectedN = Math.round(pVal * 1.4);
                                                            if (pVal > 80) expectedN = Math.round(pVal * 1.5);
                                                            if (pVal === 1) expectedN = 0;
                                                            if (pVal === 2) expectedN = 2;
                                                            const nDiff = Math.abs(nVal - expectedN);
                                                            const maxTol = Math.max(1, Math.floor(pVal * 0.15));
                                                            return nDiff > maxTol;
                                                        })();

                                                        return (
                                                            <button
                                                                key={atomStr}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isEquipped) {
                                                                        engine.state.baseAtoms = engine.state.baseAtoms.filter((a: string) => a !== atomStr);
                                                                        setBaseWarning('');
                                                                    } else {
                                                                        if (engine.state.baseAtoms.length < 2) {
                                                                            if (!engine.state.baseAtoms.includes(atomStr)) {
                                                                                engine.state.baseAtoms.push(atomStr);
                                                                            }
                                                                            setBaseWarning('');
                                                                        } else {
                                                                            setBaseWarning("Osiągnięto limit: możesz wyposażyć maksymalnie 2 pierwiastki startowe! Kliknij na już wybrany pierwiastek, aby go zdjąć.");
                                                                        }
                                                                    }
                                                                    engine.saveGame();
                                                                    setTriggerRender((r: number) => r + 1);
                                                                }}
                                                                className={`py-2 px-4 rounded-xl border text-xs font-black flex items-center gap-2.5 cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                                                                    isEquipped 
                                                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.5)] font-black' 
                                                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                                                }`}
                                                            >
                                                                <span className="text-sm font-black text-white">{formatIsotopic(atomStr)}</span>
                                                                {isRadioactive && <span className="text-[8px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-900 leading-none">☢ PROMIEN.</span>}
                                                                <span className="text-[8px] font-bold uppercase opacity-75">
                                                                    {isEquipped ? '● AKTYWNY' : 'WYPOSAŻ'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                    {elementIsotopes.length === 0 && (
                                                        <div className="text-slate-500 italic text-xs py-2">
                                                            Nie stworzyłeś jeszcze żadnej stabilnej ani izotopowej odmiany tego pierwiastka w zakładce "Synteza Atomów"!
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Unlocked Base Elements Grid instead of the full Periodic Table */}
                                    {!selectedBaseElementSymbol && (
                                        <div className="w-full bg-slate-950/60 p-2 md:p-4 rounded-2xl border border-slate-800 flex flex-col items-center shadow-lg">
                                            <span className="text-[11px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 self-center text-center">
                                                Wybierz Pierwiastek, aby zobaczyć formy / izotopy:
                                            </span>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 w-full max-w-5xl mx-auto">
                                                {Array.from(new Set(engine.state.unlockedAlchemyAtoms.map((a: string) => {
                                                    const m = a.match(/^(\d+)([A-Z][a-z]?)$/);
                                                    return m ? m[2] : a;
                                                }))).map(sym => {
                                                    const matchingElement = PERIODIC_TABLE.find(x => x.symbol === sym);
                                                    if (!matchingElement) return null;
                                                    
                                                    // Check if any of its isotopes are currently equipped
                                                    const isEquipped = engine.state.baseAtoms.some((equippedAtom: string) => {
                                                        const m = equippedAtom.match(/^(\d+)([A-Z][a-z]?)$/);
                                                        const eqSym = m ? m[2] : equippedAtom;
                                                        return eqSym === sym;
                                                    });

                                                    return (
                                                        <button
                                                            key={sym}
                                                            type="button"
                                                            onClick={() => setSelectedBaseElementSymbol(sym)}
                                                            className={`relative group flex flex-col items-center justify-center p-3 h-20 md:h-24 rounded-2xl border-2 transition-all cursor-pointer active:scale-95 ${
                                                                isEquipped 
                                                                    ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)]' 
                                                                    : 'bg-slate-900 border-slate-700 hover:border-indigo-400 hover:bg-slate-800'
                                                            }`}
                                                        >
                                                            <span className="absolute top-1.5 left-2 text-[10px] md:text-xs text-slate-500 font-mono font-bold leading-none">{matchingElement.z}</span>
                                                            {isEquipped && (
                                                                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_5px_#e879f9] animate-pulse"></span>
                                                            )}
                                                            <span className={`text-2xl md:text-3xl font-black mt-2 leading-none ${isEquipped ? 'text-fuchsia-100' : 'text-white'}`}>
                                                                {sym}
                                                            </span>
                                                            <span className="text-[10px] md:text-xs text-slate-400 font-bold max-w-full truncate px-1 mt-1.5">
                                                                {matchingElement.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            {engine.state.unlockedAlchemyAtoms.length === 0 && (
                                                <div className="text-slate-500 italic py-8 text-sm">
                                                    Brak wykreowanych pierwiastków w bazie. Zacznij odkrywać!
                                                </div>
                                            )}
                                        </div>
                                    )}
                        </div>
                    )}
                </div>

                {/* Alchemy Periodic Table Overlay */}
                {showAlchemyPeriodicTable && (
                    <div className="absolute inset-0 bg-[#06060c]/95 z-[60] flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
                        <div className="p-4 bg-slate-900/90 border-b border-slate-705/30 flex justify-between items-center flex-shrink-0">
                            <div className="flex flex-col">
                                <span className="font-extrabold text-xs md:text-sm uppercase tracking-wider text-cyan-400">Wybierz Pierwiastek dla Syntezy</span>
                                <span className="text-[9px] md:text-[10px] text-slate-400">Wybierz pierwiastek, by auto-uzupełnić protony, neutrons i elektrony</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowAlchemyPeriodicTable(false)}
                                className="bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-1.5 rounded-xl text-slate-300 font-bold transition-all text-xs border border-slate-700 uppercase tracking-wider cursor-pointer active:scale-95"
                            >
                                Cofnij
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-2 bg-black/60 flex flex-col items-center">
                            <PeriodicTable 
                                unlockedAtoms={PERIODIC_TABLE.map(x => x.symbol)}
                                isMenuMode={false}
                                onSelectAtom={(z) => {
                                    setP(z);
                                    setE(z);
                                    
                                    let expectedN = Math.round(z * 1.1);
                                    if (z > 20) expectedN = Math.round(z * 1.3);
                                    if (z > 50) expectedN = Math.round(z * 1.4);
                                    if (z > 80) expectedN = Math.round(z * 1.5);
                                    if (z === 1) expectedN = 0;
                                    if (z === 2) expectedN = 2;
                                    setN(expectedN);
                                    
                                    setShowAlchemyPeriodicTable(false);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
