const fs = require('fs');

const dict = {
  'PRZESUŃ BY WYBRAĆ': 'SWIPE TO SELECT',
  '🏠 Do Menu': '🏠 To Menu',
  'WYJŚCIE DO MENU GŁÓWNEGO': 'EXIT TO MAIN MENU',
  'Wróć do Menu': 'Return to Menu',
  'Zakończ Podejście (Wróć do Menu)': 'End Run (Return to Menu)',
  'Statystyki': 'Statistics', // just in case
  'Ustawienia': 'Settings', // just in case
  'Giełda': 'Stock Market', // just in case
  'Księga Wiązań': 'Bond Book', // just in case
  'Tablica Mendelejewa': 'Periodic Table', // just in case
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

for (const [pl, en] of Object.entries(dict)) {
    // Only wrap if it's currently >TEXT< or >TEXT
    code = code.split('>' + pl + '<').join('>{tx("' + pl + '")}<');
    code = code.split('>' + pl).join('>{tx("' + pl + '")}');
    code = code.split(pl + '<').join('{tx("' + pl + '")}<');
    code = code.split("'" + pl + "'").join('tx("' + pl + '")');
    code = code.split(' ' + pl + '<').join(' {tx("' + pl + '")}<');
}

// Special case for "WYJŚCIE DO MENU GŁÓWNEGO" because it follows an icon
code = code.replace(/<\/span> WYJŚCIE DO MENU GŁÓWNEGO/g, '</span> {tx("WYJŚCIE DO MENU GŁÓWNEGO")}');

// Clean up double tx
code = code.replace(/tx\(tx\(\"(.*?)\"\)\)/g, 'tx(\"$1\")');
code = code.replace(/tx\(tx\(\'(.*?)\'\)\)/g, 'tx(\'$1\')');

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Menu translation pass completed');
