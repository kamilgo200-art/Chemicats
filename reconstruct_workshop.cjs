const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `                    {/* Heat Upgrade */}`;
const newCardStr = `                    {/* SuperWeapon Unlock Upgrade */}
                    {engineRef.current!.state.unlockedCharacters.includes('mendelejew') && (
                        <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                            <span className="text-4xl mb-3">⚛️</span>
                            <h3 className="text-xl font-bold text-purple-300 mb-1">Moduł Reakcji (Pasyw)</h3>
                            <p className="text-xs text-slate-400 mb-4 h-12">Trwale odblokowuje wybór związków chemicznych (Super Broń) od początku gry.</p>
                            
                            <div className="flex gap-2 mb-6">
                                <div className={\`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs \${engineRef.current!.state.hasSuperWeapon ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-transparent border-slate-600 text-slate-600'}\`}>
                                    {engineRef.current!.state.hasSuperWeapon ? '✓' : '1'}
                                </div>
                            </div>
                            
                            {(() => {
                                const isPurchased = engineRef.current!.state.hasSuperWeapon;
                                if (isPurchased) {
                                    return <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold tracking-widest cursor-not-allowed">{tx("POSIADANE")}</button>;
                                }
                                const cost = 100;
                                const canAfford = engineRef.current!.state.protons >= cost;
                                return (
                                    <button 
                                        onClick={() => {
                                            if (canAfford) {
                                                engineRef.current!.state.protons -= cost;
                                                engineRef.current!.state.hasSuperWeapon = true;
                                                engineRef.current!.saveGame();
                                                setTriggerRender(r => r+1);
                                            }
                                        }}
                                        className={\`w-full py-3 rounded-xl font-bold tracking-widest transition-all \${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}\`}
                                    >
                                        ULEPSZ ({cost} p⁺)
                                    </button>
                                );
                            })()}
                        </div>
                    )}
                    
                    {/* Heat Upgrade */}`;

const index = code.indexOf(targetStr);
if (index > -1) {
    code = code.replace(`                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`, `                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`);
    code = code.replace(targetStr, newCardStr);
    fs.writeFileSync('src/components/GameCanvas.tsx', code);
    console.log("FIXED");
} else {
    console.log("NOT FOUND");
}
