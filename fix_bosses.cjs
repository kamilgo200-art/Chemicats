const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
const dict = {
    'Tykwa węzowa z 4 oczami': 'Snake gourd with 4 eyes',
    'Pradawny Dąb': 'Ancient Oak'
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

for (const [pl, en] of Object.entries(dict)) {
    code = code.split("'" + pl + "'").join('tx("' + pl + '")');
}
fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed bosses translations');
