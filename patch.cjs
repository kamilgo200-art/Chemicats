const fs = require('fs');
const content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
const replacement = `                        </label>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 font-sans flex flex-col gap-2">
                        <label className="text-slate-300 text-xs font-bold tracking-widest flex justify-between">
                            Skala UI:
                            <span>{Math.round((engineRef.current?.state.uiScale || 1.0) * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.05"
                            value={engineRef.current?.state.uiScale || 1.0}
                            onChange={(e) => {
                                if (engineRef.current) {
                                    engineRef.current.state.uiScale = parseFloat(e.target.value);
                                    engineRef.current.saveGame(true);
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 font-sans flex flex-col gap-2">
                        <label className="text-slate-300 text-xs font-bold tracking-widest flex justify-between">
                            Zoom Kamery:`;
const patched = content.replace(`                        </label>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 font-sans flex flex-col gap-2">
                        <label className="text-slate-300 text-xs font-bold tracking-widest flex justify-between">
                            Zoom Kamery:`, replacement);
fs.writeFileSync('src/components/GameCanvas.tsx', patched);
console.log('patched');
