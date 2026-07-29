const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const regexLan = /\{showingLan && \([\s\S]*?className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform text-slate-400 hover:text-white"[\s\S]*?onClick=\{\(\) => setShowingLan\(false\)\}>[\s\S]*?×[\s\S]*?<\/button>[\s\S]*?<h2 className="text-2xl font-black tracking-tight text-white text-center flex items-center justify-center gap-2">[\s\S]*?<span className="text-indigo-400">⚛️<\/span> Tryb Wieloosobowy[\s\S]*?<\/h2>[\s\S]*?<p className="text-center text-slate-400 text-sm">Wybierz sposób połączenia z innymi graczami\.<\/p>[\s\S]*?<div className="flex flex-col items-center gap-4 mt-4">[\s\S]*?<div className="bg-indigo-900\/40 border border-indigo-500\/40 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center w-full shadow-\[0_0_20px_rgba\(99,102,241,0.2\)\]">[\s\S]*?<div className="flex items-center gap-4 mb-4">[\s\S]*?<div className="text-4xl md:text-5xl drop-shadow-\[0_0_15px_rgba\(99,102,241,0.5\)\]">🌍<\/div>[\s\S]*?<div className="text-2xl font-bold text-slate-500">\+<\/div>[\s\S]*?<div className="text-4xl md:text-5xl drop-shadow-\[0_0_15px_rgba\(6,182,212,0.5\)\]">📱<\/div>[\s\S]*?<\/div>[\s\S]*?<h3 className="font-bold text-xl md:text-2xl text-white mb-2">Graj ze znajomymi<\/h3>[\s\S]*?<p className="text-sm text-indigo-200\/80 mb-6 max-w-sm">[\s\S]*?Graj przez Internet lub z hotspotu \(routera Wi-Fi\) w telefonie! Podaj znajomym <strong>DOKŁADNIE TEN SAM LINK<\/strong> \(adres z paska u góry\), a pojawią się w Twoim lobby\.[\s\S]*?<\/p>[\s\S]*?<div className="flex flex-col items-center mb-6 w-full max-w-\[250px\]">[\s\S]*?<label className="text-xs text-indigo-300 font-bold mb-2 uppercase tracking-wider">Twój Nick<\/label>[\s\S]*?<input [\s\S]*?type="text" [\s\S]*?maxLength=\{16\}[\s\S]*?value=\{lanNick\}[\s\S]*?onClick=\{e => e\.stopPropagation\(\)\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?setLanNick\(e\.target\.value\);[\s\S]*?localStorage\.setItem\('lanNick', e\.target\.value\);[\s\S]*?\}\}[\s\S]*?className="bg-black\/50 border-2 border-indigo-500\/50 rounded-xl px-4 py-3 text-white text-center focus:border-indigo-400 outline-none transition-colors w-full shadow-inner"[\s\S]*?placeholder="Wpisz swój nick\.\.\."[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<button [\s\S]*?onClick=\{\(\) => \{[\s\S]*?setShowingLan\(false\);[\s\S]*?setLanActive\(true\);[\s\S]*?localStorage\.setItem\('lanActive', 'true'\);[\s\S]*?if \(engineRef\.current\) engineRef\.current\.state\.showingLobby = true;[\s\S]*?\}\}[\s\S]*?className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded-full text-sm md:text-base cursor-pointer border border-green-500\/50 shadow-\[0_0_20px_rgba\(34,197,94,0.5\)\] transition-all transform hover:scale-105 active:scale-95 w-full flex items-center justify-center gap-2"[\s\S]*?>[\s\S]*?<span>⚡<\/span> DOŁĄCZ DO LOBBY[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<p className="text-\[10px\] text-slate-500 text-center mt-2 px-4">[\s\S]*?W trybie wieloosobowym można wybierać te same zapisy \(save\) co w trybie pojedynczego gracza\. [\s\S]*?Jeśli w grze weźmie udział więcej graczy, najemnicy \(BOTy\) mogą nie być potrzebni i limit najemników dostosuje się do liczby graczy\.[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)}/m;

const replacementLan = `{showingLan && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19]/90 text-slate-100 z-[100] backdrop-blur-md p-2">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.3)] w-full max-w-md rounded-2xl p-4 relative flex flex-col gap-3">
                <button 
                    className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform text-slate-400 hover:text-white"
                    onClick={() => setShowingLan(false)}>
                    ×
                </button>
                <h2 className="text-xl font-black tracking-tight text-white text-center flex items-center justify-center gap-2">
                    <span className="text-indigo-400">⚛️</span> Tryb Wieloosobowy
                </h2>
                <p className="text-center text-slate-400 text-xs">Aż do 4 graczy! Bądź na tym samym linku.</p>
                
                <div className="flex flex-col items-center gap-3 mt-2">
                    <div className="bg-indigo-900/40 border border-indigo-500/40 rounded-xl p-4 flex flex-col items-center text-center w-full">
                        <div className="flex flex-col items-center mb-4 w-full">
                            <label className="text-[10px] text-indigo-300 font-bold mb-1 uppercase tracking-wider">Twój Nick</label>
                            <input 
                                type="text" 
                                maxLength={16}
                                value={lanNick}
                                onClick={e => e.stopPropagation()}
                                onChange={(e) => {
                                    setLanNick(e.target.value);
                                    localStorage.setItem('lanNick', e.target.value);
                                }}
                                className="bg-black/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white text-center focus:border-indigo-400 outline-none w-full max-w-[200px]"
                                placeholder="Wpisz swój nick..."
                            />
                        </div>

                        <div className="flex gap-2 w-full flex-col">
                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = true;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm border border-green-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>👑</span> HOSTUJ GRĘ (LAN/INTERNET)
                            </button>

                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = false;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm border border-blue-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>🔌</span> DOŁĄCZ DO GRY (LAN/INTERNET)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}`;

if (!regexLan.test(code)) {
    console.error("Match lan UI failed");
    process.exit(1);
}
code = code.replace(regexLan, replacementLan);

const lobbyRegex1 = /\{engineRef\.current\?\.state\?\.showingLobby && \([\s\S]*?<div className="flex flex-col gap-2 md:gap-3">[\s\S]*?<button [\s\S]*?onClick=\{\(\) => \{[\s\S]*?if \(engineRef\.current\) \{[\s\S]*?engineRef\.current\.state\.showingLobby = false;[\s\S]*?engineRef\.current\.state\.showingSaves = true;[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 md:py-3 px-4 rounded-xl shadow-\[0_0_20px_rgba\(99,102,241,0.4\)\] transition-all flex justify-center items-center gap-2 active:scale-95 text-xs md:text-base"[\s\S]*?>[\s\S]*?🚀 WYBIERZ ZAPIS I ROZPOCZNIJ GRĘ[\s\S]*?<\/button>[\s\S]*?<button [\s\S]*?onClick=\{\(\) => \{ if\(engineRef\.current\) engineRef\.current\.state\.showingLobby = false; \}\}[\s\S]*?className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 md:py-2.5 px-4 rounded-xl border border-slate-600 transition-all text-xs md:text-sm"[\s\S]*?>[\s\S]*?Wróć do Menu[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)}/m;

const lobbyReplace = `{engineRef.current?.state?.showingLobby && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f]/90 text-slate-100 z-[120] backdrop-blur-xl p-2 md:p-4">
             <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/50 w-full max-w-sm rounded-2xl p-4 relative shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                <button 
                  className="absolute top-4 right-4 text-xl hover:scale-110 transition-transform text-slate-400 hover:text-white"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingLobby = false; }}>
                  ×
                </button>
                <h2 className="text-xl font-black tracking-tight mb-2 text-white flex items-center gap-2 border-b border-indigo-500/30 pb-2">
                   <div className="text-2xl animate-pulse">👥</div> Lobby Wieloosobowe
                </h2>
                
                <p className="text-xs text-indigo-300 mb-3 px-1">Oczekuj na pozostałych graczy.</p>

                <div className="bg-black/40 rounded-xl p-3 border border-white/5 mb-4 max-h-48 overflow-y-auto">
                    <h3 className="font-bold text-slate-300 text-xs mb-2">Obecni Gracze:</h3>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-500/20">
                            <span className="font-bold text-white flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                {lanNick} (Ty) {engineRef.current.state.isHost ? "👑" : ""}
                            </span>
                        </div>
                        {engineRef.current.state.networkPlayers?.map((p: any) => (
                            <div key={p.id} className="flex justify-between items-center bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                                <span className="font-bold text-slate-300 flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    {p.nick || 'Gracz'}
                                </span>
                            </div>
                        ))}
                        {(!engineRef.current.state.networkPlayers || engineRef.current.state.networkPlayers.length === 0) && (
                            <div className="text-center text-slate-500 text-xs py-2 italic animate-pulse">
                                Oczekiwanie na graczy...
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {engineRef.current.state.isHost ? (
                        <button 
                            onClick={() => {
                                if (engineRef.current) {
                                    engineRef.current.state.showingLobby = false;
                                    engineRef.current.state.showingSaves = true;
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex justify-center items-center gap-2 active:scale-95 text-xs"
                        >
                            🚀 WYBIERZ ZAPIS I ROZPOCZNIJ
                        </button>
                    ) : (
                        <div className="bg-slate-800/80 border border-slate-600 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-center text-xs animate-pulse">
                            Oczekiwanie na hosta...
                        </div>
                    )}
                    <button 
                        onClick={() => { if(engineRef.current) engineRef.current.state.showingLobby = false; }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl border border-slate-600 transition-all text-xs"
                    >
                        Wróć do Menu
                    </button>
                </div>
             </div>
         </div>
      )}`;

if (!lobbyRegex1.test(code)) {
    console.error("Match lobby UI failed");
} else {
    code = code.replace(lobbyRegex1, lobbyReplace);
}

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log("Success UI Updates");
