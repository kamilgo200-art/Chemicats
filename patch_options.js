import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"\n                        \/>\n                    <\/div>/,
`                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                            Skala Interfejsu (UI):
                            <span>{Math.round((engineRef.current?.state.uiScale || 1.0) * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.05"
                            value={engineRef.current?.state.uiScale || 1.0}
                            onChange={(e) => {
                                if (engineRef.current) {
                                  engineRef.current.state.uiScale = parseFloat(e.target.value);
                                  engineRef.current.saveGame(true);
                                }
                                setTriggerRender(r=>r+1);
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>`
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched');
