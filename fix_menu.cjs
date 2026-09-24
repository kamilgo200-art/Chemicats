const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const toReplace = [
    '🏠 Do Menu',
    '📊 Statystyki',
    '⚙️ Ustawienia',
    '📈 Giełda',
    '📖 Księga Wiązań',
    '⚛️ Tablica Mendelejewa',
    'Wróć do Menu',
    'Zakończ Podejście (Wróć do Menu)',
    'PRZESUŃ BY WYBRAĆ'
];

for (const pl of toReplace) {
    code = code.split(pl).join('{tx("' + pl + '")}');
    
    // In case they are inside JSX attributes (e.g. title="...") we shouldn't use {tx(...)} directly if it's already inside `{}` but the split above assumes they are raw text.
    // However, if they are already inside a {tx("...")} we might get {{tx("{tx("...")}")}}. We should clean that up.
}

code = code.replace(/\{tx\("\{tx\("(.*?)"\)\}"\)\}/g, '{tx("$1")}');
code = code.replace(/>\{tx\("\{tx\("(.*?)"\)\}"\)\}</g, '>{tx("$1")}<');

// Specifically handle the case if it became >{tx("🏠 Do Menu")}
// The above script does exactly what's needed.

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed specific menu items!');
