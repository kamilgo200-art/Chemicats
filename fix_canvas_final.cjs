const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const badChunk = `            </div>
        </div>
                                              <button onClick={() => setSelectedReactionDetails(null)} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded text-white font-bold">{tx("Wróć")}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}`;

code = code.replace(badChunk, `            </div>
        </div>
      )}`);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
