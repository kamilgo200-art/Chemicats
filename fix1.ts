import * as fs from 'fs';

let file = fs.readFileSync('src/components/PeriodicTable.tsx', 'utf8');

// We will inject pinch-to-zoom logic

file = file.replace(/export const PeriodicTable = \(\{[\s\S]*?\}\) => \{[\s\S]*?const scrollContainerRef = React\.useRef<HTMLDivElement>\(null\);/m, 
`export const PeriodicTable = ({ 
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
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            let newScale = initialScaleRef.current * (dist / touchStartDistRef.current);
            newScale = Math.min(Math.max(0.3, newScale), 3);
            setScale(newScale);
        }
    };
`);

file = file.replace(/className="w-full overflow-x-auto pb-8 scroll-smooth"/, 
`className="w-full h-full overflow-auto pb-8 scroll-smooth" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}`);

file = file.replace(/style={{ gridTemplateColumns: 'repeat\\(18, minmax\\(40px, 48px\\)\\)', gridTemplateRows: 'repeat\\(11, minmax\\(56px, 64px\\)\\)' }}/,
`style={{ gridTemplateColumns: \\\`repeat(18, \\\${48 * scale}px)\\\`, gridTemplateRows: \\\`repeat(11, \\\${64 * scale}px)\\\` }}`);

fs.writeFileSync('src/components/PeriodicTable.tsx', file);
console.log('PeriodicTable fixed!');
