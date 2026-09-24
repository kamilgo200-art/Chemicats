import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/      \{showingPeriodicTable && \(\n        <div className="absolute inset-0 z-\[150\] flex flex-col bg-\[#0a0a0f\] text-slate-100">/,
`      {showingPeriodicTable && (
        <div className="absolute inset-0 z-[150] flex flex-col bg-[#0a0a0f] text-slate-100 pointer-events-auto">`
);

content = content.replace(
/      \{devPasswordPrompt && \(\n        <div className="absolute inset-0 flex items-center justify-center bg-black\/80 z-50 p-4">/,
`      {devPasswordPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-4 pointer-events-auto">`
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched pointer events');
