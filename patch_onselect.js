import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/                    onSelectAtom=\{\(z\) => \{\n                         if \(engineRef\.current\?\.state\.state === 'menu'\) \{\n                             setMenuSelectedZ\(z\);\n                             setShowingPeriodicTable\(false\);\n                         \} else \{\n                             setSelectedAtomDetails\(z\);\n                         \}\n                    \}\}/,
`                    onSelectAtom={(z) => {
                         if (engineRef.current?.state.state === 'menu') {
                             setMenuSelectedZ(z);
                         }
                         setSelectedAtomDetails(z);
                    }}`
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched onSelectAtom');
