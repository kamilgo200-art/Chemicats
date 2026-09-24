sed -i '5230,5285c\
                        {selectedReactionDetails && (\
                            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">\
                                <div className="bg-slate-900 border border-fuchsia-500/50 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(217,70,239,0.2)]">\
                                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-fuchsia-950/20">\
                                        <h3 className="text-xl font-bold text-white flex gap-2 items-center">\
                                            {tx("Szczegóły Wiązania")}\
                                        </h3>\
                                        <button onClick={() => setSelectedReactionDetails(null)} className="text-slate-400 hover:text-white text-xl">✖</button>\
                                    </div>\
                                    <div className="p-6 flex flex-col md:flex-row gap-6">\
                                        <div className="shrink-0 flex items-center justify-center bg-black/50 border border-slate-700 rounded-xl p-4 w-full md:w-auto min-w-[200px]">\
                                            <MoleculeGraphic atoms={REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.atoms || []} size="lg" />\
                                        </div>\
                                        <div className="flex flex-col gap-4 w-full">\
                                            <div>\
                                                <h4 className="text-2xl font-black text-white">{tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.name || "")}</h4>\
                                                <div className="text-yellow-500 font-mono text-sm font-bold">{REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.eq}</div>\
                                            </div>\
                                            <div className="bg-fuchsia-900/20 border border-fuchsia-500/20 rounded-lg p-3 text-sm text-fuchsia-100">\
                                                <span className="font-bold text-fuchsia-300 block mb-1">{tx("Działanie (Superbroń):")}</span>\
                                                {tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.desc || "")}\
                                            </div>\
                                            {REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.funFact && (\
                                                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-100">\
                                                    <span className="font-bold text-blue-300 block mb-1">{tx("Ciekawostka IRL:")}</span>\
                                                    {tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.funFact || "")}\
                                                </div>\
                                            )}\
                                            <div className="mt-auto pt-4 flex justify-end">\
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
' src/components/GameCanvas.tsx
