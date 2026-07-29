import React from 'react';

export const ELEMENTS = [
    { z: 1, symbol: 'H', name: 'Wodór', group: 'nonmetal', unlockedSymbol: 'H' },
    { z: 2, symbol: 'He', name: 'Hel', group: 'noble', unlockedSymbol: 'He' },
    { z: 3, symbol: 'Li', name: 'Lit', group: 'alkali', unlockedSymbol: 'Li' },
    { z: 4, symbol: 'Be', name: 'Beryl', group: 'alkaline', unlockedSymbol: 'Be' },
    { z: 5, symbol: 'B', name: 'Bor', group: 'metalloid', unlockedSymbol: 'B' },
    { z: 6, symbol: 'C', name: 'Węgiel', group: 'nonmetal', unlockedSymbol: 'C' },
    { z: 7, symbol: 'N', name: 'Azot', group: 'nonmetal', unlockedSymbol: 'N' },
    { z: 8, symbol: 'O', name: 'Tlen', group: 'nonmetal', unlockedSymbol: 'O' },
    { z: 9, symbol: 'F', name: 'Fluor', group: 'halogen', unlockedSymbol: 'F' },
    { z: 10, symbol: 'Ne', name: 'Neon', group: 'noble', unlockedSymbol: 'Ne' },
    { z: 11, symbol: 'Na', name: 'Sód', group: 'alkali', unlockedSymbol: 'Na' },
    { z: 12, symbol: 'Mg', name: 'Magnez', group: 'alkaline', unlockedSymbol: 'Mg' },
    { z: 13, symbol: 'Al', name: 'Glin', group: 'metal', unlockedSymbol: 'Al' },
    { z: 14, symbol: 'Si', name: 'Krzem', group: 'metalloid', unlockedSymbol: 'Si' },
    { z: 15, symbol: 'P', name: 'Fosfor', group: 'nonmetal', unlockedSymbol: 'P' },
    { z: 16, symbol: 'S', name: 'Siarka', group: 'nonmetal', unlockedSymbol: 'S' },
    { z: 17, symbol: 'Cl', name: 'Chlor', group: 'halogen', unlockedSymbol: 'Cl' },
    { z: 18, symbol: 'Ar', name: 'Argon', group: 'noble' },
    { z: 19, symbol: 'K', name: 'Potas', group: 'alkali', unlockedSymbol: 'K' },
    { z: 20, symbol: 'Ca', name: 'Wapń', group: 'alkaline', unlockedSymbol: 'Ca' },
    { z: 21, symbol: 'Sc', name: 'Skand', group: 'transition' },
    { z: 22, symbol: 'Ti', name: 'Tytan', group: 'transition' },
    { z: 23, symbol: 'V', name: 'Wanad', group: 'transition' },
    { z: 24, symbol: 'Cr', name: 'Chrom', group: 'transition' },
    { z: 25, symbol: 'Mn', name: 'Mangan', group: 'transition' },
    { z: 26, symbol: 'Fe', name: 'Żelazo', group: 'transition', unlockedSymbol: 'Fe' },
    { z: 27, symbol: 'Co', name: 'Kobalt', group: 'transition' },
    { z: 28, symbol: 'Ni', name: 'Nikiel', group: 'transition' },
    { z: 29, symbol: 'Cu', name: 'Miedź', group: 'transition' },
    { z: 30, symbol: 'Zn', name: 'Cynk', group: 'transition' },
    { z: 31, symbol: 'Ga', name: 'Gal', group: 'metal' },
    { z: 32, symbol: 'Ge', name: 'German', group: 'metalloid' },
    { z: 33, symbol: 'As', name: 'Arsen', group: 'metalloid' },
    { z: 34, symbol: 'Se', name: 'Selen', group: 'nonmetal' },
    { z: 35, symbol: 'Br', name: 'Brom', group: 'halogen' },
    { z: 36, symbol: 'Kr', name: 'Krypton', group: 'noble' },
    { z: 37, symbol: 'Rb', name: 'Rubid', group: 'alkali' },
    { z: 38, symbol: 'Sr', name: 'Stront', group: 'alkaline' },
    { z: 39, symbol: 'Y', name: 'Itr', group: 'transition' },
    { z: 40, symbol: 'Zr', name: 'Cyrkon', group: 'transition' },
    { z: 41, symbol: 'Nb', name: 'Niob', group: 'transition' },
    { z: 42, symbol: 'Mo', name: 'Molibden', group: 'transition' },
    { z: 43, symbol: 'Tc', name: 'Technet', group: 'transition' },
    { z: 44, symbol: 'Ru', name: 'Ruten', group: 'transition' },
    { z: 45, symbol: 'Rh', name: 'Rod', group: 'transition' },
    { z: 46, symbol: 'Pd', name: 'Pallad', group: 'transition' },
    { z: 47, symbol: 'Ag', name: 'Srebro', group: 'transition' },
    { z: 48, symbol: 'Cd', name: 'Kadm', group: 'transition' },
    { z: 49, symbol: 'In', name: 'Ind', group: 'metal' },
    { z: 50, symbol: 'Sn', name: 'Cyna', group: 'metal' },
    { z: 51, symbol: 'Sb', name: 'Antymon', group: 'metalloid' },
    { z: 52, symbol: 'Te', name: 'Tellur', group: 'metalloid' },
    { z: 53, symbol: 'I', name: 'Jod', group: 'halogen' },
    { z: 54, symbol: 'Xe', name: 'Ksenon', group: 'noble' },
    { z: 55, symbol: 'Cs', name: 'Cez', group: 'alkali' },
    { z: 56, symbol: 'Ba', name: 'Bar', group: 'alkaline' },
    { z: 57, symbol: 'La', name: 'Lantan', group: 'lanthanide' },
    { z: 58, symbol: 'Ce', name: 'Cer', group: 'lanthanide' },
    { z: 59, symbol: 'Pr', name: 'Prazeodym', group: 'lanthanide' },
    { z: 60, symbol: 'Nd', name: 'Neodym', group: 'lanthanide' },
    { z: 61, symbol: 'Pm', name: 'Promet', group: 'lanthanide' },
    { z: 62, symbol: 'Sm', name: 'Samar', group: 'lanthanide' },
    { z: 63, symbol: 'Eu', name: 'Europ', group: 'lanthanide' },
    { z: 64, symbol: 'Gd', name: 'Gadolin', group: 'lanthanide' },
    { z: 65, symbol: 'Tb', name: 'Terb', group: 'lanthanide' },
    { z: 66, symbol: 'Dy', name: 'Dysproz', group: 'lanthanide' },
    { z: 67, symbol: 'Ho', name: 'Holm', group: 'lanthanide' },
    { z: 68, symbol: 'Er', name: 'Erb', group: 'lanthanide' },
    { z: 69, symbol: 'Tm', name: 'Tul', group: 'lanthanide' },
    { z: 70, symbol: 'Yb', name: 'Iterb', group: 'lanthanide' },
    { z: 71, symbol: 'Lu', name: 'Lutet', group: 'lanthanide' },
    { z: 72, symbol: 'Hf', name: 'Hafn', group: 'transition' },
    { z: 73, symbol: 'Ta', name: 'Tantal', group: 'transition' },
    { z: 74, symbol: 'W', name: 'Wolfram', group: 'transition' },
    { z: 75, symbol: 'Re', name: 'Ren', group: 'transition' },
    { z: 76, symbol: 'Os', name: 'Osm', group: 'transition' },
    { z: 77, symbol: 'Ir', name: 'Iryd', group: 'transition' },
    { z: 78, symbol: 'Pt', name: 'Platyna', group: 'transition' },
    { z: 79, symbol: 'Au', name: 'Złoto', group: 'transition' },
    { z: 80, symbol: 'Hg', name: 'Rtęć', group: 'transition' },
    { z: 81, symbol: 'Tl', name: 'Tal', group: 'metal' },
    { z: 82, symbol: 'Pb', name: 'Ołów', group: 'metal' },
    { z: 83, symbol: 'Bi', name: 'Bizmut', group: 'metal' },
    { z: 84, symbol: 'Po', name: 'Polon', group: 'metalloid', unlockedSymbol: 'Po' },
    { z: 85, symbol: 'At', name: 'Astat', group: 'halogen' },
    { z: 86, symbol: 'Rn', name: 'Radon', group: 'noble' },
    { z: 87, symbol: 'Fr', name: 'Frans', group: 'alkali' },
    { z: 88, symbol: 'Ra', name: 'Rad', group: 'alkaline', unlockedSymbol: 'Ra' },
    { z: 89, symbol: 'Ac', name: 'Aktyn', group: 'actinide' },
    { z: 90, symbol: 'Th', name: 'Tor', group: 'actinide' },
    { z: 91, symbol: 'Pa', name: 'Protaktyn', group: 'actinide' },
    { z: 92, symbol: 'U', name: 'Uran', group: 'actinide' },
    { z: 93, symbol: 'Np', name: 'Neptun', group: 'actinide' },
    { z: 94, symbol: 'Pu', name: 'Pluton', group: 'actinide' },
    { z: 95, symbol: 'Am', name: 'Ameryk', group: 'actinide' },
    { z: 96, symbol: 'Cm', name: 'Kiur', group: 'actinide' },
    { z: 97, symbol: 'Bk', name: 'Berkel', group: 'actinide' },
    { z: 98, symbol: 'Cf', name: 'Kaliforn', group: 'actinide' },
    { z: 99, symbol: 'Es', name: 'Ainsztajn', group: 'actinide' },
    { z: 100, symbol: 'Fm', name: 'Ferm', group: 'actinide' },
    { z: 101, symbol: 'Md', name: 'Mendelew', group: 'actinide' },
    { z: 102, symbol: 'No', name: 'Nobel', group: 'actinide' },
    { z: 103, symbol: 'Lr', name: 'Lorens', group: 'actinide' },
    { z: 104, symbol: 'Rf', name: 'Rutherford', group: 'transition' },
    { z: 105, symbol: 'Db', name: 'Dubn', group: 'transition' },
    { z: 106, symbol: 'Sg', name: 'Seaborg', group: 'transition' },
    { z: 107, symbol: 'Bh', name: 'Bohr', group: 'transition' },
    { z: 108, symbol: 'Hs', name: 'Has', group: 'transition' },
    { z: 109, symbol: 'Mt', name: 'Meitner', group: 'transition' },
    { z: 110, symbol: 'Ds', name: 'Darmsztadt', group: 'transition' },
    { z: 111, symbol: 'Rg', name: 'Roentgen', group: 'transition' },
    { z: 112, symbol: 'Cn', name: 'Kopernik', group: 'transition' },
    { z: 113, symbol: 'Nh', name: 'Nihon', group: 'metal' },
    { z: 114, symbol: 'Fl', name: 'Flerow', group: 'metal' },
    { z: 115, symbol: 'Mc', name: 'Moskow', group: 'metal' },
    { z: 116, symbol: 'Lv', name: 'Liwermor', group: 'metal' },
    { z: 117, symbol: 'Ts', name: 'Tenes', group: 'halogen' },
    { z: 118, symbol: 'Og', name: 'Oganeson', group: 'noble' }
];

function getGridPosition(z: number) {
    if (z === 1) return { c: 1, r: 1 };
    if (z === 2) return { c: 18, r: 1 };
    if (z >= 3 && z <= 4) return { c: z - 2, r: 2 };
    if (z >= 5 && z <= 10) return { c: z + 8, r: 2 };
    if (z >= 11 && z <= 12) return { c: z - 10, r: 3 };
    if (z >= 13 && z <= 18) return { c: z + 0, r: 3 };
    if (z >= 19 && z <= 36) return { c: z - 18, r: 4 };
    if (z >= 37 && z <= 54) return { c: z - 36, r: 5 };
    if (z >= 55 && z <= 56) return { c: z - 54, r: 6 };
    if (z >= 57 && z <= 71) return { c: z - 57 + 4, r: 9 }; // Lanthanides
    if (z >= 72 && z <= 86) return { c: z - 72 + 4, r: 6 };
    if (z >= 87 && z <= 88) return { c: z - 86, r: 7 };
    if (z >= 89 && z <= 103) return { c: z - 89 + 4, r: 10 }; // Actinides
    if (z >= 104 && z <= 118) return { c: z - 104 + 4, r: 7 };
    // Post-Oganesson elements
    if (z >= 119 && z <= 120) return { c: z - 118, r: 8 };
    if (z >= 121 && z <= 137) return { c: z - 121 + 2, r: 11 }; 
    return { c: 1, r: 1 };
}

export const PERIODIC_TABLE = Array.from({ length: 137 }).map((_, i) => {
    const z = i + 1;
    const known = ELEMENTS.find(e => e.z === z);
    const pos = getGridPosition(z);
    if (known) return { ...known, pos };
    return { z, symbol: '?', name: 'Nieznany Pierwiastek', group: 'unknown', pos };
});

export const GROUP_COLORS: Record<string, string> = {
    nonmetal: '#10b981',
    noble: '#3b82f6',
    alkali: '#f59e0b',
    alkaline: '#fcd34d',
    metalloid: '#14b8a6',
    halogen: '#06b6d4',
    metal: '#a8a29e',
    transition: '#ec4899',
    lanthanide: '#8b5cf6',
    actinide: '#d946ef',
    unknown: '#334155'
};

export const GROUP_NAMES: Record<string, string> = {
    nonmetal: 'Niemetale',
    noble: 'Gazy szlachetne',
    alkali: 'Metale alkaliczne',
    alkaline: 'Metale ziem alkalicznych',
    metalloid: 'Półmetale',
    halogen: 'Halogeny',
    metal: 'Metale',
    transition: 'Metale przejściowe',
    lanthanide: 'Lantanowce',
    actinide: 'Aktynowce',
    unknown: 'Nieznane grupy (g > 118)'
};

export const PeriodicTable = ({ 
    unlockedAtoms,
    isMenuMode = false,
    onSelectAtom 
}: { 
    unlockedAtoms: string[],
    isMenuMode?: boolean,
    onSelectAtom: (z: number) => void
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1);
    const touchStartDistRef = React.useRef<number | null>(null);
    const initialScaleRef = React.useRef<number>(1);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistRef.current = Math.sqrt(dx*dx + dy*dy);
            initialScaleRef.current = scale;
        } else {
            touchStartDistRef.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistRef.current !== null) {
            e.preventDefault(); // Prevent scrolling while zooming
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            let newScale = initialScaleRef.current * (dist / touchStartDistRef.current);
            newScale = Math.min(Math.max(0.3, 3), newScale);
            setScale(newScale);
        }
    };

    React.useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] p-1 md:p-4 text-white overflow-y-auto w-full">
            
            <div 
                className="w-full h-full overflow-auto pb-8 scroll-smooth flex justify-center" 
                ref={scrollContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                <div 
                    className="grid gap-[2px] w-max mx-auto" 
                    style={{ 
                        gridTemplateColumns: `repeat(18, ${48 * scale}px)`, 
                        gridTemplateRows: `repeat(11, ${64 * scale}px)` 
                    }}
                >
                    {PERIODIC_TABLE.map(el => {
                        const isKnown = el.group !== 'unknown';
                        const color = GROUP_COLORS[el.group] || '#334155';
                        const isInGame = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Ra', 'Po', ...(isMenuMode ? [] : unlockedAtoms)].includes(el.symbol);
                        const isUnlocked = isMenuMode ? ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Ra', 'Po'].includes(el.symbol) : unlockedAtoms.includes(el.symbol);
                        
                        return (
                            <button
                                key={el.z}
                                onClick={() => isInGame ? onSelectAtom(el.z) : null}
                                className={`w-full h-full flex flex-col items-center justify-center rounded border transition-all group relative ${isInGame ? 'hover:scale-110 hover:z-10 cursor-pointer shadow-sm shadow-black/50' : 'cursor-default'}`}
                                style={{ 
                                    gridColumn: el.pos.c,
                                    gridRow: el.pos.r,
                                    borderColor: isInGame ? (isUnlocked ? color : '#cbd5e1') : '#1e293b',
                                    backgroundColor: isInGame ? (isUnlocked ? `${color}40` : '#334155') : '#050505',
                                    boxShadow: isUnlocked ? `0 0 10px ${color}80` : (isInGame ? `inset 0 0 10px rgba(255,255,255,0.2)` : 'none')
                                }}
                            >
                                <span 
                                    className={`absolute top-0.5 left-1 font-mono ${isInGame ? (isUnlocked ? 'text-slate-200' : 'text-slate-400') : 'text-slate-800'}`}
                                    style={{ fontSize: `${12 * scale}px` }}
                                >
                                    {el.z}
                                </span>
                                {isUnlocked && <span className="absolute top-1 right-1 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]" style={{ width: `${6 * scale}px`, height: `${6 * scale}px` }}></span>}
                                <span 
                                    className="font-bold" 
                                    style={{ 
                                        color: isInGame ? (isUnlocked ? '#ffffff' : '#f8fafc') : '#1e293b', 
                                        textShadow: isUnlocked ? `0 0 8px ${color}` : (isInGame ? '0 0 5px rgba(255,255,255,0.5)' : 'none'),
                                        fontSize: `${18 * scale}px`
                                    }}
                                >
                                    {el.symbol}
                                </span>
                                
                                {/* Tooltip on hover */}
                                {isKnown && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1.5 bg-black/95 border border-slate-600 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity">
                                        <div className="font-bold text-white text-sm">{el.name}</div>
                                        <div className="text-slate-300">Z = {el.z} • {GROUP_NAMES[el.group] || el.group}</div>
                                        {isUnlocked ? <div className="text-green-400 mt-1 font-bold text-[10px]">DOSTĘPNY W TRYBIE BITEWNYM</div> : (isInGame ? <div className="text-amber-500 mt-1 font-bold text-[10px]">CZEKA NA ODBLOKOWANIE</div> : <div className="text-slate-500 mt-1 font-bold text-[10px]">NIEDOSTĘPNY W GRZE</div>)}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="mt-4 flex flex-col items-center gap-2">
                <button 
                    onClick={() => {
                        const el = document.getElementById('legend-container');
                        if (el) el.classList.toggle('hidden');
                    }}
                    className="sm:hidden bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] border border-slate-600 mb-2 active:bg-slate-700"
                >
                    Pokaż/Ukryj Legendę
                </button>
                <div id="legend-container" className="hidden sm:flex flex-wrap gap-2 justify-center text-[8px] sm:text-[10px] px-2 max-h-32 overflow-y-auto">
                    {Object.entries(GROUP_COLORS).map(([group, color]) => (
                        <div key={group} className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-700/50">
                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                            <span className="capitalize text-slate-300 truncate">{GROUP_NAMES[group] || group}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
