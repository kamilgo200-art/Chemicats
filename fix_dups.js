import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /"Budowa Atomu": "Atom Structure",\n/g;
let matches = 0;
content = content.replace(regex, (match) => {
    matches++;
    if (matches > 1) return '';
    return match;
});

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('fixed dups');
