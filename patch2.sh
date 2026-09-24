sed -i '5270,5280c\
                                              <button onClick={() => setSelectedReactionDetails(null)} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded text-white font-bold">{tx("Wróć")}</button>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        )}\
                    </div>\
                )}\
            </div>\
        </div>\
      )}\
\
      {gameStateUi === '"'gameover'"' && engineRef.current && (\
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-black/90 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">\
          <div className="text-[120px] mb-2 animate-pulse drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">☠️</div>\
          <h1 className="text-5xl md:text-7xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] mb-2 text-center uppercase">\
            {tx("KONIEC GRY")}\
          </h1>\
          <p className="text-lg md:text-xl mb-8 uppercase tracking-widest font-bold text-slate-400 text-center">\
            {tx("Eksperyment Zakończony Niepowodzeniem")}\
          </p>\
          <div className="flex flex-col gap-3 w-full max-w-[300px]">\
            {(() => {\
                const cost = 50 * ((engineRef.current.state.revivesUsed || 0) + 1);\
                const canAfford = engineRef.current.state.protons >= cost;\
                const canRevive = (engineRef.current.state.revivesUsed || 0) < 2;\
                \
                if (!canRevive) {\
                    return <div className="text-center text-slate-400 font-bold mb-4 bg-slate-900/50 py-3 rounded-xl border border-slate-700/50">{tx("Wykorzystano limit wskrzeszeń (2/2)")}</div>;\
                }\
                \
                return (\
                    <>\
                        <button \
                            disabled={!canAfford}\
' src/components/GameCanvas.tsx
