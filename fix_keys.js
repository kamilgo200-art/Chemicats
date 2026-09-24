import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The dictionary is around lines 75-120
let lines = content.split('\n');
for (let i = 70; i < 130; i++) {
    if (lines[i] && lines[i].includes('": "')) {
        lines[i] = lines[i].replace(/\{tx\("/g, '').replace(/"\)\}/g, '');
    }
}
content = lines.join('\n');
fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('fixed');
