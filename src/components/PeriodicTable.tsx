import React from 'react';

export const ELEMENTS = [
    { z: 1, symbol: 'H', name: 'Wodór', enName: 'Hydrogen', group: 'nonmetal', unlockedSymbol: 'H' },
    { z: 2, symbol: 'He', name: 'Hel', enName: 'Helium', group: 'noble', unlockedSymbol: 'He' },
    { z: 3, symbol: 'Li', name: 'Lit', enName: 'Lithium', group: 'alkali', unlockedSymbol: 'Li' },
    { z: 4, symbol: 'Be', name: 'Beryl', enName: 'Beryllium', group: 'alkaline', unlockedSymbol: 'Be' },
    { z: 5, symbol: 'B', name: 'Bor', enName: 'Boron', group: 'metalloid', unlockedSymbol: 'B' },
    { z: 6, symbol: 'C', name: 'Węgiel', enName: 'Carbon', group: 'nonmetal', unlockedSymbol: 'C' },
    { z: 7, symbol: 'N', name: 'Azot', enName: 'Nitrogen', group: 'nonmetal', unlockedSymbol: 'N' },
    { z: 8, symbol: 'O', name: 'Tlen', enName: 'Oxygen', group: 'nonmetal', unlockedSymbol: 'O' },
    { z: 9, symbol: 'F', name: 'Fluor', enName: 'Fluorine', group: 'halogen', unlockedSymbol: 'F' },
    { z: 10, symbol: 'Ne', name: 'Neon', enName: 'Neon', group: 'noble', unlockedSymbol: 'Ne' },
    { z: 11, symbol: 'Na', name: 'Sód', enName: 'Sodium', group: 'alkali', unlockedSymbol: 'Na' },
    { z: 12, symbol: 'Mg', name: 'Magnez', enName: 'Magnesium', group: 'alkaline', unlockedSymbol: 'Mg' },
    { z: 13, symbol: 'Al', name: 'Glin', enName: 'Aluminum', group: 'metal', unlockedSymbol: 'Al' },
    { z: 14, symbol: 'Si', name: 'Krzem', enName: 'Silicon', group: 'metalloid', unlockedSymbol: 'Si' },
    { z: 15, symbol: 'P', name: 'Fosfor', enName: 'Phosphorus', group: 'nonmetal', unlockedSymbol: 'P' },
    { z: 16, symbol: 'S', name: 'Siarka', enName: 'Sulfur', group: 'nonmetal', unlockedSymbol: 'S' },
    { z: 17, symbol: 'Cl', name: 'Chlor', enName: 'Chlorine', group: 'halogen', unlockedSymbol: 'Cl' },
    { z: 18, symbol: 'Ar', name: 'Argon', enName: 'Argon', group: 'noble' },
    { z: 19, symbol: 'K', name: 'Potas', enName: 'Potassium', group: 'alkali', unlockedSymbol: 'K' },
    { z: 20, symbol: 'Ca', name: 'Wapń', enName: 'Calcium', group: 'alkaline', unlockedSymbol: 'Ca' },
    { z: 21, symbol: 'Sc', name: 'Skand', enName: 'Scandium', group: 'transition' },
    { z: 22, symbol: 'Ti', name: 'Tytan', enName: 'Titanium', group: 'transition' },
    { z: 23, symbol: 'V', name: 'Wanad', enName: 'Vanadium', group: 'transition' },
    { z: 24, symbol: 'Cr', name: 'Chrom', enName: 'Chromium', group: 'transition' },
    { z: 25, symbol: 'Mn', name: 'Mangan', enName: 'Manganese', group: 'transition' },
    { z: 26, symbol: 'Fe', name: 'Żelazo', enName: 'Iron', group: 'transition', unlockedSymbol: 'Fe' },
    { z: 27, symbol: 'Co', name: 'Kobalt', enName: 'Cobalt', group: 'transition' },
    { z: 28, symbol: 'Ni', name: 'Nikiel', enName: 'Nickel', group: 'transition' },
    { z: 29, symbol: 'Cu', name: 'Miedź', enName: 'Copper', group: 'transition' },
    { z: 30, symbol: 'Zn', name: 'Cynk', enName: 'Zinc', group: 'transition' },
    { z: 31, symbol: 'Ga', name: 'Gal', enName: 'Gallium', group: 'metal' },
    { z: 32, symbol: 'Ge', name: 'German', enName: 'Germanium', group: 'metalloid' },
    { z: 33, symbol: 'As', name: 'Arsen', enName: 'Arsenic', group: 'metalloid' },
    { z: 34, symbol: 'Se', name: 'Selen', enName: 'Selenium', group: 'nonmetal' },
    { z: 35, symbol: 'Br', name: 'Brom', enName: 'Bromine', group: 'halogen' },
    { z: 36, symbol: 'Kr', name: 'Krypton', enName: 'Krypton', group: 'noble' },
    { z: 37, symbol: 'Rb', name: 'Rubid', enName: 'Rubidium', group: 'alkali' },
    { z: 38, symbol: 'Sr', name: 'Stront', enName: 'Strontium', group: 'alkaline' },
    { z: 39, symbol: 'Y', name: 'Itr', enName: 'Yttrium', group: 'transition' },
    { z: 40, symbol: 'Zr', name: 'Cyrkon', enName: 'Zirconium', group: 'transition' },
    { z: 41, symbol: 'Nb', name: 'Niob', enName: 'Niobium', group: 'transition' },
    { z: 42, symbol: 'Mo', name: 'Molibden', enName: 'Molybdenum', group: 'transition' },
    { z: 43, symbol: 'Tc', name: 'Technet', enName: 'Technetium', group: 'transition' },
    { z: 44, symbol: 'Ru', name: 'Ruten', enName: 'Ruthenium', group: 'transition' },
    { z: 45, symbol: 'Rh', name: 'Rod', enName: 'Rhodium', group: 'transition' },
    { z: 46, symbol: 'Pd', name: 'Pallad', enName: 'Palladium', group: 'transition' },
    { z: 47, symbol: 'Ag', name: 'Srebro', enName: 'Silver', group: 'transition' },
    { z: 48, symbol: 'Cd', name: 'Kadm', enName: 'Cadmium', group: 'transition' },
    { z: 49, symbol: 'In', name: 'Ind', enName: 'Indium', group: 'metal' },
    { z: 50, symbol: 'Sn', name: 'Cyna', enName: 'Tin', group: 'metal' },
    { z: 51, symbol: 'Sb', name: 'Antymon', enName: 'Antimony', group: 'metalloid' },
    { z: 52, symbol: 'Te', name: 'Tellur', enName: 'Tellurium', group: 'metalloid' },
    { z: 53, symbol: 'I', name: 'Jod', enName: 'Iodine', group: 'halogen' },
    { z: 54, symbol: 'Xe', name: 'Ksenon', enName: 'Xenon', group: 'noble' },
    { z: 55, symbol: 'Cs', name: 'Cez', enName: 'Cesium', group: 'alkali' },
    { z: 56, symbol: 'Ba', name: 'Bar', enName: 'Barium', group: 'alkaline' },
    { z: 57, symbol: 'La', name: 'Lantan', enName: 'Lanthanum', group: 'lanthanide' },
    { z: 58, symbol: 'Ce', name: 'Cer', enName: 'Cerium', group: 'lanthanide' },
    { z: 59, symbol: 'Pr', name: 'Prazeodym', enName: 'Praseodymium', group: 'lanthanide' },
    { z: 60, symbol: 'Nd', name: 'Neodym', enName: 'Neodymium', group: 'lanthanide' },
    { z: 61, symbol: 'Pm', name: 'Promet', enName: 'Promethium', group: 'lanthanide' },
    { z: 62, symbol: 'Sm', name: 'Samar', enName: 'Samarium', group: 'lanthanide' },
    { z: 63, symbol: 'Eu', name: 'Europ', enName: 'Europium', group: 'lanthanide' },
    { z: 64, symbol: 'Gd', name: 'Gadolin', enName: 'Gadolinium', group: 'lanthanide' },
    { z: 65, symbol: 'Tb', name: 'Terb', enName: 'Terbium', group: 'lanthanide' },
    { z: 66, symbol: 'Dy', name: 'Dysproz', enName: 'Dysprosium', group: 'lanthanide' },
    { z: 67, symbol: 'Ho', name: 'Holm', enName: 'Holmium', group: 'lanthanide' },
    { z: 68, symbol: 'Er', name: 'Erb', enName: 'Erbium', group: 'lanthanide' },
    { z: 69, symbol: 'Tm', name: 'Tul', enName: 'Thulium', group: 'lanthanide' },
    { z: 70, symbol: 'Yb', name: 'Iterb', enName: 'Ytterbium', group: 'lanthanide' },
    { z: 71, symbol: 'Lu', name: 'Lutet', enName: 'Lutetium', group: 'lanthanide' },
    { z: 72, symbol: 'Hf', name: 'Hafn', enName: 'Hafnium', group: 'transition' },
    { z: 73, symbol: 'Ta', name: 'Tantal', enName: 'Tantalum', group: 'transition' },
    { z: 74, symbol: 'W', name: 'Wolfram', enName: 'Tungsten', group: 'transition' },
    { z: 75, symbol: 'Re', name: 'Ren', enName: 'Rhenium', group: 'transition' },
    { z: 76, symbol: 'Os', name: 'Osm', enName: 'Osmium', group: 'transition' },
    { z: 77, symbol: 'Ir', name: 'Iryd', enName: 'Iridium', group: 'transition' },
    { z: 78, symbol: 'Pt', name: 'Platyna', enName: 'Platinum', group: 'transition' },
    { z: 79, symbol: 'Au', name: 'Złoto', enName: 'Gold', group: 'transition' },
    { z: 80, symbol: 'Hg', name: 'Rtęć', enName: 'Mercury', group: 'transition' },
    { z: 81, symbol: 'Tl', name: 'Tal', enName: 'Thallium', group: 'metal' },
    { z: 82, symbol: 'Pb', name: 'Ołów', enName: 'Lead', group: 'metal' },
    { z: 83, symbol: 'Bi', name: 'Bizmut', enName: 'Bismuth', group: 'metal' },
    { z: 84, symbol: 'Po', name: 'Polon', enName: 'Polonium', group: 'metalloid', unlockedSymbol: 'Po' },
    { z: 85, symbol: 'At', name: 'Astat', enName: 'Astatine', group: 'halogen' },
    { z: 86, symbol: 'Rn', name: 'Radon', enName: 'Radon', group: 'noble' },
    { z: 87, symbol: 'Fr', name: 'Frans', enName: 'Francium', group: 'alkali' },
    { z: 88, symbol: 'Ra', name: 'Rad', enName: 'Radium', group: 'alkaline', unlockedSymbol: 'Ra' },
    { z: 89, symbol: 'Ac', name: 'Aktyn', enName: 'Actinium', group: 'actinide' },
    { z: 90, symbol: 'Th', name: 'Tor', enName: 'Thorium', group: 'actinide' },
    { z: 91, symbol: 'Pa', name: 'Protaktyn', enName: 'Protactinium', group: 'actinide' },
    { z: 92, symbol: 'U', name: 'Uran', enName: 'Uranium', group: 'actinide' },
    { z: 93, symbol: 'Np', name: 'Neptun', enName: 'Neptunium', group: 'actinide' },
    { z: 94, symbol: 'Pu', name: 'Pluton', enName: 'Plutonium', group: 'actinide' },
    { z: 95, symbol: 'Am', name: 'Ameryk', enName: 'Americium', group: 'actinide' },
    { z: 96, symbol: 'Cm', name: 'Kiur', enName: 'Curium', group: 'actinide' },
    { z: 97, symbol: 'Bk', name: 'Berkel', enName: 'Berkelium', group: 'actinide' },
    { z: 98, symbol: 'Cf', name: 'Kaliforn', enName: 'Californium', group: 'actinide' },
    { z: 99, symbol: 'Es', name: 'Ainsztajn', enName: 'Einsteinium', group: 'actinide' },
    { z: 100, symbol: 'Fm', name: 'Ferm', enName: 'Fermium', group: 'actinide' },
    { z: 101, symbol: 'Md', name: 'Mendelew', enName: 'Mendelevium', group: 'actinide' },
    { z: 102, symbol: 'No', name: 'Nobel', enName: 'Nobelium', group: 'actinide' },
    { z: 103, symbol: 'Lr', name: 'Lorens', enName: 'Lawrencium', group: 'actinide' },
    { z: 104, symbol: 'Rf', name: 'Rutherford', enName: 'Rutherfordium', group: 'transition' },
    { z: 105, symbol: 'Db', name: 'Dubn', enName: 'Dubnium', group: 'transition' },
    { z: 106, symbol: 'Sg', name: 'Seaborg', enName: 'Seaborgium', group: 'transition' },
    { z: 107, symbol: 'Bh', name: 'Bohr', enName: 'Bohrium', group: 'transition' },
    { z: 108, symbol: 'Hs', name: 'Has', enName: 'Hassium', group: 'transition' },
    { z: 109, symbol: 'Mt', name: 'Meitner', enName: 'Meitnerium', group: 'transition' },
    { z: 110, symbol: 'Ds', name: 'Darmsztadt', enName: 'Darmstadtium', group: 'transition' },
    { z: 111, symbol: 'Rg', name: 'Roentgen', enName: 'Roentgenium', group: 'transition' },
    { z: 112, symbol: 'Cn', name: 'Kopernik', enName: 'Copernicium', group: 'transition' },
    { z: 113, symbol: 'Nh', name: 'Nihon', enName: 'Nihonium', group: 'metal' },
    { z: 114, symbol: 'Fl', name: 'Flerow', enName: 'Flerovium', group: 'metal' },
    { z: 115, symbol: 'Mc', name: 'Moskow', enName: 'Moscovium', group: 'metal' },
    { z: 116, symbol: 'Lv', name: 'Liwermor', enName: 'Livermorium', group: 'metal' },
    { z: 117, symbol: 'Ts', name: 'Tenes', enName: 'Tennessine', group: 'halogen' },
    { z: 118, symbol: 'Og', name: 'Oganeson', enName: 'Oganesson', group: 'noble' }
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

export const GROUP_NAMES: Record<string, any> = {
    nonmetal: { pl: 'Niemetale', en: 'Nonmetals' },
    noble: { pl: 'Gazy szlachetne', en: 'Noble Gases' },
    alkali: { pl: 'Metale alkaliczne', en: 'Alkali Metals' },
    alkaline: { pl: 'Metale ziem alkalicznych', en: 'Alkaline Earth Metals' },
    metalloid: { pl: 'Półmetale', en: 'Metalloids' },
    halogen: { pl: 'Halogeny', en: 'Halogens' },
    metal: { pl: 'Metale', en: 'Post-transition Metals' },
    transition: { pl: 'Metale przejściowe', en: 'Transition Metals' },
    lanthanide: { pl: 'Lantanowce', en: 'Lanthanides' },
    actinide: { pl: 'Aktynowce', en: 'Actinides' },
    unknown: { pl: 'Nieznane grupy (g > 118)', en: 'Unknown groups' }
};

export const PeriodicTable = ({ 
    unlockedAtoms,
    isMenuMode = false,
    language = 'pl',
    onSelectAtom 
}: { 
    unlockedAtoms: string[],
    isMenuMode?: boolean,
    language?: 'pl' | 'en',
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
                                        <div className="font-bold text-white text-sm">{language === 'en' && (el as any).enName ? (el as any).enName : el.name}</div>
                                        <div className="text-slate-300">Z = {el.z} • {GROUP_NAMES[el.group]?.[language] || el.group}</div>
                                        {isUnlocked ? <div className="text-green-400 mt-1 font-bold text-[10px]">{language === 'en' ? 'AVAILABLE IN BATTLE' : 'DOSTĘPNY W TRYBIE BITEWNYM'}</div> : (isInGame ? <div className="text-amber-500 mt-1 font-bold text-[10px]">{language === 'en' ? 'WAITING TO UNLOCK' : 'CZEKA NA ODBLOKOWANIE'}</div> : <div className="text-slate-500 mt-1 font-bold text-[10px]">{language === 'en' ? 'UNAVAILABLE IN GAME' : 'NIEDOSTĘPNY W GRZE'}</div>)}
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
                    {language === 'en' ? 'Show/Hide Legend' : 'Pokaż/Ukryj Legendę'}
                </button>
                <div id="legend-container" className="hidden sm:flex flex-wrap gap-2 justify-center text-[8px] sm:text-[10px] px-2 max-h-32 overflow-y-auto">
                    {Object.entries(GROUP_COLORS).map(([group, color]) => (
                        <div key={group} className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-700/50">
                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                            <span className="capitalize text-slate-300 truncate">{GROUP_NAMES[group]?.[language] || group}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
