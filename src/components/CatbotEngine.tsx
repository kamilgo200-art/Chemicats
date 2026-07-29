import React from 'react';

export function CatbotEngine({ onExit }: { onExit: () => void }) {
  const specs = [
    {
      title: "🌌 KOTBOT (AI-9000)",
      desc: "Jedyny, samotny dron inżynieryjny obudzony po katastrofie statku na mroźnej, nieprzyjaznej planecie Rax. Zostaje zaprogramowany na przetrwanie za wszelką cenę."
    },
    {
      title: "🧱 ŚWIAT KWADRATÓW (FACTORIO & ALCHEMISTRY)",
      desc: "Nieskończony świat pełen rud (żelazo, krzem, złoto, ołów) w różnych stanach skupienia, ściśle zależnych od temperatury otoczenia."
    },
    {
      title: "⚡ SIEĆ ELEKTROENERGETYCZNA",
      desc: "Rzeczywiste obliczanie poboru i przegrzewania w Watach. Panele słoneczne (efekt Seebecka), piec CVD, turbiny parowe na węgiel i akumulatory wybuchające przy przeciążeniu."
    },
    {
      title: "🧬 BIOINŻYNIERIA (LAB RNA/DNA)",
      desc: "Kreacja roślin i organizmów od podstaw. Synteza mrozoodpornych nasion modyfikowanych ołowiem (Pb) oraz specjalnych biosfer chroniących Krowy-Symbionty."
    },
    {
      title: "☄️ KATAKLIZMY KOSMICZNE",
      desc: "Bezwzględne deszcze meteorów zagrażające bazie. Wymaga budowy Dział Orbitalnych prądożernych do obrony, podczas gdy meteoryty dostarczają rzadkich kosmicznych surowców."
    }
  ];

  return (
    <div className="absolute inset-0 bg-[#0A0000] text-[#ff003c] font-mono flex flex-col items-center justify-center z-[99999] overflow-hidden p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,60,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

      <div className="relative w-full max-w-4xl bg-black/85 border-2 border-[#ff003c]/40 rounded-2xl p-4 md:p-6 shadow-[0_0_50px_rgba(255,0,60,0.25)] flex flex-col md:flex-row gap-6 items-stretch max-h-[92vh] overflow-y-auto">
        
        {/* Left column: HUD and Cyber cat avatar */}
        <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-[#ff003c]/20 pb-4 md:pb-0 md:pr-6 shrink-0">
          <div className="w-32 h-32 md:w-44 md:h-44 relative animate-pulse" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,0,60,0.5)]" fill="none" stroke="#ff003c" strokeWidth="2">
              <path d="M 100 180 L 160 140 L 180 80 L 150 40 L 100 60 L 50 40 L 20 80 L 40 140 Z" fill="#050000" strokeWidth="3"/>
              <path d="M 50 40 L 30 10 L 80 50 Z" strokeWidth="2" fill="rgba(255,0,60,0.1)"/>
              <path d="M 40 25 L 60 40" strokeWidth="1"/>
              <path d="M 150 40 L 170 10 L 120 50 Z" strokeWidth="2" fill="rgba(255,0,60,0.1)"/>
              <path d="M 160 25 L 140 40" strokeWidth="1"/>
              <circle cx="100" cy="60" r="10" strokeDasharray="2 2"/>
              <circle cx="100" cy="60" r="4" fill="#ff003c"/>
              <path d="M 70 60 L 130 60" strokeDasharray="4 2"/>
              <path d="M 40 90 L 80 80 L 90 95 L 50 105 Z" fill="#fff" stroke="#fff" style={{ filter: 'drop-shadow(0 0 10px #ff003c)' }}/>
              <path d="M 160 90 L 120 80 L 110 95 L 150 105 Z" fill="#fff" stroke="#fff" style={{ filter: 'drop-shadow(0 0 10px #ff003c)' }}/>
              <path d="M 80 115 L 120 115 L 130 150 L 100 170 L 70 150 Z" fill="rgba(255,0,60,0.05)" />
              <path d="M 90 120 L 110 120 L 100 130 Z" fill="#ff003c"/>
              <line x1="100" y1="130" x2="100" y2="150" strokeWidth="2"/>
              <line x1="100" y1="150" x2="85" y2="160" strokeWidth="2"/>
              <line x1="100" y1="150" x2="115" y2="160" strokeWidth="2"/>
              <line x1="70" y1="120" x2="20" y2="110" strokeWidth="1.5" strokeDasharray="5 5"/>
              <line x1="75" y1="130" x2="15" y2="130" strokeWidth="1.5" strokeDasharray="8 4"/>
              <line x1="70" y1="140" x2="25" y2="150" strokeWidth="1.5" strokeDasharray="4 6"/>
              <line x1="130" y1="120" x2="180" y2="110" strokeWidth="1.5" strokeDasharray="5 5"/>
              <line x1="125" y1="130" x2="185" y2="130" strokeWidth="1.5" strokeDasharray="8 4"/>
              <line x1="130" y1="140" x2="175" y2="150" strokeWidth="1.5" strokeDasharray="4 6"/>
              <rect x="90" y="20" width="20" height="5" fill="#ff003c"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black mt-4 drop-shadow-[0_0_10px_#ff003c] text-center text-[#ff3a3a] tracking-widest uppercase">
            PROJEKT KOTBOT
          </h1>
          <div className="text-[10px] text-zinc-400 mt-2 text-center select-none">
             ARCHIWUM WYOBRAŹNI • STATUS: ARCHIV_LIVE
          </div>
        </div>

        {/* Right column: Specs list and Tribute */}
        <div className="flex flex-col flex-1 justify-between gap-4 overflow-y-auto pr-1">
          <div className="text-xs space-y-4">
            <div className="bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl p-3 text-red-100">
               <span className="font-bold text-[#ff5050] uppercase tracking-wider block mb-1">ℹ️ STATUS SYSTEMU</span>
               Wyłączyliśmy prototypowy, niedziałający silnik survivalowy z bazy kodu głównej gry alchemicznej ze względu na limity wydajnościowe przeglądarki. Wizja wielkiej gry inżynieryjno-strategicznej została utrwalona poniżej jako hołd!
            </div>

            <div className="border border-[#ff003c]/20 rounded-xl p-3 bg-black/60">
              <span className="font-extrabold text-[#ff4c4c] uppercase tracking-widest block mb-2 border-b border-[#ff003c]/20 pb-1">📂 DOKUMENTACJA PROJEKTOWA:</span>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {specs.map((item, index) => (
                  <div key={index} className="border-l-2 border-[#ff003c]/40 pl-3">
                    <span className="font-bold text-white text-[11px] block">{item.title}</span>
                    <p className="text-zinc-300 text-[10px] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10.5px] italic text-[#ff7777] leading-relaxed select-none">
              &quot;Dziękujemy za kosmiczną burzę mózgów! Zdecydowanie warto zrealizować Kotbota jako dedykowany i samodzielny symulator inżynieryjno-alchemiczny.&quot;
            </p>
          </div>

          <div className="pt-2 border-t border-[#ff003c]/20 flex justify-end">
            <button 
              onClick={onExit}
              className="border border-[#ff003c] text-[#ff003c] bg-[#ff003c]/10 hover:bg-[#ff003c] hover:text-black px-6 py-2 transition-all duration-300 uppercase font-black tracking-widest text-xs shadow-[0_0_15px_rgba(255,0,60,0.3)] rounded-full"
            >
              Wróć do Głównego Sektora
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
